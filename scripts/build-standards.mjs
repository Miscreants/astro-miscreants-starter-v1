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

const assembled = banner + modules.map((m) => m.body).join("\n\n---\n\n") + "\n";

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
