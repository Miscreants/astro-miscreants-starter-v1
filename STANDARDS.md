<!-- ============================================================
     GENERATED FILE — DO NOT EDIT.

     Assembled from the modules in docs/ by scripts/build-standards.mjs.
     Edit the module, then run: npm run docs:build

     Sources, in assembly order:
       00  docs/_standards-header.md
       01  docs/rules/principles.md
       02  docs/lifecycle.md
       03  docs/rules/structure.md
       04  docs/rules/tokens.md
       05  docs/rules/components.md
       06  docs/rules/component-templates.md
       07  docs/rules/seo.md
       08  docs/rules/accessibility.md
       09  docs/rules/content.md
       10  docs/rules/performance.md
       11  docs/rules/deployment.md
       12  docs/checklists/index.md
       13  docs/checklists/component.md
       14  docs/checklists/page.md
       15  docs/checklists/seo.md
       16  docs/checklists/accessibility.md
       17  docs/checklists/pre-launch.md
       18  docs/runbook.md
       19  docs/guardrails.md
       20  docs/conformance.md
       21  docs/roadmap.md
       22  docs/changelog.md
     ============================================================ -->
<!--fragment: underscore-prefixed module. Only ever read as the head of the generated STANDARDS.md, so its relative links resolve from the repo root, not from docs/.-->

# Miscreants Astro Build Standards

> The single source of truth for how we build Astro sites for clients.
> This lives in `astro-miscreants-starter-v1` because the starter is the canonical baseline every client repo inherits. When a rule here changes, it changes here first, then propagates to client repos.

