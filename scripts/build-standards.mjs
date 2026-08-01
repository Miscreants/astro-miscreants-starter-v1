#!/usr/bin/env node
/**
 * Assembles STANDARDS.md from the modules under docs/.
 *
 * Every source module declares its position with a header comment:
 *   <!--docs-module: rules/tokens | order: 04-->
 *
 * Modules are concatenated in `order`, the marker comments are stripped, and a
 * generated banner is prepended. STANDARDS.md is a build artifact — edit the
 * modules in docs/, never the assembled file.
 *
 *   node scripts/build-standards.mjs          write STANDARDS.md
 *   node scripts/build-standards.mjs --check  exit 1 if STANDARDS.md is stale
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const OUT = join(ROOT, "STANDARDS.md");

const MODULE_RE = /<!--docs-module:\s*(.+?)\s*\|\s*order:\s*(\S+?)\s*-->/;
const STRIP_RE = /^<!--(?:docs-module|nav):/;

/** Every .md under docs/, recursively. */
function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith(".md") ? [full] : [];
  });
}

const modules = [];
for (const file of walk(DOCS)) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(MODULE_RE);
  if (!match) continue; // README, workflow, learn/, how-to/ — not part of the assembled doc
  modules.push({
    file,
    id: match[1],
    order: match[2],
    body: raw
      .split(/\r?\n/)
      .filter((line) => !STRIP_RE.test(line))
      .join("\n")
      .trim(),
  });
}

modules.sort((a, b) => a.order.localeCompare(b.order));

const duplicate = modules.find((m, i) => i > 0 && m.order === modules[i - 1].order);
if (duplicate) {
  console.error(`Duplicate module order "${duplicate.order}" — ${duplicate.id}`);
  process.exit(1);
}

const banner = [
  "<!-- ============================================================",
  "     GENERATED FILE — DO NOT EDIT.",
  "",
  "     Assembled from the modules in docs/ by scripts/build-standards.mjs.",
  "     Edit the module, then run: npm run docs:build",
  "",
  "     Sources, in assembly order:",
  ...modules.map((m) => `       ${m.order}  docs/${relative(DOCS, m.file).replace(/\\/g, "/")}`),
  "     ============================================================ -->",
  "",
].join("\n");

/**
 * GitHub-compatible heading anchor: lowercase, drop punctuation, then replace
 * each remaining space with a hyphen — GitHub does not collapse runs, so
 * "Structure & conventions" becomes "structure--conventions".
 */
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s/g, "-");

// Map every declared rule id to the anchor of the heading it sits under, so
// `[components.scripting]` references become clickable in the assembled file.
const anchors = new Map();
const sections = [];
for (const m of modules) {
  const lines = m.body.split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    // Headings and rule declarations inside a fence are examples, not real ones.
    if (/^\s*(```|~~~)/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const heading = lines[i].match(/^(#{2,4})\s+(.+)$/);
    if (!heading) continue;
    const next = lines[i + 1]?.match(/<!--rule:\s*([\w.-]+)\s*\|\s*tier:\s*([\w-]+)\s*-->/);
    const anchor = slug(heading[2]);
    if (next) anchors.set(next[1], { anchor, tier: next[2], title: heading[2] });
    // The table of contents doesn't list itself.
    if (heading[1] === "##" && anchor !== "table-of-contents") sections.push({ title: heading[2], anchor });
  }
}

const toc = sections.map((s, i) => `${i + 1}. [${s.title}](#${s.anchor})`).join("\n");

const linkify = (text) =>
  text.replace(/\[([a-z][\w-]*(?:\.[\w-]+)*)\](?!\()/g, (match, id) =>
    anchors.has(id) ? `[${id}](#${anchors.get(id).anchor})` : match
  );

const assembled =
  banner + linkify(modules.map((m) => m.body).join("\n\n---\n\n")).replace("<!--toc-->", toc) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    console.error("STANDARDS.md is missing. Run: npm run docs:build");
    process.exit(1);
  }
  if (current !== assembled) {
    console.error("STANDARDS.md is stale — a docs/ module changed without regenerating.\nRun: npm run docs:build");
    process.exit(1);
  }
  console.log(`STANDARDS.md is current (${modules.length} modules).`);
  process.exit(0);
}

writeFileSync(OUT, assembled, "utf8");
console.log(`Wrote STANDARDS.md from ${modules.length} modules (${assembled.split("\n").length} lines).`);
