#!/usr/bin/env node
/**
 * Documentation integrity check.
 *
 * The rulebook is split across docs/ and cited from checklists, skills and the
 * agent contract. Nothing stops a citation going stale except this script, so
 * it runs in `npm run check` alongside the type gate.
 *
 * Checks:
 *   1. every module declares a unique `docs-module` id and `order`
 *   2. every declared rule id is unique
 *   3. every `[rule.id]` citation resolves to a declared rule
 *   4. no `§N` section references survive anywhere (the banned old syntax)
 *   5. every relative .md link resolves on disk
 *   6. STANDARDS.md is not stale
 *
 *   node scripts/check-docs.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");

/**
 * Reference material: it may cite rules, but it never declares them.
 * `learn/` is explicitly non-authoritative and is exempt from citation checks
 * too, since it predates the rule ids.
 */
const NOT_RULEBOOK = [join(DOCS, "learn"), join(DOCS, "how-to")];
const NOT_CITING = [join(DOCS, "learn")];

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith(".md") ? [full] : [];
  });

const rel = (f) => relative(ROOT, f).replace(/\\/g, "/");

/**
 * Blank out code — fenced blocks and inline spans — preserving line count so
 * reported line numbers stay accurate. A rule declaration or citation shown as
 * code is an example being documented, not a real one.
 */
const stripFences = (text) => {
  let inFence = false;
  return text
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return "";
      }
      return inFence ? "" : line.replace(/`[^`]*`/g, "");
    })
    .join("\n");
};
const errors = [];
const fail = (file, msg) => errors.push(`${rel(file)}: ${msg}`);

// Files that participate in the rulebook: docs/ (minus reference material),
// the agent contract, the readmes, and every skill.
const docFiles = walk(DOCS).filter((f) => !NOT_RULEBOOK.some((dir) => f.startsWith(dir)));
const skillFiles = existsSync(join(ROOT, ".claude")) ? walk(join(ROOT, ".claude")) : [];
const agentFiles = [join(ROOT, "AGENTS.md"), join(ROOT, "CLAUDE.md"), join(ROOT, "README.md")].filter(existsSync);
const citing = [
  ...walk(DOCS).filter((f) => !NOT_CITING.some((dir) => f.startsWith(dir))),
  ...skillFiles,
  ...agentFiles,
];

// ---------------------------------------------------------------- 1 + 2
const orders = new Map();
const rules = new Map();

for (const file of docFiles) {
  const text = stripFences(readFileSync(file, "utf8"));

  const mod = text.match(/<!--docs-module:\s*(.+?)\s*\|\s*order:\s*(\S+?)\s*-->/);
  if (mod) {
    if (orders.has(mod[2])) fail(file, `duplicate module order "${mod[2]}" (also ${rel(orders.get(mod[2]))})`);
    orders.set(mod[2], file);
  }

  for (const m of text.matchAll(/<!--rule:\s*([\w.-]+)\s*\|\s*tier:\s*([\w-]+)\s*-->/g)) {
    const [, id, tier] = m;
    if (rules.has(id)) fail(file, `duplicate rule id "${id}" (also declared in ${rel(rules.get(id).file)})`);
    if (!["required", "default", "reference", "checklist"].includes(tier)) {
      fail(file, `rule "${id}" has unknown tier "${tier}"`);
    }
    rules.set(id, { file, tier });
  }
}

// ---------------------------------------------------------------- 3 + 4 + 5
// A citation is any [bracketed.token] whose first segment is a known rule
// namespace — so [tokens], [components.scripting] and a typo like
// [tokens.semantik] are all checked, while stray brackets such as the "[x]" in
// a task list are ignored.
const CITATION = /\[([a-z][\w-]*(?:\.[\w-]+)*)\](?!\()/g;
const SECTION_REF = /§\s*\d/;
const MD_LINK = /\]\((\.[^)#\s]*?\.md)(?:#[^)]*)?\)/g;

const namespaces = new Set([...rules.keys()].map((id) => id.split(".")[0]));
let citations = 0;

for (const file of citing) {
  const raw = readFileSync(file, "utf8");
  const text = stripFences(raw);
  const isFragment = /<!--fragment:/.test(raw);

  for (const m of text.matchAll(CITATION)) {
    if (!namespaces.has(m[1].split(".")[0])) continue;
    citations++;
    if (!rules.has(m[1])) fail(file, `cites unknown rule id "${m[1]}"`);
  }

  if (SECTION_REF.test(text)) {
    const line = text.split(/\r?\n/).findIndex((l) => SECTION_REF.test(l)) + 1;
    fail(file, `line ${line}: uses a § section reference — cite the rule id instead (see [principles])`);
  }

  // Fragments are assembled into STANDARDS.md, so their links resolve from the repo root.
  const base = isFragment ? ROOT : dirname(file);
  for (const m of text.matchAll(MD_LINK)) {
    if (!existsSync(resolve(base, m[1]))) fail(file, `broken link → ${m[1]}`);
  }
}

// ---------------------------------------------------------------- 6
try {
  execFileSync(process.execPath, [join(ROOT, "scripts", "build-standards.mjs"), "--check"], { stdio: "pipe" });
} catch {
  errors.push("STANDARDS.md is stale — run: npm run docs:build");
}

// ---------------------------------------------------------------- report
const byTier = (t) => [...rules.values()].filter((r) => r.tier === t).length;

if (errors.length) {
  console.error(`\ndocs check FAILED — ${errors.length} problem${errors.length === 1 ? "" : "s"}:\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `docs check passed — ${rules.size} rules (${byTier("required")} required, ${byTier("default")} default, ` +
    `${byTier("checklist")} checklist, ${byTier("reference")} reference), ${citations} citations resolved across ${citing.length} files.`
);
