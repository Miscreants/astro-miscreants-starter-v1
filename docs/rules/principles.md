<!--docs-module: rules/principles | order: 01-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 1. Why this exists

### Core principles

These ten principles are the spine of the system; every section below is an elaboration of one of them.

1. **The starter is the canonical source of truth.** When a rule or pattern changes, it changes in the starter first, then propagates to client repos.
2. **Client sites inherit the starter; proven improvements flow back.** Client repos start from a clean baseline and don't each carry their own fixes — a fix proven on a build gets ported back here, then pulled forward (§3.7).
3. **Pages stay thin and compose sections.** A `pages/*.astro` file reads like a table of contents: a `<Layout>` wrapping a short list of sections (§5.0).
4. **Sections own page-specific content and layout.** A `Section*` component encapsulates one chunk of a page — its landmark, content, and markup — so the page file stays readable (§5.0).
5. **Reusable UI lives in typed, open components.** Primitives (`Button`, `Card`, `Field`) are fully parameterized (typed props + slots), token-styled, and carry no page-specific content (§5).
6. **Semantic tokens only — never raw colors or one-off values.** Components reference roles (`bg-intent`, `text-fg-muted`), never hex or raw Tailwind neutrals (`text-gray-700`). Theme swaps "just work" through the cascade (§4).
7. **Accessibility, keyboard, focus, and reduced motion are authored from day one** — never retrofitted. Native semantics first, ARIA only where native falls short (§8).
8. **Content, SEO, schema, redirects, and site identity are centralized.** One source of truth each — `site.ts`, `Seo.astro`, `lib/schema.ts`, `_redirects` (§7).
9. **Static output is the default; client JS is added only when it earns its cost.** Astro ships zero JS by default; interactivity is progressively enhanced and degrades to working HTML when JS fails (§5.6, §10).
10. **The production deploy is lean; the repo keeps the full toolbox, docs, and examples.** Clients receive the *full* repo — every component, the showcase, and the docs — because their AI agent uses all of it to build pages. "Lean" applies to the **production deploy**, not the repo: demo/showcase routes are gated out of the live build, never stripped from the codebase (§10.8).

> **One way to do a thing.** Where two patterns exist, this doc picks one — consistency beats local cleverness. The runbook (§12) and checklists (§11) are *derived views* of these principles and the starter's actual state: when a principle or the starter changes, update §11/§12 in the **same** change so they never drift.

### How rules are labeled

- **Required** — reviewers gate on it; a violation blocks a PR. **A Required rule must be true of the starter**, or it appears in §14 with a date.
- **Default** — the standard choice; deviate only with a stated reason.
- **Allowed with reason** — permitted when justified and scoped.
- **Roadmap** — decided but not yet implemented; tracked in §15. Never gated on.

### Where rules live — no duplication

**A rule is stated once, in exactly one module under `docs/rules/`.** Everything else points at it:

| File | Job |
|---|---|
| `docs/rules/*.md` | the rules themselves — the only place a rule is *stated* |
| `docs/workflow.md` | the router: task → which modules to read → which verification tier |
| `docs/checklists/*.md` | what a reviewer gates on; cites rules, never restates them |
| `STANDARDS.md` | **generated** single-file assembly of every module, for review and print |
| `DESIGN.md` | the client's token *values* — brand decisions, not rules |
| `AGENTS.md` | the vendor-neutral agent contract and entry point; routes, states non-negotiables in one line each |
| `CLAUDE.md` | a pointer to `AGENTS.md`, nothing more |
| `.agents/skills/*` | executable procedures; state *what to check and at what severity*, never the rule itself |

A rule written twice drifts twice. If you find yourself explaining a rule outside `docs/rules/`, link to it instead.