**Status:** v2 — see [changelog](#changelog) for what changed.
**Audience:** anyone building or reviewing an Astro site at Miscreants.
**How to use:** read [principles](#why-this-exists) once, then work from the router. Reviewers gate PRs on [checklists](#checklists).
**Conformance:** every rule marked **Required** is true of the starter today, or it is listed in [conformance](#starter-conformance-gaps) with the date it was found. The doc never claims something the reference implementation doesn't do.
**Source:** this single file is **generated** from the modules in [`docs/`](./docs/README.md) — edit a module there and run `npm run docs:build`; never edit the assembled file. For task-scoped reading, enter through the router at [`docs/workflow.md`](./docs/workflow.md), which points at only the modules a given job needs.

### How to cite a rule

Every rule carries a **stable id** — `tokens.semantic-only`, `components.scripting`, `a11y.thresholds` — declared next to its heading:

```md
### Client-side scripting
<!--rule: components.scripting | tier: required-->
```

Reference one from anywhere in the repo by writing the id in square brackets: `[components.scripting](#client-side-scripting)`. Ids never change when sections move or get renumbered, and `npm run docs:check` fails on a reference to an id that doesn't exist. **Never cite a rule by section number** — that's the failure mode this replaced.

---

## Table of contents

1. [Why this exists](#why-this-exists)
2. [The build process (lifecycle)](#the-build-process-lifecycle)
3. [Project structure & conventions](#project-structure--conventions)
4. [Design tokens & styling](#design-tokens--styling)
5. [Components: the authoring standard](#components-the-authoring-standard)
6. [Component author templates](#component-author-templates)
7. [SEO, head & metadata](#seo-head--metadata)
8. [Accessibility](#accessibility)
9. [Content collections & data](#content-collections--data)
10. [Performance & build optimization](#performance--build-optimization)
11. [Deployment — static](#deployment--static)
12. [Checklists](#checklists)
13. [New-client setup runbook](#new-client-setup-runbook)
14. [Automated guardrails](#automated-guardrails)
15. [Starter conformance gaps](#starter-conformance-gaps)
16. [Roadmap](#roadmap)
17. [Changelog](#changelog)

---

---

## Why this exists
<!--rule: principles | tier: reference-->

### Core principles

These ten principles are the spine of the system; every section below is an elaboration of one of them.

1. **The starter is the canonical source of truth.** When a rule or pattern changes, it changes in the starter first, then propagates to client repos.
2. **Client sites inherit the starter; proven improvements flow back.** Client repos start from a clean baseline and don't each carry their own fixes — a fix proven on a build gets ported back here, then pulled forward ([structure.git](#git-branching-deploy--starter-lineage)).
3. **Pages stay thin and compose sections.** A `pages/*.astro` file reads like a table of contents: a `<Layout>` wrapping a short list of sections ([components.composition](#composition-model-pages--sections--components)).
4. **Sections own page-specific content and layout.** A `Section*` component encapsulates one chunk of a page — its landmark, content, and markup — so the page file stays readable ([components.composition](#composition-model-pages--sections--components)).
5. **Reusable UI lives in typed, open components.** Primitives (`Button`, `Card`, `Field`) are fully parameterized (typed props + slots), token-styled, and carry no page-specific content ([components](#components-the-authoring-standard)).
6. **Semantic tokens only — never raw colors or one-off values.** Components reference roles (`bg-intent`, `text-fg-muted`), never hex or raw Tailwind neutrals (`text-gray-700`). Theme swaps "just work" through the cascade ([tokens](#design-tokens--styling)).
7. **Accessibility, keyboard, focus, and reduced motion are authored from day one** — never retrofitted. Native semantics first, ARIA only where native falls short ([a11y](#accessibility)).
8. **Content, SEO, schema, redirects, and site identity are centralized.** One source of truth each — `site.ts`, `Seo.astro`, `lib/schema.ts`, `_redirects` ([seo](#seo-head--metadata)).
9. **Static output is the default; client JS is added only when it earns its cost.** Astro ships zero JS by default; interactivity is progressively enhanced and degrades to working HTML when JS fails ([components.scripting](#client-side-scripting), [perf](#performance--build-optimization)).
10. **The production deploy is lean; the repo keeps the full toolbox, docs, and examples.** Clients receive the *full* repo — every component, the showcase, and the docs — because their AI agent uses all of it to build pages. "Lean" applies to the **production deploy**, not the repo: demo/showcase routes are gated out of the live build, never stripped from the codebase ([deploy.static](#deployment--static)).

> **One way to do a thing.** Where two patterns exist, this doc picks one — consistency beats local cleverness. The runbook ([runbook](#new-client-setup-runbook)) and checklists ([checklists](#checklists)) are *derived views* of these principles and the starter's actual state: when a principle or the starter changes, update [checklists](#checklists)/[runbook](#new-client-setup-runbook) in the **same** change so they never drift.

### How rules are labeled

- **Required** — reviewers gate on it; a violation blocks a PR. **A Required rule must be true of the starter**, or it appears in [conformance](#starter-conformance-gaps) with a date.
- **Default** — the standard choice; deviate only with a stated reason.
- **Allowed with reason** — permitted when justified and scoped.
- **Roadmap** — decided but not yet implemented; tracked in [roadmap](#roadmap). Never gated on.

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

---

## The build process (lifecycle)
<!--rule: lifecycle | tier: reference-->

Every client engagement follows the same arc. Each phase has a checklist in [checklists](#checklists) and a step-by-step in [runbook](#new-client-setup-runbook).

```
┌─ 0. Kickoff ──────────────────────────────────────────────────────┐
│  Gather brand assets: colors, fonts, logos, design refs (Figma).   │
│  Choose the production host ([deploy.static](#deployment--static)) and record it. Static output.  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 1. Scaffold ─────────────────────────────────────────────────────┐
│  Clone starter → rename → set site identity, analytics, host cfg.  │
│  Record starterVersion + upstream remote ([structure.git](#git-branching-deploy--starter-lineage)).                   │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 2. Design system intake ─────────────────────────────────────────┐
│  Translate brand into @theme tokens (colors, fonts, radius,        │
│  motion). Decide the theme set. Rewrite DESIGN.md.                 │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 3. Componentize ─────────────────────────────────────────────────┐
│  Build page sections from starter primitives. New components       │
│  follow [components](#components-the-authoring-standard) + [templates](#component-author-templates). Reuse before you create.                          │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 4. Content & SEO ────────────────────────────────────────────────┐
│  Wire content collections, per-page meta via Seo.astro, JSON-LD    │
│  in lib/schema.ts, sitemap filter.                                 │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 5. Optimize & QA ────────────────────────────────────────────────┐
│  astro:assets images, fonts, budgets ([perf.budgets](#budgets--targets)), a11y audit, clean    │
│  `npm run check`.                                                  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 6. Launch ───────────────────────────────────────────────────────┐
│  Pre-launch checklist, deploy to the chosen host, verify prod.     │
└────────────────────────────────────────────────────────────────────┘
```

**Reuse-before-create rule:** before building any component or utility, search the starter. It ships 50+ components and a full token system. Most "new" needs are a prop away from an existing component.

---

## Project structure & conventions
<!--rule: structure | tier: reference-->

### Directory layout
<!--rule: structure.layout | tier: required-->

The canonical `src/` tree:

```
src/
├── components/          # PascalCase .astro, one component per file (flat)
│   └── _docs/           # showcase-only helpers (Preview, PropsTable)
├── content/             # Markdown/MDX content collections
├── content.config.ts    # Zod schemas for every collection
├── data/                # static data & site identity (site.ts, *.json)
├── demos/               # dev-only routes: /styleguide, /components, previews
├── images/              # source images imported through astro:assets
├── layouts/             # Layout.astro and any page-type layouts
├── lib/                 # logic helpers — JSON-LD builders (schema.ts)
├── pages/               # kebab-case routes (production routes ONLY)
├── styles/              # global.css
└── env.d.ts             # ambient types
```

Root files that are part of the deliverable:

```
astro.config.mjs      # site, output, integrations, demo-route gating
wrangler.jsonc        # Cloudflare host config (or netlify.toml)
functions/            # host functions, when a project needs them
public/               # _headers, _redirects, robots.txt, favicons, OG images
Doc/                  # per-component reference docs (.md)
DESIGN.md             # the client's token/brand contract
STANDARDS.md          # this file
AGENTS.md / CLAUDE.md # agent entry points — pointers, not rule copies ([principles](#why-this-exists))
```

**Rules:**
- **Flat `components/` directory** with semantic filename prefixes (`Card*`, `Nav*`, `Section*`). Only group into a subfolder when a component is a true family.
- **One component = one PascalCase file.** No `index.astro` component folders.
- **`src/demos/` is not `src/pages/`.** Anything in `pages/` ships. Demo, showcase and preview routes live in `demos/` and are injected only in dev ([deploy.static](#deployment--static)).
- **`lib/` for logic helpers**, **`data/` for static registries and site identity**. Neither goes inside `components/`.

### Naming conventions
<!--rule: structure.naming | tier: required-->

| Thing | Convention | Example |
|---|---|---|
| Component file | `PascalCase.astro` | `CardFeatured.astro` |
| Page section | `Section*` prefix | `SectionFeatures.astro` |
| Page file & route | `kebab-case` | `contact.astro` → `/contact` |
| Dynamic route | bracket placeholder | `[...slug].astro` |
| Data / lib file | `kebab-case` / `camelCase.ts` | `site.ts`, `schema.ts` |
| Content slug | `kebab-case`, matches frontmatter | `series-a.md` |
| CSS data hook | `data-<component>` kebab | `data-field="component"` |
| Semantic color | `--color-<role>` | `--color-fg-muted` |
| Typography utility | `@utility h1`, `text-body-lg` | — |

**Naming exception — `Hero`.** A page's opening section may be named `Hero` (or `Hero*`) rather than `SectionHero`; it is still a section in every other respect ([components.composition](#composition-model-pages--sections--components)) and still builds on `SectionMain` unless it is genuinely full-bleed. This is the only sanctioned exception to the `Section*` prefix.

### Path aliases (tsconfig)
<!--rule: structure.aliases | tier: required-->

The starter defines these — **every client repo keeps them identical** so imports are portable:

```jsonc
"paths": {
  "@components/*": ["src/components/*"],
  "@layouts/*":    ["src/layouts/*"],
  "@content/*":    ["src/content/*"],
  "@styles/*":     ["src/styles/*"],
  "@images/*":     ["src/images/*"],
  "@data/*":       ["src/data/*"],
  "@/*":           ["src/*"]
}
```

Prefer aliases over deep relative paths. Sibling imports may stay relative.

### Versions & engines
<!--rule: structure.versions | tier: default-->

**The starter's `package.json` is the version baseline** — read it there rather than trusting a number written in prose. The policy:

- Node is pinned in `engines` (currently `>=22.12.0`); keep it identical across client repos.
- The stack is Astro + Tailwind v4 (via `@tailwindcss/vite`) + TypeScript, with `astro-icon`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/partytown`.
- **Bump the starter first**, validate with `npm run check` and a production build, then roll clients forward. Never bump a major in a client repo first.
- Record the starter version a client repo was cut from ([structure.git](#git-branching-deploy--starter-lineage)) so upgrades are traceable.

### Required scripts — the type & build gate
<!--rule: structure.gate | tier: required-->

**Required.**

```jsonc
"scripts": {
  "dev":        "astro dev",
  "build":      "astro build",
  "preview":    "astro preview",
  "typecheck":  "astro check --minimumFailingSeverity warning",
  "docs:build": "node scripts/build-standards.mjs",
  "docs:check": "node scripts/check-docs.mjs",
  "check":      "npm run typecheck && npm run docs:check && npm run build"
}
```

**Why `astro check` and not `tsc --noEmit`:** `tsc` does not read `.astro` files at all, so a `tsc`-based gate type-checks almost none of an Astro codebase — missing required props, bad prop types and broken component usage all pass. `astro check` (from `@astrojs/check`, already a devDep) checks `.astro` **and** `.ts`, and runs the `astro sync` step itself, so no separate `astro sync` is needed.

`--minimumFailingSeverity warning` means compiler warnings — including accessibility warnings — fail the gate. That is deliberate and consistent with [a11y](#accessibility). Hints do not fail.

**`docs:check`** is the documentation half of the gate ([guardrails.docs-check](#documentation-integrity-check-required--shipped)): it fails the build on a citation to a rule id that doesn't exist, on a stale `STANDARDS.md`, on a broken relative link, and on any surviving `§` section reference.

`npm run check` is the local gate before every PR. See [conformance](#starter-conformance-gaps) for the starter's current conformance state.

### Environment variables & secrets
<!--rule: structure.env | tier: required-->

- **`PUBLIC_` prefix = public.** Only `PUBLIC_*` vars reach client code / the bundle (Astro rule). Everything else is build/server-only. **Never put a secret in a `PUBLIC_` var.**
- Read via `import.meta.env.PUBLIC_*` (client) or `import.meta.env.*` (build-only).
- **Commit `.env.example`** (keys, no values); **never commit `.env`**.
- Build-time vars are set in the host dashboard. Runtime secrets (e.g. a form Worker) live in the host's secret store / bindings ([components.forms](#forms--form--field-progressively-enhanced-and-hardened)) — never in the repo.
- **A missing required key must fail the build, not render `undefined`.** Until typed env lands ([roadmap](#roadmap)), assert required keys explicitly at config load.

> **Roadmap — `astro:env`.** Astro's typed env schema validates keys at build time and gives typed access with no manual assertions. Adopting it is the intended direction; until it ships in the starter, the `import.meta.env` rules above are the standard.

### Git, branching, deploy & starter lineage
<!--rule: structure.git | tier: required-->

- **Push source, never `dist`.** The host builds from source; `dist/` stays gitignored.
- **One branch deploys.** The production branch (usually `main`) is wired to the host's Git build — pushing it ships. **Know which *remote* is production before you push** (a repo often has an agency mirror *and* the client's production repo).
- Commit under the **correct author identity**; present-tense, conventional messages.
- Non-trivial work goes on a branch → PR → merge to the deploy branch.
- **Starter lineage (Required).** A client repo records the starter commit/version it was cut from — a `starterVersion` field in `package.json` — and keeps the starter as a second git remote (`upstream`). Improvements are made in the starter and pulled/cherry-picked forward. Resetting history to zero with no recorded lineage makes principle 2 impossible and is not acceptable.

### Repo as an agent platform
<!--rule: structure.agent-brief | tier: default-->

The client builds pages with an AI agent, so the repo must brief that agent — the docs are part of the deliverable ([principles](#why-this-exists), principle 10). Every client repo ships `AGENTS.md` (canonical) with `CLAUDE.md` pointing at it. That brief:

- names `DESIGN.md` (tokens/brand) and `STANDARDS.md` as **authoritative**, and defers to them rather than restating rules ([principles](#why-this-exists));
- lists the non-negotiables in one line each: semantic tokens only, accessibility required, pages compose sections, build sections on `SectionMain`, `astro:assets` for images, gate animated canvases;
- gives a **"how to add a page" recipe**: create `src/pages/<route>.astro` → wrap in `Layout` with `title`/`description`/`jsonLd` → compose existing sections → add new `Section*` components for new chunks → `npm run check`;
- says **where to look**: primitives in `components/`, the live showcase at `/components` (dev), per-component docs in `Doc/`, content in `content/`.

- points at the executable procedures in `.claude/` ([guardrails.skills](#agent-skills--commands-required--shipped)) — the guided component build and the pre-launch audit.

Keep it short and imperative — it's the agent's front door, not a manual.

---

## Design tokens & styling
<!--rule: tokens | tier: reference-->

**Get this right at intake (phase 2) and the rest of the build is fast.**

### The token model
<!--rule: tokens.model | tier: required-->

All design decisions live as CSS custom properties in `src/styles/global.css`, declared in a Tailwind v4 `@theme` block, with themes registered via `@custom-variant` and overridden per theme via `[data-theme="…"]`. Components never see raw values — only semantic roles.

**Semantic color roles (the contract).** Every client defines exactly these roles; only the values change:

| Role | Token | Purpose |
|---|---|---|
| Canvas | `--color-canvas` | page background |
| Surfaces | `--color-panel`, `--color-panel-muted` | cards/popovers; subtle surfaces + hover |
| Text | `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-fg-on-intent` | body; secondary; disabled/placeholder; text on an intent surface |
| Intent | `--color-intent`, `--color-intent-hover` | primary action |
| Borders | `--color-stroke`, `--color-stroke-strong` | hairline; emphasized divider |
| Focus | `--color-focus` | focus ring |
| Status | `--color-error`, `--color-success`, `--color-warning` | the only permitted accent hues |
| Decoration | `--pattern-stripe`, `--accent-line` | `.section-pattern` stripes; `[data-accent]` corner marks |

Decoration tokens are part of the contract because components consume them and they must flip per theme like any other role.

> **When a client has brand color**, add brand-named swatches (`--color-<brand>: …`) **separately** and *map* `--color-intent` to the primary. Keeping the brand palette distinct from `intent` lets the action color and decorative brand colors move independently, and lets `intent` flip per theme without disturbing the brand swatches.

**Theme registration & overrides.** Register variants, then re-declare the same role names per theme:

```css
@custom-variant dark  (&:where([data-theme="dark"],  [data-theme="dark"]  *));
@custom-variant brand (&:where([data-theme="brand"], [data-theme="brand"] *));

[data-theme="dark"] {
  --color-canvas: #0a0a0a;
  --color-fg: #f5f5f5;
  --color-intent: #f5f5f5;     /* monochrome intent flips with the theme */
  /* …every role… */
  color-scheme: dark;          /* don't forget — fixes native controls/scrollbars */
}
```

A single `data-theme` attribute on any ancestor flips every descendant through the cascade. No `prefers-color-scheme` magic — themes are explicit and author-controlled. `[data-theme="light"]` re-declares the defaults so a light island inside a dark ancestor forces itself back.

**Required:** every role is defined in every theme the project ships. A role that exists in one theme and not another is a bug.

### Per-client design decisions (set at intake)
<!--rule: tokens.per-client | tier: reference-->

Decide these and record them in the client's `DESIGN.md`.

| Decision | Starter stance | Note |
|---|---|---|
| Default theme | `light` | client may ship dark-default |
| Intent color | monochrome (`= fg`) | map to the brand primary when branded |
| Brand accents | none | add as separate `--color-<brand>` tokens |
| Border radius | **no global stance.** `--radius-card` / `--radius-pill` exist for the components that need a shape; most surfaces are square | rounding is a brand choice — never copy one client's stance to another |
| Depth | tonal by default; `--shadow-popover` / `--shadow-header` exist for floating UI | add more only if the design uses them |
| Fonts | three roles: heading / sans / mono | swap per brand; keep the three roles |

### Typography
<!--rule: tokens.typography | tier: required-->

Type is **fluid** via `clamp()` driven by container-query units (`cqi`), declared as `@utility` recipes so they're available as class names:

```css
@utility h1 {
  font-family: var(--font-heading);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.045em;
  font-size: clamp(2.75rem, 2.0357rem + 3.5714cqi, 5.25rem);  /* 44 → 84px */
  text-wrap: balance;
}
```

Each size interpolates linearly between two anchors: MIN at a 20rem container, MAX at 90rem.

**Rules:**
- **Always use `rem`, never `px`, for font sizes** (Required). `px` ignores the user's browser font-size preference. Figma px → rem: 16→1, 18→1.125, 24→1.5.
- Fluid type needs a query container. `body` is the default; drop `container-type: inline-size` (the `cq` / `container-large` utilities) on a wrapper to **re-anchor** the scale to that wrapper's width.
- Three font roles only: `--font-heading`, `--font-sans`, `--font-mono`.

### Layout & spacing utilities
<!--rule: tokens.layout | tier: default-->

Use the semantic layout `@utility` recipes instead of ad-hoc padding:

```css
@utility container-large  { @apply mx-auto w-full max-w-7xl; container-type: inline-size; }
@utility container-page   { @apply mx-auto w-full max-w-[90rem] px-site-margin; }
@utility section-gutter   { @apply px-4 md:px-12 lg:px-24; }
@utility section-padding  { @apply py-24 md:py-24; }   /* + -xs/-sm/-lg/-xl */
```

`container-page` is the page box every top-level element (sections, nav, footer) aligns to; its width cap is a per-client value, changed once in `global.css`. Sections reach for the rhythm utilities rather than raw `py-*`/`px-*`.

### Responsive contract
<!--rule: tokens.responsive | tier: required-->

**Mobile-first.** Author the base case for narrow viewports and add `md:` / `lg:` upward. Don't write desktop-first and undo it.

**Test widths (Required at page sign-off):** 320, 375, 768, 1024, 1440. **No horizontal scroll at 320px** on any page.

Two overflow rules that account for most real breakage:

- **A flex or grid child that must shrink needs `min-w-0`.** Flex items default to `min-width: auto`, so a wide child (a long unbroken string, a table, a pre block) forces the whole column wider than the viewport instead of wrapping.
- **`sr-only` does not clip a wide `<table>`.** Visually-hidden wrappers don't constrain an intrinsically wide descendant — wrap wide content in an `overflow-x: auto` container instead.

Anything intrinsically wide (tables, code blocks, diagrams) scrolls **inside its own container**; the page body never scrolls horizontally.

### Motion tokens
<!--rule: tokens.motion | tier: required-->

Durations and easings are centralized so "how long is a hover" has one answer:

```css
--cubic-default: cubic-bezier(0.625, 0.05, 0, 1);
--duration-default-half: 0.4s;
--timing-default-half: var(--duration-default-half) var(--cubic-default);
```

**Required:** components reference `--timing-*` / `--duration-*`. Don't hardcode `300ms` or invent a one-off easing. If a motion need isn't covered, add a token.

### Accessing tokens inside scoped `<style>` — the #1 gotcha
<!--rule: tokens.scoped-styles | tier: required-->

Astro scoped / `is:global` `<style>` blocks **cannot resolve** `@theme` tokens through `@apply` / `theme()` by default. **The standard, in priority order:**

1. **Prefer Tailwind utility classes in markup** (`class="bg-intent text-fg-on-intent"`). This is the default and always resolves tokens correctly.
2. **In a `<style>` block, reference the CSS variable directly** — custom properties *do* cascade into scoped styles:
   ```css
   .thing { background-color: var(--color-intent); color: var(--color-fg-muted); }
   ```
3. **If you need `@apply` or `theme()` inside the block,** add `@reference "../styles/global.css";` at the top.

**Never** hardcode a hex/rgba or a raw Tailwind neutral (`text-gray-700`) that duplicates a token — it won't follow theme changes. If a status needs a color, add a `--color-*` token.

**Allowed with reason:** a self-contained visual effect (canvas, gradient effect) may define local `--*` literals for values that are not theme roles — but they must be declared as custom properties at the component root, per theme where the effect is visible, and documented in the component header.

### Global base rules
<!--rule: tokens.base | tier: default-->

These live in `global.css` `@layer base`:

- **Cursor:** all interactive controls get `cursor: pointer`; disabled gets `not-allowed`.
- **Body defaults:** `body { @apply bg-canvas text-fg min-h-screen; }`
- **Orphans:** headings `text-wrap: balance`; body `text-wrap: pretty`.
- **Reduced motion:** every `transition`/`animation` respects `@media (prefers-reduced-motion: reduce)` ([a11y](#accessibility)).

---

## Components: the authoring standard
<!--rule: components | tier: reference-->

### Composition model: pages → sections → components
<!--rule: components.composition | tier: required-->

Treat the UI as **three tiers**, and let each page read like a table of contents.

**1. Primitives & blocks — *open* components (props + slots).**
Reusable UI units with a clear identity: `Button`, `Card`, `Field`, `Tag`. They live flat in `components/`, are fully parameterized (typed props + slots — [components.props](#props-typing)/[components.slots](#slots--default--named-with-introspection)), are styled only with tokens, and contain **no page-specific content**.

**2. Sections — *closed* components (little or no props).**
A whole page section: `Hero`, `SectionFeatures`, `SectionContact`. Lives flat in `components/` with a `Section*` prefix, **owns its own semantic `<section>` landmark**, and composes primitives + content inline. **Closed by default**: it bakes in its content and exposes *no* props. A section's job is to encapsulate a chunk of a page so the page file stays readable — not to be reusable.

> **Required — build sections on `SectionMain`.** `SectionMain.astro` is the section primitive; a new `Section*` renders it as its root rather than hand-rolling a wrapper. It supplies, in one place:
> - the semantic `<section>` element (pass `id` for anchor links and any `aria-*` — it spreads native attributes);
> - the centered `container-page` column, so every section lines up with the nav and footer;
> - the vertical rhythm presets — `padding` (`none`–`xl`), plus `paddingTop` / `paddingBottom` for asymmetric spacing;
> - the left/right side rules and an optional `borderTop` divider;
> - the horizontal content padding (`contentPadding`) and a `contentClass` hook on the inner column.
>
> Writing `<section class="section-gutter section-padding">` by hand drifts from the shared rhythm. Reach for bespoke markup **only** when a section is genuinely full-bleed or frames itself — an *allowed-with-reason* deviation, so state the reason.
>
> Components that manage their own grid and padding (`FlowSteps`, `FeatureScrollSpy`) still go *inside* `SectionMain`, with `padding="none" contentPadding="none"`.
>
> **Visual framing is a brand decision.** The side rules are currently unconditional; a client whose design has no section borders needs an opt-out prop rather than bespoke markup ([conformance](#starter-conformance-gaps)). Width and border color are already token-driven (`container-page`, `border-stroke`) and are tuned in `global.css`, not in the component.
>
> ```astro
> ---
> import SectionMain from "@components/SectionMain.astro";
> ---
> <SectionMain id="features" padding="lg">
>   <h2 class="h2">Features</h2>
>   <p class="text-body-lg text-fg-muted">…</p>
> </SectionMain>
> ```

**3. Pages — composition only.**
`pages/*.astro` reads like a table of contents. Push markup *down* into sections. **Avoid page-level `<style>`/`<script>`** — custom CSS or behavior in a page file is the signal it belongs in a section (or, if reusable, in `global.css` / an `@utility`).

```astro
<Layout title="…" jsonLd={homepageSchema}>
  <Hero />
  <SectionFeatures />
  <SectionContact />
</Layout>
```

**Open vs closed — the test:** *"Will this be reused with different content?"* Yes → **open** component with props/slots. No → **closed** section. When unsure, start closed; adding props later is easy. Don't parameterize a section "just in case."

**Components vs raw markup.**
The "extract after the 2nd use" rule holds, but don't atomize every wrapper — that's *less* clean in Astro (prop-drilling, a maze of tiny files, harder for humans and agents to read). Inside a section, **raw semantic HTML + Tailwind is expected and correct** for one-off layout.
- **Extract to a component** when the thing has **identity, behavior, or reuse**: reused ≥2×, *or* it carries interaction/state/script, *or* it has a nameable identity with variants (even used once, e.g. `Hero`), *or* it owns accessibility logic that must stay consistent.
- **Leave it as raw markup** when it's a purely-presentational one-off wrapper. Don't invent a `<Stack>`/`<Row>` for every `<div>`.

Rule of thumb: **components for *things*, raw markup for *arrangement*.**

**"Raw markup" ≠ inline CSS/JS.** Keep the three concerns separated:
- **Structure** → semantic HTML + Tailwind utilities.
- **Styling** → Tailwind utilities or a scoped `<style>` using `var(--token)` ([tokens.scoped-styles](#accessing-tokens-inside-scoped-style--the-1-gotcha)). **Never inline `style="…"`** — it bypasses tokens/theming, can't express hover/focus/media states, and isn't cacheable.
- **Behavior** → an Astro `<script>` (bundled, type-checked, tree-shaken; [components.scripting](#client-side-scripting)). **Never inline `onclick="…"`.**
- Long Tailwind class lists are the one real noise source — fix by extracting a recurring combo into an `@utility` recipe, not by reaching for inline `style`.

### Props typing
<!--rule: components.props | tier: default-->

**Default: `interface Props`** for ordinary object-shaped props. It gives the cleanest consumer IDE hints and is what most components need.

```astro
---
interface Props {
  label: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  hideLabel?: boolean;
  class?: string;
}
const { label, size = "md", hideLabel = false, class: className } = Astro.props;
---
```

**Use `type` when the shape genuinely isn't an object literal** — discriminated unions, polymorphism, intersections. Consistency is about the *default*, not about fighting the type system.

**Components that proxy a native element** extend native attributes so callers can pass any `data-*`, `aria-*` or handler without you enumerating them:

```astro
---
import type { HTMLAttributes } from "astro/types";

interface Props extends HTMLAttributes<"button"> {
  variant?: "primary" | "secondary" | "tertiary";
  withArrow?: boolean;
}
const { variant = "primary", withArrow = true, class: className, ...rest } = Astro.props;
---
```

**Polymorphic components (renders `<a>` *or* `<button>`).** Two acceptable forms:

1. **Extend the primary element and forward the few props of the other** (`href`, `target`, `rel`). This is what `Button.astro` does. Simple, good hints, easy to destructure. It does not stop a caller passing `href` and `disabled` together.
2. **A discriminated union** (`type Props = ButtonProps | AnchorProps`) makes invalid combinations unrepresentable. Stronger, at the cost of needing narrowing before destructuring in frontmatter.

Prefer (1) by default; reach for (2) when a component's invalid combinations are genuinely dangerous. **Do not** use a flat `HTMLAttributes<"button"> & HTMLAttributes<"a">` intersection — it makes every attribute optional on both and weakens the hints callers get.

### Defaults
<!--rule: components.defaults | tier: default-->

Set defaults in the destructure, not with `??` scattered through the template:

```astro
const { label = "Learn More", variant = "primary", arrowDirection = "right" } = Astro.props;
```

### Slots — default + named, with introspection
<!--rule: components.slots | tier: default-->

- **Default slot** for the main content; provide a fallback if optional: `<slot>{label}</slot>`.
- **Named slots** for distinct regions: `<slot name="title" />`, `<slot name="media" />`.
- **Introspect to wire conditional regions + ARIA.**
  - Cheap check: `Astro.slots.has("title")`.
  - **Robust check** when a slot may be passed but render empty — `has()` returns true even for falsy conditional content:
    ```astro
    const mediaContent = Astro.slots.has("media") ? await Astro.slots.render("media") : "";
    const hasMedia = mediaContent.trim().length > 0;
    ```
- Hide empty slotted regions with CSS `:empty { display: none }`.

**Prop vs slot:** plain string/number/boolean → **prop**. Rich markup the caller composes → **slot**. Don't accept HTML strings as props.

### Variants & polymorphism
<!--rule: components.variants | tier: default-->

- Variants are a **typed union prop** (`variant?: "primary" | "secondary" | "tertiary"`), resolved via `class:list` or a lookup map. Never a freeform string.
- Polymorphic tag selection: `const Tag = href && !disabled ? "a" : "button"`, then `<Tag …>`.

### Styling components
<!--rule: components.styling | tier: required-->

- Reach for **Tailwind utilities with semantic tokens** first (`bg-panel`, `text-fg-muted`, `border-stroke`).
- **Focus ring is mandatory and built-in** on every interactive element:
  ```
  focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
  ```
  The equivalent hand-rolled form, for a component that already uses a `<style>` block, is `box-shadow: 0 0 0 2px var(--color-canvas), 0 0 0 4px var(--color-focus);` on `:focus-visible`. **Pick one per component — never mix the two**, or the offsets fight each other.
- **`is:global` is allowed with reason and must be namespaced.** Components that style slotted children (Field, Modal, Media, sliders) may use it, but **only** scoped under a component data attribute: `[data-field="component"] { … }`. Never emit a bare global class — it leaks site-wide and collides. Document the reason in a comment above the block.
- **External links:** `target="_blank"` always ships `rel="noopener noreferrer"`, and the link's accessible name indicates it opens a new context.

**Class naming.** Match the file you're in rather than imposing one style everywhere:
- **Tailwind utilities** for atomic components (`Button`, `Tag`, `Icon`, `Avatar`) — a class list is shorter than a stylesheet.
- **BEM-style names** for components with meaningful internal structure and cross-element selectors, where a scoped `<style>` block is doing real work. The class root matches the component (`accordion__item`, `bento-card__header`).

**The Astro scoping trap.** Astro appends its scope hash to **both** ends of a descendant selector. If the ancestor you're keying off is rendered by a *different* component, the rule silently never matches:

```css
/* Wrong — Astro hashes [data-state] as well as .child, but the state
   attribute lives on a parent rendered elsewhere. Matches nothing. */
[data-state="open"] .child { … }

/* Right — keep the ancestor unhashed. */
:global([data-state="open"]) .child { … }
```

This is the most common cause of "my CSS isn't applying" in an Astro component, and it fails silently — no error, no warning, just no styling.

### Client-side scripting
<!--rule: components.scripting | tier: required-->

- **Drive behavior from `data-*` attributes**; keep ARIA/semantic attributes separate from scripting hooks (`data-modal-open` for JS; `role="dialog"` for a11y).
- **Guard single initialization per behavior, not per element.** A single shared flag means the first behavior to claim an element blocks every other behavior on that element, silently. Use a module-level `WeakSet`:

  ```ts
  const initialized = new WeakSet<HTMLElement>();

  function initTabs() {
    document.querySelectorAll<HTMLElement>("[data-tabs]").forEach((el) => {
      if (initialized.has(el)) return;
      initialized.add(el);
      // wire interactions here
    });
  }
  ```

  If you must use an attribute (for debugging visibility), **name it per behavior** — `data-tabs-initialized`, `data-modal-initialized` — never a generic shared flag.

- **Always clean up.** One `AbortController` per instance removes every listener at once:

  ```ts
  const controller = new AbortController();
  const { signal } = controller;

  el.addEventListener("click", onClick, { signal });
  window.addEventListener("resize", onResize, { signal });
  mediaQuery.addEventListener("change", onMotionChange, { signal });

  // teardown — on close/unmount, and before re-init after navigation
  controller.abort();
  ```
  Observers (`IntersectionObserver`, `ResizeObserver`, `MutationObserver`) and timers/rAF handles aren't covered by the signal — disconnect and cancel them in the same teardown.

- **Navigation lifecycle is conditional.** `astro:page-load` is emitted by Astro's client router (view transitions), which is **opt-in and not enabled in the starter**. Write the init function so a direct call is sufficient, and attach the listener only in projects that enable the router:
  ```ts
  initTabs();
  document.addEventListener("astro:page-load", initTabs); // no-op without the client router
  ```
  If a project enables the client router, re-init and teardown across navigations become **Required** review items.

- **Custom events bubble and are cancelable** so parents can intercept: `namespace:verb` — `form:success`, `tag:close`.

### Forms — `Form` + `Field`, progressively enhanced and hardened
<!--rule: components.forms | tier: required-->

`Form.astro` is the standard for every form:

- Works without JS (native submit to `action`); JS intercepts and `fetch`-posts, setting `data-form-status="submitting|success|error"`.
- Validation surfaces in each `Field`'s `[data-field-error]` region; the first invalid field receives focus.
- Success/error feedback in `role="status"` / `role="alert"` live regions.
- The component takes an `action` URL — **the backend is per-project** and is not shipped by the starter.

**Required for any form that ships to production.** A honeypot is a spam nuisance filter, not a security boundary. The endpoint must have:

- **Server-side schema validation** of every field (shape, type, length) — never trust the client.
- **Payload and field-length limits**, with an early reject on oversize bodies.
- **Rate limiting** per IP/session, with a sane burst allowance.
- **Origin/CSRF strategy** appropriate to the endpoint (origin allowlist at minimum).
- **Bot handling beyond the honeypot** — timing checks, or a challenge where abuse is likely.
- **Header-injection safety**: sanitize CR/LF out of anything interpolated into email headers, and cover it with a test.
- **Logging without unnecessary personal data**, plus a stated retention window.
- **Failure alerting** on the email/CRM integration — a form that silently stops delivering is worse than one that errors.

On a pure-static site the endpoint is a separate function/Worker mounted on a same-origin `/api/*` route. When hand-rolling email MIME, build the RFC 5322 string directly and sanitize header values rather than pulling in a MIME library that isn't runtime-compatible.

### Documentation & shared components
<!--rule: components.docs | tier: default-->

- **Per-component reference docs live in `Doc/<Component>.md`** — purpose, props, gotchas. Every reusable component has one, plus a header comment in the file itself.
- **The live showcase is `src/content/components/*.mdx`**, rendered at `/components` in dev. This is the canonical target for component documentation; `Doc/` is the current, simpler home and the two should not disagree.
- **`src/components/_docs/`** holds showcase-only helpers (`Preview`, `PropsTable`) — never product components.
- **Don't modify a shared component for a one-off page need.** Add a prop or build a page-local wrapper. If a shared primitive genuinely must change, that's a deliberate, reviewed change — ask first, don't drive-by edit.

### Prop & event naming
<!--rule: components.naming | tier: default-->

- **Booleans read as flags/state**, positive: `disabled`, `withArrow`, `hideLabel`, `isOpen` — prefer `is*/has*/with*`; avoid negatives.
- **Always accept a `class` passthrough** (`class?: string`, merged via `class:list`).
- **Variants are unions**, not freeform strings: `variant` / `size` / `tone`.
- **Custom events are `namespace:verb`**, bubbling + cancelable.

---

## Component author templates
<!--rule: templates | tier: reference-->

Three templates, because most components are not interactive and shouldn't be born with a script, a style block and a lifecycle they never use. **Start with the static template.** The starter ships `ComponentTemplateBasic.astro` / `ComponentTemplateAdvanced.astro` — keep them in sync with this section.

### Static component (the default)
<!--rule: templates.static | tier: reference-->

Props, slots, semantic markup, tokens. No script. No style block unless a utility genuinely can't express it.

```astro
---
/**
 * <ComponentName>
 * One line on what it's for.
 *
 * @prop label   - Visible text / accessible name.
 * @prop variant - Visual style. Default "primary".
 */
interface Props {
  /** Accessible name / visible label. */
  label: string;
  variant?: "primary" | "secondary";
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  class?: string;
}

const { label, variant = "primary", hideLabel = false, class: className } = Astro.props;

const styles = {
  primary: "bg-intent text-fg-on-intent",
  secondary: "bg-panel text-fg border border-stroke",
}[variant];
---

<div class:list={["inline-flex items-center gap-2 px-4 py-2", styles, className]}>
  {Astro.slots.has("icon") && (
    <span aria-hidden="true"><slot name="icon" /></span>
  )}
  <span class:list={[hideLabel && "sr-only"]}>
    <slot>{label}</slot>
  </span>
</div>
```

### Interactive component
<!--rule: templates.interactive | tier: reference-->

Adds state, ARIA, keyboard, a scoped style block only if needed, and the [components.scripting](#client-side-scripting) lifecycle. Pass an `id` in rather than generating a random one — generated ids churn build output and can't be targeted by the caller.

```astro
---
interface Props {
  /** Stable id; required when another element must reference this one. */
  id?: string;
  label: string;
  class?: string;
}
const { id = "disclosure", label, class: className } = Astro.props;
const panelId = `${id}-panel`;
---

<div class:list={["relative", className]} data-disclosure>
  <button
    type="button"
    class="… focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    aria-expanded="false"
    aria-controls={panelId}
    data-disclosure-trigger
  >
    {label}
  </button>
  <div id={panelId} hidden data-disclosure-panel>
    <slot />
  </div>
</div>

<style>
  /* Only when a utility can't express it. Tokens via var() — [tokens.scoped-styles](#accessing-tokens-inside-scoped-style--the-1-gotcha). */
  [data-disclosure-panel] { border-top: 1px solid var(--color-stroke); }
  @media (prefers-reduced-motion: reduce) {
    [data-disclosure-panel] { transition: none; }
  }
</style>

<script>
  const initialized = new WeakSet<HTMLElement>();

  function initDisclosure() {
    document.querySelectorAll<HTMLElement>("[data-disclosure]").forEach((root) => {
      if (initialized.has(root)) return;
      initialized.add(root);

      const trigger = root.querySelector<HTMLButtonElement>("[data-disclosure-trigger]");
      const panel = root.querySelector<HTMLElement>("[data-disclosure-panel]");
      if (!trigger || !panel) return;

      const controller = new AbortController();
      const { signal } = controller;

      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      }, { signal });

      // Teardown when the root leaves the DOM.
      root.addEventListener("disclosure:destroy", () => controller.abort(), { signal });
    });
  }

  initDisclosure();
  document.addEventListener("astro:page-load", initDisclosure); // no-op without the client router
</script>
```

### Native / polymorphic control
<!--rule: templates.polymorphic | tier: reference-->

Attribute passthrough plus the few props of the alternate element ([components.props](#props-typing)).

```astro
---
import type { HTMLAttributes } from "astro/types";

interface Props extends HTMLAttributes<"button"> {
  variant?: "primary" | "secondary";
  /** Render as an <a> pointing here instead of a <button>. */
  href?: string;
  /** Anchor-only; forwarded when `href` is set. */
  target?: string;
  /** Anchor-only; defaults to "noopener noreferrer" when target="_blank". */
  rel?: string;
}

const {
  variant = "primary",
  href,
  type = "button",
  target,
  rel,
  disabled = false,
  class: className,
  ...rest
} = Astro.props;

const Tag = href && !disabled ? "a" : "button";
const anchorRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
---

<Tag
  {...rest}
  {...(Tag === "a" ? { href, target, rel: anchorRel } : { type, disabled })}
  class:list={["… focus-visible:ring-2 focus-visible:ring-focus", className]}
>
  <slot />
</Tag>
```

---

## SEO, head & metadata
<!--rule: seo | tier: reference-->

### Site identity — one source of truth
<!--rule: seo.identity | tier: required-->

`src/data/site.ts` owns site-wide identity:

```ts
export const site = {
  name: "Your Site Name",
  url: "https://example.com",
  description: "One-line description…",
  ogImage: "/og.jpg",
  logo: "/logo.png",
  twitter: "",
  sameAs: [] as string[],
};
```

**Required:** `astro.config.mjs` **imports** this value for its `site` field rather than repeating the URL. Astro loads the config through Vite, so importing a `.ts` module works. Two copies of the domain plus a checklist item to keep them in sync is not a single source of truth.

```js
import { site } from './src/data/site';

if (site.url.includes('example.com')) {
  throw new Error('site.url is still the placeholder — set the real domain before building.');
}

export default defineConfig({ site: site.url, /* … */ });
```

The placeholder guard means a build can't ship with `example.com` canonicals.

### The `Layout.astro` contract
<!--rule: seo.layout-contract | tier: required-->

Every page goes through `Layout`. Its props are the page's whole head surface:

| Prop | Type | Purpose |
|---|---|---|
| `title` | `string` | page title |
| `description` | `string?` | meta description; falls back to `site.description` |
| `image` | `string?` | social image; falls back to `site.ogImage`, resolved absolute |
| `ogType` | `"website" \| "article"` | `article` for posts |
| `noindex` | `boolean?` | drafts and internal pages |
| `jsonLd` | `object \| object[]` | structured data from `lib/schema.ts` |
| `theme` | `"light" \| "dark" \| "brand"` | sets `data-theme` on the document root |
| `frontmatter` | `object?` | auto-populated for `.md`/`.mdx` pages using `layout:` |

Markdown pages pass their frontmatter under `frontmatter` while `.astro` pages pass props flat; the layout falls back so both work. **Pages set head metadata only through these props** — never by emitting tags directly.

### The `Seo.astro` component
<!--rule: seo.component | tier: reference-->

`src/components/Seo.astro` owns all head metadata:

```ts
interface Props {
  title: string;
  description?: string;
  ogType?: "website" | "article";
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
```

It emits `<title>` + description, canonical (computed from `Astro.url`, absolute against `Astro.site`), `robots` when `noindex`, favicons, full Open Graph, Twitter Card, and one `<script type="application/ld+json">` per schema.

### JSON-LD via `lib/schema.ts`
<!--rule: seo.json-ld | tier: default-->

Structured data lives in `src/lib/schema.ts` as **pre-built graphs + builder functions**, not inline in pages:

- **`homepageSchema`** — a `@graph` with `Organization` + `WebSite` + `WebPage`, built from `site.*`.
- **`articleSchema({ path, title, description, datePublished, … })`** — `Article` + `BreadcrumbList`, with an optional `breadcrumbParent`.
- **Cross-referencing via `@id`**: every node has a stable `@id` (`${site.url}/#organization`) and others reference it — one canonical Organization/WebSite, no duplication.

**Standard:** homepage emits Organization + WebSite; content detail pages emit Article + BreadcrumbList; FAQ pages emit FAQPage. Extend `schema.ts` per project rather than inlining schema in pages.

### Sitemap
<!--rule: seo.sitemap | tier: default-->

`@astrojs/sitemap` is wired with a filter that excludes internal routes:

```js
const SITEMAP_EXCLUDE = ['/styleguide', '/components', '/tve-preview'];
```

Note what this does **not** do: demo routes are already excluded from production because they live in `src/demos/` and are never injected in a normal build ([deploy.static](#deployment--static)). The filter is a **safety net** for routes that do ship but shouldn't be indexed. Extend it per project.

### Staging & preview: indexing control
<!--rule: seo.staging | tier: required-->

**`Disallow: /` in robots.txt is not indexing control.** A disallowed URL can still be indexed from external links, and a crawler blocked by robots.txt never reads a page-level `noindex`.

**Required — a non-production deployment uses at least one of:**

1. **Access control** — host-level password/SSO (Cloudflare Access, Netlify password protection). Strongest, and the default choice for client review sites.
2. **`X-Robots-Tag: noindex, nofollow` response header** on the preview host, with crawling still allowed so the directive is actually read.
3. **`<meta name="robots" content="noindex">`** on every page (`noindex` through `Layout`), crawling allowed.
4. **A non-public preview URL** that is never linked publicly.

`Disallow: /` may accompany these as a secondary signal, never as the primary control.

> **Implementation caveat:** `public/_headers` ships to production too, so a blanket `X-Robots-Tag: noindex` there would deindex the live site. Apply it through a host-level rule scoped to preview deployments, or emit it from a build-time environment flag — and verify the production response headers before launch.

### Drafts & announcements
<!--rule: seo.drafts | tier: required-->

- `draft: true` content sets `noindex`, and is excluded from listings and the sitemap.
- Announcements are a scheduled collection (`startsAt`/`endsAt`/`enabled`/`priority`); the layout picks the top active one at build time.

### robots.txt & error pages
<!--rule: seo.robots-404 | tier: default-->

- Ship **`public/robots.txt`**: allow crawling, link the sitemap (`Sitemap: https://<site>/sitemap-index.xml`).
- Ship a styled **`src/pages/404.astro`** using `Layout`. Both hosts serve it for unknown static routes.

### Astro/host gotchas (pure-static)
<!--rule: seo.host-gotchas | tier: reference-->

- **Don't call a syntax highlighter directly in component frontmatter** (e.g. `shiki.codeToHtml`) — it can silently truncate static HTML on some hosts. Use `<Code />` from `astro:components`.
- For **pure-static** sites, **stay adapter-free** so Astro's default Sharp image service runs at build. A host adapter's image service may be a passthrough that emits mislabelled formats.
- A path matching a dynamic route but excluded from `getStaticPaths` can 500 in a host's dev runtime with a misleading error — **verify routing against a production build**, not dev ([guardrails.local-dev](#local-development-notes)).
- Pre-launch, `site` / JSON-LD / canonical URLs may intentionally point at the production domain before DNS cutover. Don't "fix" them back to staging.

---

## Accessibility
<!--rule: a11y | tier: reference-->

Accessibility is a build requirement, not a phase.

**Every component ships with the accessibility behavior it needs — semantics, keyboard, focus and reduced motion — from the start.** Prefer native HTML; add ARIA only where native semantics are insufficient. Redundant or incorrect ARIA is worse than none.

### Semantic HTML first
<!--rule: a11y.semantics | tier: required-->
Use `<nav>`, `<button>`, `<dialog>`, `<header>`, `<main>`, `<details>` before `<div role="…">`. Add an explicit `role` only when no element fits.

### Labels & state
<!--rule: a11y.labels | tier: required-->
- Icon-only controls get an accessible name (`aria-label` or visually-hidden text). Decorative icons get `aria-hidden="true"`.
- Toggles set `aria-expanded` + `aria-controls`; checkable items `aria-checked`; tabs `aria-selected`.
- Every landmark of a repeated type gets a distinguishing `aria-label`.
- Meaningful images get real `alt`; decorative get `alt=""`.

### Keyboard support
<!--rule: a11y.keyboard | tier: required-->

Required keys are what the pattern actually requires; optional keys are worth adding but not gated.

| Component | Required | Optional / pattern-dependent |
|---|---|---|
| Button | Enter / Space (native) | — |
| Modal / Dialog | Esc closes; focus trapped while open; focus returns to the trigger | — |
| Tabs | Tab reaches the tablist; Arrow keys move between tabs; roving `tabindex` | Home/End; manual activation (Enter/Space) instead of automatic — pick one and be consistent |
| Accordion | Enter/Space toggles each header (native `<button>`) | Up/Down between headers, Home/End — optional in the ARIA pattern. Esc is **not** part of it |
| Disclosure | Enter/Space toggles | — |
| Menu / Menu button | ArrowDown opens and focuses the first item; Esc closes and returns focus | Type-ahead; Home/End |
| Combobox | Arrow keys move through options; Enter selects; Esc closes | — |

Automatic tab activation (selection follows focus) is appropriate when showing a panel is instantaneous; manual activation is required when it isn't. Choose per project and apply consistently.

### Focus management
<!--rule: a11y.focus | tier: required-->
- Never drop focus to `<body>`. On close/remove, move focus to the next logical element.
- Dialogs store `document.activeElement` on open and restore on close.
- Roving tabindex: only the active item is `tabindex="0"`.
- **Focus must not be obscured** by sticky headers, banners or footers (WCAG 2.2 SC 2.4.11). Use `scroll-margin-top` matched to the sticky header height.

### Reduced motion
<!--rule: a11y.reduced-motion | tier: required-->
Wrap every animation in `@media (prefers-reduced-motion: reduce)`, **and** gate JS/GSAP animations on `matchMedia("(prefers-reduced-motion: reduce)")`, updating on its `change` event.

### Measurable thresholds
<!--rule: a11y.thresholds | tier: required-->

Reviewers check numbers, not adjectives:

| Check | Threshold |
|---|---|
| Text contrast | 4.5:1 (3:1 for ≥24px, or ≥19px bold) |
| Non-text contrast — control boundaries, focus indicators, meaningful graphics | 3:1 |
| Target size | 24×24 CSS px minimum (SC 2.5.8); 44×44 preferred for primary touch targets |
| Reflow | usable at 320px equivalent — 400% zoom at 1280px, no horizontal scroll (SC 1.4.10) |
| Text spacing | no clipping with increased line-height/letter/word spacing (SC 1.4.12) |
| Forced colors | usable in `forced-colors: active`; don't rely on background images for meaning |

Every threshold is checked **in each theme the project ships**.

### Page-level
<!--rule: a11y.page | tier: default-->
- Skip link to `#main` in `Layout.astro`.
- Logical heading order, no skipped levels.
- **One `h1` per page** — an agency convention for clarity and SEO, not a WCAG requirement. Deviate only with a reason.
- Visible focus everywhere.

---

## Content collections & data
<!--rule: content | tier: reference-->

### Collections (`content.config.ts`)
<!--rule: content.collections | tier: required-->
- Every collection is **Zod-typed**. No untyped content.
- **Use `reference()` for taxonomies** so a typo'd tag fails at build, not in production.
- **Use `image()` in the schema** for content images so they go through `astro:assets`. Paths resolve relative to the data file.
- **Model dual internal/external entries** where useful (an `externalUrl` that links off-site and skips detail-page generation).
- Keep schemas lean — add fields when real content needs them.
- A frontmatter `slug` field **overrides** the glob entry id; route on `entry.id` unless you deliberately want that.

### Content-source seam
<!--rule: content.source-seam | tier: default-->

Components and sections take **plain data props** — arrays and objects with a shape the component owns. The mapping from a source (files today, a CMS tomorrow) to that shape lives in a loader or a `lib/` function, never inside the component.

This costs nothing now and means adding a CMS later is a loader change, not a component rewrite. When a project does add a CMS, keep the seam: file-based content and API content produce the same shape.

### Data registries (`src/data/*.ts`)
<!--rule: content.registries | tier: default-->
- Centralize lookup tables (footer links, nav menus) and site identity. **No hardcoded link lists inside components.**
- Filter placeholder entries (`href: "#"`) at render time.
- **Validate references at build time** — prefer a thrown error over a silent fallback.

### Draft handling
<!--rule: content.drafts | tier: required-->
`draft: true` must (a) set `noindex`, and (b) be excluded from sitemap and index listings.

### `.md` vs `.mdx` — pick by whether the author places components
<!--rule: content.md-vs-mdx | tier: default-->
- **Default to `.md`** for editorial content — prose with frontmatter and standard elements. Lighter build, authors need zero component knowledge.
- **Use `.mdx` only when the content must embed components** — importing and placing components inline, or needing JSX expressions.
- You can restyle standard elements in plain `.md` via the `components` prop when rendering `<Content />` — so reserve `.mdx` for when the *author* places components, not merely to restyle output.
- **In the starter:** `content/faq` and `content/announcements` are `.md`; `content/components` is `.mdx` because each entry renders live previews of the component it documents.

---

## Performance & build optimization
<!--rule: perf | tier: reference-->

### Images — use `astro:assets`
<!--rule: perf.images | tier: required-->
- **Import from `src/images/` and render with `<Image>`/`<Picture>`.** Don't reference raw `/public` paths for content images.
- Put only un-optimized assets (favicons, OG/social images) in `public/`.
- Always set `width`/`height` (or let `<Image>` infer) to prevent CLS. `loading="lazy" decoding="async"` below the fold.
- **Don't lazy-load the LCP image.** The hero gets `loading="eager"` + `fetchpriority="high"`.

### Fonts — self-hosted
<!--rule: perf.fonts | tier: required-->
**Required: self-host WOFF2.** No third-party font requests; no stack that names a family with no `@font-face` behind it.

- **Prefer variable fonts** when the family and browser support allow — one file per family covering all weights.
- **`@fontsource-variable/*` is the default source** when licensing and availability permit. Client-licensed, modified or proprietary faces are self-hosted directly — that is expected agency work, not a deviation.
- Subset to the character sets the site actually uses.
- Set `font-display` deliberately (`swap` for body, `optional` where a swap would be disruptive).
- Preload only the face(s) in the LCP element.
- Every family named in `--font-heading/-sans/-mono` must actually be loaded, or the stack silently falls through to a system font that only some machines have.

### CSS inlining
<!--rule: perf.css | tier: default-->
The starter sets `build: { inlineStylesheets: 'always' }` — page CSS is inlined into `<head>` instead of emitting a render-blocking request. That's a material FCP/LCP win on small static sites.

**It is a trade, not a free win:** the shared stylesheet is duplicated into every HTML document and cannot be cached across navigations. **Re-measure and consider `'auto'`** when a site passes roughly 20 routes, or the shared CSS passes roughly 15KB gzipped. Record the decision in the project's notes.

### Navigation prefetch
<!--rule: perf.prefetch | tier: default-->
**Default: enable Astro's built-in `prefetch`** with `defaultStrategy: 'hover'` for a near-free navigation win, and `prefetchAll` on small sites. Use `viewport` strategy only for a short, high-intent link set (primary nav) — it costs bandwidth on long pages. Not yet configured in the starter ([conformance](#starter-conformance-gaps)).

### Third-party scripts
<!--rule: perf.third-party | tier: default-->
- **Gate tracking behind cookie consent** before launch in regulated regions.
- Analytics IDs come from env vars; the tag is injected only when the var is set.
- **Partytown is preferred for third-party scripts that survive it** — after testing consent flow, page navigation, and conversion/goal events end to end. Several vendors need forwarding configuration or don't work in a worker at all; for those, a deferred main-thread integration is correct. Test per vendor, don't assume.
- **Heavy embeds use a facade** — YouTube, maps, chat: render a lightweight placeholder and load the real iframe/SDK on interaction or when scrolled into view.

### Animated canvases & heavy client JS
<!--rule: perf.canvas | tier: required-->

An animated `<canvas>` driven by a `requestAnimationFrame` loop is the most common cause of a poor mobile score on an otherwise fast static site. The signature is a low mobile Performance score with **green LCP and CLS** — the cost is TBT/INP from a perpetual loop plus a one-time shader/compile task in the load window. Lighthouse often rasterizes WebGL in software, so "GPU" effects land on the main thread.

**Required for any animated canvas or long-lived rAF loop:**
- Respect `prefers-reduced-motion` — draw a single static frame, never start the loop.
- Pause when offscreen (`IntersectionObserver`) and when the tab is hidden (`visibilitychange`).
- Provide a static fallback frame that looks finished, not broken.
- Never initialize a non-critical visual effect during the LCP window — defer setup/compile to idle.
- Tear the loop down on teardown ([components.scripting](#client-side-scripting)); never leave an unbounded loop running.

**Defaults (deviate with a stated reason and a measurement):**
- **Static single frame at ≤768px.** The breakpoint is a starter default and may be tuned per project.
- **Cap the frame rate** (~24–30fps) on desktop, advancing by *real elapsed time* so visual speed stays fps-independent.
- **Trim shaders** to what's used; smaller source compiles faster.
- **Guard and rAF-batch `ResizeObserver`** so layout settling doesn't thrash buffer reallocation.
- Consider device pixel ratio, `prefers-reduced-data` and battery cost when sizing the effect.

**Measure, don't assume:** set a frame-time budget per effect and profile on a representative mid-range device before shipping it.

### Budgets & targets
<!--rule: perf.budgets | tier: required-->

Lighthouse scores are noisy and environment-dependent. Gate on **budgets**, and use the composite score as a smoke test.

| Metric | Budget |
|---|---|
| LCP (mobile, throttled) | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| Longest main-thread task in the load window | ≤ 200ms |
| First-party JS (initial route, gzipped) | ≤ 50KB |
| Third-party JS (initial route, gzipped) | ≤ 50KB |
| Above-the-fold image weight | ≤ 300KB |
| Font files / bytes (initial route) | ≤ 3 files, ≤ 150KB |
| HTML + CSS per document (gzipped) | ≤ 60KB |

Lighthouse smoke targets on key templates (home, a content detail page, a listing page): Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO = 100.

`npm run check` passes clean — zero errors, zero warnings.

**Don't strip core interactive components to chase a number.** They're commonly used; optimize around them.

---

## Deployment — static
<!--rule: deploy.static | tier: required-->

Default target is **pure-static**, deployed by Git build. Choose the host at kickoff and record it; every later step refers to "the production host."

| Target | When |
|---|---|
| **Cloudflare Workers static assets** | preferred Cloudflare target for new projects |
| **Cloudflare Pages** | supported; existing projects stay put |
| **Netlify static hosting** | equally supported |

- Both hosts: build command `npm run build`, output `dist/`.
- **Stay adapter-free for static sites** so Astro's Sharp image service runs at build. Keep `output: 'static'`, no adapter. An SSR adapter is only for SSR.
- **Per-host config (the only real difference):**
  - **Cloudflare** → `wrangler.jsonc`: `assets.directory: "./dist"`, no `main` Worker, `compatibility_flags: ["nodejs_compat"]`, `observability.enabled`.
  - **Netlify** → `netlify.toml`: `[build] command = "npm run build"`, `publish = "dist"`.
- **Redirects — portable.** Ship `public/_redirects`; both hosts read the same format (`/old  /new  301`). **Essential for migrations:** map every old URL to its new path so link equity survives the cutover.
- **Headers & caching — portable.** Ship `public/_headers`: `/_astro/*` gets `Cache-Control: public, max-age=31536000, immutable` (hashed filenames), plus baseline security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a conservative CSP). Remember these apply to production ([seo.staging](#staging--preview-indexing-control)).
- Forms → a separate function/Worker with an email binding ([components.forms](#forms--form--field-progressively-enhanced-and-hardened)).
- **Demo/showcase routes are gated, not deleted.** `/styleguide`, `/components` and previews live in `src/demos/`, injected by an integration only in `astro dev` or when `SHOW_DEMOS=true`. The client keeps the full showcase locally; production deploys without it.

---

## Checklists
<!--rule: checklists | tier: reference-->

---

### New component
<!--rule: checklist.component | tier: checklist-->
- [ ] Searched the starter first — not already covered by a prop on an existing component
- [ ] Typed props: `interface Props` (or `type` for a union/polymorphic shape, [components.props](#props-typing)); typed-union variants; defaults in the destructure
- [ ] Native-attribute passthrough (`extends HTMLAttributes<…>` + `...rest`) if it proxies an element
- [ ] Slots: default with fallback; named for regions; render-and-inspect for conditional wrappers
- [ ] Only semantic tokens / Tailwind utilities — **zero hardcoded hex AND zero raw Tailwind neutrals**
- [ ] Focus ring on every interactive element
- [ ] Native semantics first; ARIA only where native falls short; landmark labels; decorative icons `aria-hidden`
- [ ] Keyboard per [a11y.keyboard](#keyboard-support) for the pattern; roving tabindex where applicable
- [ ] Focus management on open/close/remove; focus not obscured by sticky UI
- [ ] `@media (prefers-reduced-motion)` + JS `matchMedia` guard for any animation
- [ ] Animated `<canvas>`/rAF: reduced-motion static, paused offscreen/hidden, static fallback, deferred compile ([perf.canvas](#animated-canvases--heavy-client-js))
- [ ] Per-behavior init guard (`WeakSet` or namespaced flag) + `AbortController` teardown ([components.scripting](#client-side-scripting))
- [ ] `is:global` (if used) namespaced under `[data-component]`, with the reason in a comment
- [ ] Scoped styles use `var(--token)` or `@reference`
- [ ] Header comment + `Doc/<Component>.md` entry
- [ ] `npm run check` passes

---

### Page done
<!--rule: checklist.page | tier: checklist-->
- [ ] Page is a thin composition — no page-level `<style>`/`<script>`
- [ ] Every section builds on `SectionMain` (or the deviation is stated)
- [ ] Renders correctly at 320 / 375 / 768 / 1024 / 1440; no horizontal scroll at 320
- [ ] Renders correctly in every theme the project ships
- [ ] Content extremes handled: long headings, empty optional regions, missing images
- [ ] All internal links resolve; external links have `rel="noopener noreferrer"`
- [ ] Images go through `astro:assets`; LCP image is eager + `fetchpriority="high"`
- [ ] One `h1`; logical heading order
- [ ] [checklist.seo](#seo-per-page--template) SEO and [checklist.a11y](#accessibility-audit-per-page) a11y passes done for this template

---

### SEO (per page / template)
<!--rule: checklist.seo | tier: checklist-->
- [ ] `title` (+ `description`) passed to Layout, or set via frontmatter
- [ ] Canonical resolves correctly (absolute, no trailing-slash mismatch)
- [ ] OG + Twitter present; OG image absolute and exists
- [ ] `noindex` for drafts/internal pages
- [ ] JSON-LD from `lib/schema.ts` for the page type
- [ ] In the sitemap if public; excluded if draft/internal

---

### Accessibility audit (per page)
<!--rule: checklist.a11y | tier: checklist-->
- [ ] Keyboard-only pass: every control reachable/operable; visible focus throughout; focus never obscured
- [ ] Screen-reader pass on nav, forms, dialogs
- [ ] Skip link works
- [ ] Contrast meets [a11y.thresholds](#measurable-thresholds) thresholds in every active theme — text **and** non-text
- [ ] Target sizes meet [a11y.thresholds](#measurable-thresholds)
- [ ] 400% zoom / 320px reflow with no horizontal scroll
- [ ] `forced-colors: active` renders usably
- [ ] Reduced-motion: animations disabled/simplified with the OS setting on
- [ ] Forms: labels wired, errors in `aria-live`, `aria-invalid` on bad fields
- [ ] Images: correct `alt` (or `alt=""` if decorative)

---

### Pre-launch
<!--rule: checklist.pre-launch | tier: checklist-->

> **Executable form: the `launch` skill ([guardrails.skills](#agent-skills--commands-required--shipped))**, which runs this list in `staging` or `production` mode against the built output. Run it, then work the report; this list stays the source of truth for *what* is checked.

- [ ] `npm run check` clean (`astro check` + build)
- [ ] Real domain set in `data/site.ts`; the config guard passes ([seo.identity](#site-identity--one-source-of-truth))
- [ ] Budgets met on home + 2 representative templates ([perf.budgets](#budgets--targets))
- [ ] All active `data-theme`s render correctly; no contrast regressions
- [ ] Sitemap generated + filtered; `robots.txt` correct for production
- [ ] **Staging/preview is protected by [seo.staging](#staging--preview-indexing-control) method 1–4** — not robots.txt alone; production headers verified to *not* carry `noindex`
- [ ] Migrations: `public/_redirects` maps every old URL → new
- [ ] `public/_headers`: `/_astro/*` immutable cache + security headers
- [ ] Analytics gated behind consent where required; real IDs via env
- [ ] Form endpoint meets [components.forms](#forms--form--field-progressively-enhanced-and-hardened) security requirements; real email received; failure alerting live
- [ ] Production build excludes demo routes (plain `npm run build` logs "Demo routes excluded")
- [ ] 404 page present and styled; favicons + OG images in place
- [ ] Production deploy verified on the real host — routing, forms, images
- [ ] Git history committed under the correct author identity; `starterVersion` recorded

---

## New-client setup runbook
<!--rule: runbook | tier: reference-->

Phase numbers map to [lifecycle](#the-build-process-lifecycle).

**1. Scaffold**

1. Copy the starter → `<client>-build`. Record `starterVersion` in `package.json` and add the starter as an `upstream` remote ([structure.git](#git-branching-deploy--starter-lineage)).
2. Update `package.json` `name` and README; confirm the [structure.gate](#required-scripts--the-type--build-gate) scripts.
3. Fill in `src/data/site.ts` (name, url, description, ogImage, logo, socials). `astro.config.mjs` reads the URL from it ([seo.identity](#site-identity--one-source-of-truth)).
4. Add host config for the chosen target ([deploy.static](#deployment--static)). Add `public/_headers` and, for a migration, `public/_redirects`.
5. Add `public/robots.txt` + `src/pages/404.astro`.
6. Add `.env` keys; commit `.env.example` ([structure.env](#environment-variables--secrets)). Write the per-client agent brief ([structure.agent-brief](#repo-as-an-agent-platform)).
7. Set up preview/staging protection now, not at launch ([seo.staging](#staging--preview-indexing-control)).

**2. Design-system intake**

8. Fill every `--color-*` role in `global.css` `@theme`, for every theme the project ships. Add brand-named accents separately; map `--color-intent` to the primary.
9. Decide the theme set and register the `@custom-variant`s.
10. Set per-client decisions ([tokens.per-client](#per-client-design-decisions-set-at-intake)): radius stance, depth, accents.
11. Wire fonts ([perf.fonts](#fonts--self-hosted)); set `--font-heading/-sans/-mono`. Tune the fluid type clamps. Rewrite `DESIGN.md`.

**3. Componentize**

12. Build pages from starter primitives; keep `components/` flat. New components → [templates](#component-author-templates) template + [checklist.component](#new-component).
13. **Keep the full starter component set** — don't delete unused components ([principles](#why-this-exists), principle 10). Production stays lean via route gating and tree-shaking. Remove only deprecated or broken code.

**4. Content & SEO**

14. Define collections in `content.config.ts` (lean; `reference()` taxonomies; `image()` for content images). Keep the content-source seam ([content.source-seam](#content-source-seam)).
15. Author `lib/schema.ts` graphs; pass `jsonLd` from pages.
16. Set per-page `title`/`description`/`image`/`noindex`. Extend the sitemap filter.

**5. Optimize & QA**

17. Import images via `astro:assets`; measure against [perf.budgets](#budgets--targets) budgets.
18. Run [checklist.page](#page-done), [checklist.seo](#seo-per-page--template) and [checklist.a11y](#accessibility-audit-per-page) on every template.

**6. Launch**

19. Run [checklist.pre-launch](#pre-launch). Deploy to the chosen production host. Verify production. Hand off.

---

## Automated guardrails
<!--rule: guardrails | tier: reference-->

> [guardrails.gate](#type--build-gate-required--shipped), [guardrails.docs-check](#documentation-integrity-check-required--shipped) and [guardrails.skills](#agent-skills--commands-required--shipped) ship today; [guardrails.lint](#linting-roadmap)–[guardrails.axe](#accessibility-automation-roadmap) are **Roadmap** ([roadmap](#roadmap)). The aim: standards enforced by tooling and executable procedure, not memory.

### Type & build gate (Required — shipped)
<!--rule: guardrails.gate | tier: required-->
`npm run check` = typecheck + [guardrails.docs-check](#documentation-integrity-check-required--shipped) + production build ([structure.gate](#required-scripts--the-type--build-gate)). The minimum local gate before every PR. Still to do: wire it into CI.

### Documentation integrity check (Required — shipped)
<!--rule: guardrails.docs-check | tier: required-->

`npm run docs:check` runs `scripts/check-docs.mjs` as part of the gate. It exists because the rulebook is split across modules and cited from checklists, skills and the agent contract — nothing else detects a citation going stale, and renumbering has silently broken references before.

It fails on:

- a `[rule.id]` citation that resolves to no declared rule — including a typo inside a real namespace;
- a duplicate rule id, a duplicate module `order`, or an unknown tier;
- any surviving `§N` section reference — the banned syntax that ids replaced;
- a relative `.md` link that doesn't resolve on disk;
- a stale `STANDARDS.md` (a module changed without `npm run docs:build`).

Declarations and citations inside fenced code blocks are treated as examples and ignored. `docs/learn/` is exempt: it is explicitly non-authoritative.

**Every rule carries an id** declared beside its heading:

```md
### Client-side scripting
<!--rule: components.scripting | tier: required-->
```

Cite one from anywhere in the repo as `[components.scripting](#client-side-scripting)`. Tiers are `required`, `default`, `reference` and `checklist`. Ids survive moves and reordering, which section numbers did not.

### Linting (Roadmap)
<!--rule: guardrails.lint | tier: reference-->
`eslint` + `eslint-plugin-astro` + `@typescript-eslint`. Rules worth enforcing:
- ban raw hex/rgba **and raw Tailwind neutral classes** (`text-gray-*`, `bg-zinc-*`) in components
- flag bare global selectors in `is:global` blocks (require a `[data-*]` namespace)
- ban inline `style=` and `on*=` attributes
- require `rel="noopener noreferrer"` alongside `target="_blank"`

### Formatting (Roadmap)
<!--rule: guardrails.format | tier: reference-->
`prettier` + `prettier-plugin-astro` with a shared `.prettierrc` committed to the starter.

### CI (Roadmap)
<!--rule: guardrails.ci | tier: reference-->
One PR workflow: `install → npm run check → eslint → (optional) Lighthouse CI on a preview build`. Block merge on failure; assert the [perf.budgets](#budgets--targets) budgets so performance can't silently regress.

### Accessibility automation (Roadmap)
<!--rule: guardrails.axe | tier: reference-->
`axe-core` (via Playwright or `@axe-core/cli`) against key templates in CI, as a backstop to the manual [checklist.a11y](#accessibility-audit-per-page) audit. Automated checks catch a minority of issues; they don't replace keyboard and screen-reader passes.

### Agent skills & commands (Required — shipped)
<!--rule: guardrails.skills | tier: required-->

The repo ships **executable forms of this document** under `.claude/`. They are how a standard gets *run* rather than remembered, and they are part of the client deliverable ([principles](#why-this-exists), principle 10).

| Path | Kind | What it does |
|---|---|---|
| `.claude/skills/launch/` | Skill | Pre-launch audit — the executable form of [checklist.pre-launch](#pre-launch). Takes a `staging` or `production` mode, then verifies site identity and canonicals, referenced assets, robots and sitemap, **built HTML** (not source), demo-route leakage, placeholder sweep, env keys and bindings, analytics/consent, legal pages, canvas gating, and a browser pass. Reports `BLOCKER` / `SHOULD FIX` / `NEEDS HUMAN` / `NIT` / `CLEAN`, then fixes only with permission and only from a fixed allowlist. |

**Rules for authoring and maintaining them:**

- **The skill is derived from this document, never the reverse.** When a rule here changes, update the matching step in the **same change**. A shipped audit that contradicts the standard is worse than no audit, because it launders a stale rule as a passing check.
- **Cite rules by id, never by section number.** [guardrails.docs-check](#documentation-integrity-check-required--shipped) verifies every id a skill cites still exists, so a rule that moves can't leave a skill pointing at nothing.
- **Skills state procedure and severity, not rules.** A skill says *what to check, in what order, at what severity*; the rule itself lives here ([principles](#why-this-exists), no duplication). A skill that restates a rule is a second copy that will drift.
- **No client-specific stances in a starter-level skill.** Radius, palette and type choices belong in the client's `DESIGN.md` ([tokens.per-client](#per-client-design-decisions-set-at-intake)). A skill that hardcodes one project's stance silently breaks the next build.
- **No machine-specific absolute paths.** A skill shipped in a client repo runs on someone else's machine.
- **Never report an unrun check as passed** — mark it `NEEDS HUMAN` with how to verify. The `CLEAN` section is not optional: a report listing only failures gives no coverage signal, and the reader can't distinguish a passed check from a skipped one.
- **Audit before fixing.** Report first, fix only with permission, and keep the auto-fix allowlist narrow — never user-visible copy, legal text, brand artwork or redirect maps.
- **Severity discipline.** `BLOCKER` means a visitor experiences something broken, or there is legal/brand exposure. If everything is a blocker, the label stops meaning anything.

**Roadmap:** an intake skill ([runbook](#new-client-setup-runbook) phases 1–2) and a standalone accessibility-audit skill ([checklist.a11y](#accessibility-audit-per-page)) are the obvious next two.

### Local development notes
<!--rule: guardrails.local-dev | tier: default-->
- **Runtime-imported dependencies need pre-bundling.** A dep imported at runtime inside a `<script>` (animation libraries and their plugins, for example) can 504 in `astro dev` on first use. Add it to `optimizeDeps.include` in the Vite config.
- **Verify against a production build whenever dev and the host runtime differ.** Routing, adapters and image services can behave differently in dev; `npm run build && npm run preview` is the source of truth before you call something broken or fixed.

---

## Starter conformance gaps
<!--rule: conformance | tier: reference-->

Where the starter does not yet meet a rule in this document. Every entry is dated and verified. **A rule marked Required with an entry here is not gated on until the entry clears.**

*Verified 2026-08-01.*

| Rule | Gap | Action |
|---|---|---|
| [seo.identity](#site-identity--one-source-of-truth) site identity | `astro.config.mjs` hardcodes `site: 'https://example.com'` separately from `data/site.ts` | Import `site.url`; add the placeholder guard |
| [components.composition](#composition-model-pages--sections--components) SectionMain | Side rules (`border-l border-r`) are unconditional — no opt-out prop | Add `sideRules?: boolean` (or a `frame` variant) |
| [perf.prefetch](#navigation-prefetch) prefetch | Not configured | Add `prefetch` config with `defaultStrategy: 'hover'` |
| [tokens.scoped-styles](#accessing-tokens-inside-scoped-style--the-1-gotcha) raw values | `HeroCanvas` and `ShinyButton` declare literal hex custom properties that don't follow the theme | Either promote to theme-aware tokens or document them under the [tokens.scoped-styles](#accessing-tokens-inside-scoped-style--the-1-gotcha) allowance |
| [structure.git](#git-branching-deploy--starter-lineage) lineage | No `starterVersion` field or upstream-remote convention in place yet | Add the field; document the pull workflow |
| [components.forms](#forms--form--field-progressively-enhanced-and-hardened) forms | The starter ships the `Form`/`Field` UI only; no reference endpoint implements the security requirements | Ship a reference endpoint meeting [components.forms](#forms--form--field-progressively-enhanced-and-hardened), or state per-project that it must be built |
| [structure.env](#environment-variables--secrets) env | No build-time assertion for required env keys | Add assertions; revisit when `astro:env` is adopted |
| [seo.staging](#staging--preview-indexing-control) staging (vs [guardrails.skills](#agent-skills--commands-required--shipped)) | The `launch` skill treats a missing `Disallow: /` on staging as a BLOCKER and accepts it as sufficient protection; [seo.staging](#staging--preview-indexing-control) now demotes it to a secondary signal behind access control / `X-Robots-Tag` / meta-noindex | Rewrite the skill's staging row to check for one of the [seo.staging](#staging--preview-indexing-control) methods, keeping `Disallow: /` as a bonus |

**Cleared in v2** (verified against the code, previously listed as debts): `Button.astro` already uses `interface Props extends HTMLAttributes<"button">` with the intersection deliberately rejected; the script-init flag is already uniform across every component; there are **zero** raw Tailwind neutral classes in `components/`.

**Cleared in v2.1:** the `build-component` command — which hardcoded one client's radius stance, pointed at a machine-specific path, and restated rules — was deleted. Its three pieces of unique content (the Astro `:global()` scoping trap, the hand-rolled focus-ring equivalent, and the BEM-vs-utilities naming guidance) were rescued into [components.styling](#styling-components) first.

**Cleared in v2.2 — [structure.gate](#required-scripts--the-type--build-gate) now holds.** `typecheck` runs `astro check --minimumFailingSeverity warning`, and the three errors it surfaced are fixed: ambient declarations for the untyped `@fontsource-variable/*` packages, `CodeBlock`'s `lang` prop derived from `<Code />` instead of a bare `string`, and `SliderBasicMap`'s `items` typed optional to match its own default and documented usage. Result: **0 errors, 0 warnings**, 71 files. 32 hints remain (unused locals, and the deprecated `z` re-export in `content.config.ts`) — hints don't fail the gate; see [roadmap](#roadmap).

---

## Roadmap
<!--rule: roadmap | tier: reference-->

### Done — v2.1
- ✅ Split the rulebook into task-scoped modules with a router ([guardrails.docs-check](#documentation-integrity-check-required--shipped), [changelog](#changelog)).
- ✅ Stable rule ids replace section numbers everywhere; `§N` is banned syntax.
- ✅ `scripts/check-docs.mjs` wired into `npm run check`.
- ✅ Verification tiers so the gate scales with blast radius.
- ✅ `AGENTS.md` reduced to a contract of pointers; `CLAUDE.md` points at it *(P1.5)*.
- ✅ `build-component` command deleted; its unique content rescued into [components.styling](#styling-components) *(part of P1.6)*.

### Done — v2.2
- ✅ Type gate swapped to `astro check`; the three errors it surfaced are fixed ([structure.gate](#required-scripts--the-type--build-gate), [conformance](#starter-conformance-gaps)).

### P0 — correctness of the gate
1. Single-source the site URL with the placeholder guard ([seo.identity](#site-identity--one-source-of-truth)).
3. Ship a reference form endpoint meeting [components.forms](#forms--form--field-progressively-enhanced-and-hardened), or document the per-project requirement in the runbook.
4. Put preview/staging protection into the scaffold step so it's never left to launch day ([seo.staging](#staging--preview-indexing-control)).

### P1 — authoring quality
1. `sideRules` opt-out on `SectionMain` ([conformance](#starter-conformance-gaps)).
2. Split the component templates into the three of [templates](#component-author-templates) and update `ComponentTemplate*`.
3. Add `prefetch` config ([perf.prefetch](#navigation-prefetch)).
4. `starterVersion` + upstream-remote workflow ([structure.git](#git-branching-deploy--starter-lineage)).
5. Reconcile the `launch` skill's staging rule with [seo.staging](#staging--preview-indexing-control) — it still treats `Disallow: /` as sufficient protection ([conformance](#starter-conformance-gaps)).

### P2 — tooling
1. Clear the 32 remaining `astro check` hints — unused locals, and the deprecated `z` re-export in `content.config.ts`. They don't fail the gate; raising `--minimumFailingSeverity` to `hint` only makes sense once they're at zero.
2. Stand up linting ([guardrails.lint](#linting-roadmap)) with the listed rules; run inside `check`.
2. Prettier + shared config ([guardrails.format](#formatting-roadmap)).
3. Minimal CI: `check` + eslint on PR ([guardrails.ci](#ci-roadmap)).
4. Lighthouse CI asserting [perf.budgets](#budgets--targets) budgets, and `axe-core` ([guardrails.axe](#accessibility-automation-roadmap)).
5. Adopt `astro:env` for typed env ([structure.env](#environment-variables--secrets)).
6. Cookie-consent gating as a reusable component ([perf.third-party](#third-party-scripts)).
7. Two more skills ([guardrails.skills](#agent-skills--commands-required--shipped)): design-system intake ([runbook](#new-client-setup-runbook) phases 1–2) and a standalone accessibility audit ([checklist.a11y](#accessibility-audit-per-page)).

---

## Changelog
<!--rule: changelog | tier: reference-->

### v2.2 — 2026-08-01 — the type gate actually type-checks

`typecheck` ran `tsc --noEmit`, which never opens a `.astro` file — so every component, prop type and component usage in the repo passed the gate unread. It now runs `astro check --minimumFailingSeverity warning` ([structure.gate](#required-scripts--the-type--build-gate)), which checks `.astro` **and** `.ts` and runs `astro sync` itself.

The swap surfaced three real errors, all fixed at their source rather than suppressed:

- **`@fontsource-variable/*` side-effect imports** had no type declarations (ts 2882). Added `src/fontsource.d.ts` — a global declaration file, because an ambient module declaration for an unknown package is illegal in a file that has top-level imports.
- **`CodeBlock`'s `lang` prop** was `string`, which doesn't satisfy shiki's language union. Now derived from `<Code />` via `ComponentProps`, so it stays correct if Astro's accepted set changes.
- **`SliderBasicMap`'s `items`** was declared required while the destructure defaulted it to `[]` and the component documented manual children as an alternative. The declaration was the bug; `items` is now optional, and the preview route that tripped it renders real sample slides instead of an empty slider.

Result: 0 errors, 0 warnings across 71 files. 32 hints remain and do not fail the gate.

### v2.1 — 2026-08-01 — documentation restructure

The rulebook was a single 1,340-line file with no entry point shorter than "read all of it", and nothing detecting a stale cross-reference. Renumbering during the v2 rewrite silently broke four references across two files; this release fixes that structurally. **No rule text changed.**

**Structure**
- Split into modules under `docs/`: `rules/` (the rules), `checklists/` (the gates), and the process docs. `STANDARDS.md` is now **generated** from them by `scripts/build-standards.mjs` — table of contents included — and is never edited directly.
- **`docs/workflow.md`** added as the router: 13 task rows mapping a job to just the modules it needs.
- **Verification tiers** added, Tier 0 (copy) to Tier 4 (launch), classified by blast radius. A copy edit and a token change no longer carry the same gate.
- `AGENTS.md` became the vendor-neutral agent contract; `CLAUDE.md` reduced to a pointer at it, reversing the old direction. `README.md` replaced the stock Astro template readme.
- `astro-for-beginners.md` moved to `docs/learn/`, explicitly marked non-authoritative; the contact-form guide moved to `docs/how-to/`.

**Stable rule ids replace section numbers**
- Every rule now declares an id beside its heading (`<!--rule: components.scripting | tier: required-->`) and is cited as `[components.scripting](#client-side-scripting)`. 87 rules declared; 194 section references converted.
- Section numbers are gone from headings entirely, and `§N` is now **banned syntax** — the gate rejects it.
- Ids are linkified automatically in the generated `STANDARDS.md`, so citations stay clickable without hand-maintained anchors.

**Enforcement ([guardrails.docs-check](#documentation-integrity-check-required--shipped))**
- `scripts/check-docs.mjs` added and wired into `npm run check`. It fails on an unresolvable citation, a duplicate id or module order, an unknown tier, a surviving `§` reference, a broken relative link, or a stale `STANDARDS.md`.

### v2 — 2026-08-01

**Correctness**
- **Type gate rewritten ([structure.gate](#required-scripts--the-type--build-gate)).** `tsc --noEmit` does not read `.astro` files; the gate is now `astro check --minimumFailingSeverity warning`. Recorded as a gap until `package.json` follows ([conformance](#starter-conformance-gaps)).
- **Conformance contract added ([principles](#why-this-exists)).** A Required rule must be true of the starter or appear in [conformance](#starter-conformance-gaps) with a date. [conformance](#starter-conformance-gaps) rewritten from an undated wish list into a verified gap table; three stale entries cleared.
- **Staging indexing ([seo.staging](#staging--preview-indexing-control)).** `Disallow: /` demoted to a secondary signal; access control / `X-Robots-Tag` / meta-noindex now required, with the `_headers` production caveat.
- **Site identity single-sourced ([seo.identity](#site-identity--one-source-of-truth)).** `astro.config.mjs` imports `site.url`; placeholder guard fails the build on `example.com`.
- **Version drift removed ([structure.versions](#versions--engines)).** Pinned framework versions replaced with a policy pointing at `package.json`.
- Token contract corrected ([tokens.model](#the-token-model)): `--color-warning`, `--pattern-stripe` and `--accent-line` added; radius stance restated ([tokens.per-client](#per-client-design-decisions-set-at-intake)). Tree, root-file map and collection references corrected ([structure.layout](#directory-layout), [content.md-vs-mdx](#md-vs-mdx--pick-by-whether-the-author-places-components)). Sitemap filter's actual role clarified ([seo.sitemap](#sitemap)).

**Authoring**
- **Init guard changed to per-behavior** `WeakSet` ([components.scripting](#client-side-scripting)) — a single shared flag silently blocks a second behavior on the same element. Full `AbortController` teardown recipe added.
- **`astro:page-load` documented as conditional** on the client router, which is opt-in and not enabled in the starter ([components.scripting](#client-side-scripting)).
- **Props typing relaxed ([components.props](#props-typing)):** `interface` for object shapes, `type` for unions/polymorphism/intersections; polymorphic guidance rewritten and the stale `Button` note removed.
- **Three component templates ([templates](#component-author-templates))** — static (default), interactive, polymorphic. Random-id generation dropped.
- **`SectionMain`** documented as-is, with visual framing named as a brand decision and the missing opt-out logged ([conformance](#starter-conformance-gaps)).
- Forms hardened ([components.forms](#forms--form--field-progressively-enhanced-and-hardened)): server-side validation, limits, rate limiting, origin strategy, header-injection tests, logging/retention, failure alerting.
- Docs homes disambiguated ([components.docs](#documentation--shared-components)); `Hero` named as the sanctioned prefix exception ([structure.naming](#naming-conventions)).

**New**
- **Agent skills & commands documented ([guardrails.skills](#agent-skills--commands-required--shipped))** — the `launch` pre-launch audit and the `build-component` guided build, with authoring rules: derived from this file and never the reverse, every `§` reference must resolve, procedure not rules, no client-specific stances, no machine-specific paths, audit before fixing, `CLEAN` and `NEEDS HUMAN` mandatory. [checklist.pre-launch](#pre-launch) now names the skill as its executable form; two skill/standard conflicts logged in [conformance](#starter-conformance-gaps).
- Responsive contract ([tokens.responsive](#responsive-contract)) — mobile-first, test widths, `min-w-0`, wide-content scrolling.
- `Layout.astro` prop contract ([seo.layout-contract](#the-layoutastro-contract)).
- Content-source seam ([content.source-seam](#content-source-seam)).
- Navigation prefetch policy ([perf.prefetch](#navigation-prefetch)).
- Performance budgets ([perf.budgets](#budgets--targets)) alongside Lighthouse smoke targets.
- Accessibility thresholds ([a11y.thresholds](#measurable-thresholds)) and a "page done" checklist ([checklist.page](#page-done)).
- Local-development notes ([guardrails.skills](#agent-skills--commands-required--shipped)); starter lineage ([structure.git](#git-branching-deploy--starter-lineage)); no-duplication rule for agent docs ([principles](#why-this-exists)).

**Accessibility corrections ([a11y](#accessibility))**
- "Every component ships with ARIA" → ships the behavior it needs, native-first.
- Keyboard table split into required vs optional: Esc removed from the accordion pattern; arrow/Home/End marked optional there; automatic vs manual tab activation stated as a choice.
- "One `h1` per page" relabelled an agency convention, not a WCAG requirement.
- Added focus-not-obscured, forced-colors, target size, reflow and text-spacing checks.

**Performance reframed**
- Canvas rules split into Required behavior vs tunable Defaults, with a measurement rule; superlative claim and project-specific result removed ([perf.canvas](#animated-canvases--heavy-client-js)).
- `inlineStylesheets: 'always'` given an explicit re-measure trigger ([perf.css](#css-inlining)).
- Partytown made per-vendor and test-gated ([perf.third-party](#third-party-scripts)).
- Fonts: requirement is self-hosted WOFF2, variable preferred, Fontsource as the default source rather than the only one ([perf.fonts](#fonts--self-hosted)).
- Hosting made host-neutral ([deploy.static](#deployment--static)): Cloudflare Workers static assets preferred, Pages supported, Netlify equal; downstream steps refer to "the production host".

---

*Maintained in the starter. Propose changes via PR against this file; once merged, roll relevant items into active client repos.*
