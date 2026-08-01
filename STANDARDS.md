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

**Status:** v2 — see §16 for what changed.
**Audience:** anyone building or reviewing an Astro site at Miscreants.
**How to use:** Read §1–§2 once. Keep §11 (Checklists) and §12 (Runbook) open while you work. Reviewers gate PRs on §11.
**Conformance:** every rule marked **Required** is true of the starter today, or it is listed in §14 with the date it was found. The doc never claims something the reference implementation doesn't do.
**Source:** this single file is **generated** from the modules in [`docs/`](./docs/README.md) — edit a module there and run `npm run docs:build`; never edit the assembled file. For task-scoped reading, enter through the router at [`docs/workflow.md`](./docs/workflow.md), which points at only the modules a given job needs.

---

## Table of contents

1. [Why this exists](#1-why-this-exists)
2. [The build process (lifecycle)](#2-the-build-process-lifecycle)
3. [Project structure & conventions](#3-project-structure--conventions)
4. [Design tokens & styling](#4-design-tokens--styling)
5. [Components: the authoring standard](#5-components-the-authoring-standard)
6. [Component author templates](#6-component-author-templates)
7. [SEO, head & metadata](#7-seo-head--metadata)
8. [Accessibility](#8-accessibility)
9. [Content collections & data](#9-content-collections--data)
10. [Performance & build optimization](#10-performance--build-optimization)
11. [Checklists](#11-checklists)
12. [New-client setup runbook](#12-new-client-setup-runbook)
13. [Automated guardrails](#13-automated-guardrails)
14. [Starter conformance gaps](#14-starter-conformance-gaps)
15. [Roadmap](#15-roadmap)
16. [Changelog](#16-changelog)

---

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

---

## 2. The build process (lifecycle)

Every client engagement follows the same arc. Each phase has a checklist in §11 and a step-by-step in §12.

```
┌─ 0. Kickoff ──────────────────────────────────────────────────────┐
│  Gather brand assets: colors, fonts, logos, design refs (Figma).   │
│  Choose the production host (§10.8) and record it. Static output.  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 1. Scaffold ─────────────────────────────────────────────────────┐
│  Clone starter → rename → set site identity, analytics, host cfg.  │
│  Record starterVersion + upstream remote (§3.7).                   │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 2. Design system intake ─────────────────────────────────────────┐
│  Translate brand into @theme tokens (colors, fonts, radius,        │
│  motion). Decide the theme set. Rewrite DESIGN.md.                 │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 3. Componentize ─────────────────────────────────────────────────┐
│  Build page sections from starter primitives. New components       │
│  follow §5 + §6. Reuse before you create.                          │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 4. Content & SEO ────────────────────────────────────────────────┐
│  Wire content collections, per-page meta via Seo.astro, JSON-LD    │
│  in lib/schema.ts, sitemap filter.                                 │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 5. Optimize & QA ────────────────────────────────────────────────┐
│  astro:assets images, fonts, budgets (§10.7), a11y audit, clean    │
│  `npm run check`.                                                  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 6. Launch ───────────────────────────────────────────────────────┐
│  Pre-launch checklist, deploy to the chosen host, verify prod.     │
└────────────────────────────────────────────────────────────────────┘
```

**Reuse-before-create rule:** before building any component or utility, search the starter. It ships 50+ components and a full token system. Most "new" needs are a prop away from an existing component.

---

## 3. Project structure & conventions

### 3.1 Directory layout

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
AGENTS.md / CLAUDE.md # agent entry points — pointers, not rule copies (§1)
```

**Rules:**
- **Flat `components/` directory** with semantic filename prefixes (`Card*`, `Nav*`, `Section*`). Only group into a subfolder when a component is a true family.
- **One component = one PascalCase file.** No `index.astro` component folders.
- **`src/demos/` is not `src/pages/`.** Anything in `pages/` ships. Demo, showcase and preview routes live in `demos/` and are injected only in dev (§10.8).
- **`lib/` for logic helpers**, **`data/` for static registries and site identity**. Neither goes inside `components/`.

### 3.2 Naming conventions

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

**Naming exception — `Hero`.** A page's opening section may be named `Hero` (or `Hero*`) rather than `SectionHero`; it is still a section in every other respect (§5.0) and still builds on `SectionMain` unless it is genuinely full-bleed. This is the only sanctioned exception to the `Section*` prefix.

### 3.3 Path aliases (tsconfig)

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

### 3.4 Versions & engines

**The starter's `package.json` is the version baseline** — read it there rather than trusting a number written in prose. The policy:

- Node is pinned in `engines` (currently `>=22.12.0`); keep it identical across client repos.
- The stack is Astro + Tailwind v4 (via `@tailwindcss/vite`) + TypeScript, with `astro-icon`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/partytown`.
- **Bump the starter first**, validate with `npm run check` and a production build, then roll clients forward. Never bump a major in a client repo first.
- Record the starter version a client repo was cut from (§3.7) so upgrades are traceable.

### 3.5 Required scripts — the type & build gate

**Required.**

```jsonc
"scripts": {
  "dev":       "astro dev",
  "build":     "astro build",
  "preview":   "astro preview",
  "typecheck": "astro check --minimumFailingSeverity warning",
  "check":     "npm run typecheck && npm run build"
}
```

**Why `astro check` and not `tsc --noEmit`:** `tsc` does not read `.astro` files at all, so a `tsc`-based gate type-checks almost none of an Astro codebase — missing required props, bad prop types and broken component usage all pass. `astro check` (from `@astrojs/check`, already a devDep) checks `.astro` **and** `.ts`, and runs the `astro sync` step itself, so no separate `astro sync` is needed.

`--minimumFailingSeverity warning` means compiler warnings — including accessibility warnings — fail the gate. That is deliberate and consistent with §8. Hints do not fail.

`npm run check` is the local gate before every PR. See §14 for the starter's current conformance state.

### 3.6 Environment variables & secrets

- **`PUBLIC_` prefix = public.** Only `PUBLIC_*` vars reach client code / the bundle (Astro rule). Everything else is build/server-only. **Never put a secret in a `PUBLIC_` var.**
- Read via `import.meta.env.PUBLIC_*` (client) or `import.meta.env.*` (build-only).
- **Commit `.env.example`** (keys, no values); **never commit `.env`**.
- Build-time vars are set in the host dashboard. Runtime secrets (e.g. a form Worker) live in the host's secret store / bindings (§5.7) — never in the repo.
- **A missing required key must fail the build, not render `undefined`.** Until typed env lands (§15), assert required keys explicitly at config load.

> **Roadmap — `astro:env`.** Astro's typed env schema validates keys at build time and gives typed access with no manual assertions. Adopting it is the intended direction; until it ships in the starter, the `import.meta.env` rules above are the standard.

### 3.7 Git, branching, deploy & starter lineage

- **Push source, never `dist`.** The host builds from source; `dist/` stays gitignored.
- **One branch deploys.** The production branch (usually `main`) is wired to the host's Git build — pushing it ships. **Know which *remote* is production before you push** (a repo often has an agency mirror *and* the client's production repo).
- Commit under the **correct author identity**; present-tense, conventional messages.
- Non-trivial work goes on a branch → PR → merge to the deploy branch.
- **Starter lineage (Required).** A client repo records the starter commit/version it was cut from — a `starterVersion` field in `package.json` — and keeps the starter as a second git remote (`upstream`). Improvements are made in the starter and pulled/cherry-picked forward. Resetting history to zero with no recorded lineage makes principle 2 impossible and is not acceptable.

### 3.8 Repo as an agent platform

The client builds pages with an AI agent, so the repo must brief that agent — the docs are part of the deliverable (§1, principle 10). Every client repo ships `AGENTS.md` (canonical) with `CLAUDE.md` pointing at it. That brief:

- names `DESIGN.md` (tokens/brand) and `STANDARDS.md` as **authoritative**, and defers to them rather than restating rules (§1);
- lists the non-negotiables in one line each: semantic tokens only, accessibility required, pages compose sections, build sections on `SectionMain`, `astro:assets` for images, gate animated canvases;
- gives a **"how to add a page" recipe**: create `src/pages/<route>.astro` → wrap in `Layout` with `title`/`description`/`jsonLd` → compose existing sections → add new `Section*` components for new chunks → `npm run check`;
- says **where to look**: primitives in `components/`, the live showcase at `/components` (dev), per-component docs in `Doc/`, content in `content/`.

- points at the executable procedures in `.claude/` (§13.6) — the guided component build and the pre-launch audit.

Keep it short and imperative — it's the agent's front door, not a manual.

---

## 4. Design tokens & styling

**Get this right at intake (phase 2) and the rest of the build is fast.**

### 4.1 The token model

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

### 4.2 Per-client design decisions (set at intake)

Decide these and record them in the client's `DESIGN.md`.

| Decision | Starter stance | Note |
|---|---|---|
| Default theme | `light` | client may ship dark-default |
| Intent color | monochrome (`= fg`) | map to the brand primary when branded |
| Brand accents | none | add as separate `--color-<brand>` tokens |
| Border radius | **no global stance.** `--radius-card` / `--radius-pill` exist for the components that need a shape; most surfaces are square | rounding is a brand choice — never copy one client's stance to another |
| Depth | tonal by default; `--shadow-popover` / `--shadow-header` exist for floating UI | add more only if the design uses them |
| Fonts | three roles: heading / sans / mono | swap per brand; keep the three roles |

### 4.3 Typography

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

### 4.4 Layout & spacing utilities

Use the semantic layout `@utility` recipes instead of ad-hoc padding:

```css
@utility container-large  { @apply mx-auto w-full max-w-7xl; container-type: inline-size; }
@utility container-page   { @apply mx-auto w-full max-w-[90rem] px-site-margin; }
@utility section-gutter   { @apply px-4 md:px-12 lg:px-24; }
@utility section-padding  { @apply py-24 md:py-24; }   /* + -xs/-sm/-lg/-xl */
```

`container-page` is the page box every top-level element (sections, nav, footer) aligns to; its width cap is a per-client value, changed once in `global.css`. Sections reach for the rhythm utilities rather than raw `py-*`/`px-*`.

### 4.5 Responsive contract

**Mobile-first.** Author the base case for narrow viewports and add `md:` / `lg:` upward. Don't write desktop-first and undo it.

**Test widths (Required at page sign-off):** 320, 375, 768, 1024, 1440. **No horizontal scroll at 320px** on any page.

Two overflow rules that account for most real breakage:

- **A flex or grid child that must shrink needs `min-w-0`.** Flex items default to `min-width: auto`, so a wide child (a long unbroken string, a table, a pre block) forces the whole column wider than the viewport instead of wrapping.
- **`sr-only` does not clip a wide `<table>`.** Visually-hidden wrappers don't constrain an intrinsically wide descendant — wrap wide content in an `overflow-x: auto` container instead.

Anything intrinsically wide (tables, code blocks, diagrams) scrolls **inside its own container**; the page body never scrolls horizontally.

### 4.6 Motion tokens

Durations and easings are centralized so "how long is a hover" has one answer:

```css
--cubic-default: cubic-bezier(0.625, 0.05, 0, 1);
--duration-default-half: 0.4s;
--timing-default-half: var(--duration-default-half) var(--cubic-default);
```

**Required:** components reference `--timing-*` / `--duration-*`. Don't hardcode `300ms` or invent a one-off easing. If a motion need isn't covered, add a token.

### 4.7 Accessing tokens inside scoped `<style>` — the #1 gotcha

Astro scoped / `is:global` `<style>` blocks **cannot resolve** `@theme` tokens through `@apply` / `theme()` by default. **The standard, in priority order:**

1. **Prefer Tailwind utility classes in markup** (`class="bg-intent text-fg-on-intent"`). This is the default and always resolves tokens correctly.
2. **In a `<style>` block, reference the CSS variable directly** — custom properties *do* cascade into scoped styles:
   ```css
   .thing { background-color: var(--color-intent); color: var(--color-fg-muted); }
   ```
3. **If you need `@apply` or `theme()` inside the block,** add `@reference "../styles/global.css";` at the top.

**Never** hardcode a hex/rgba or a raw Tailwind neutral (`text-gray-700`) that duplicates a token — it won't follow theme changes. If a status needs a color, add a `--color-*` token.

**Allowed with reason:** a self-contained visual effect (canvas, gradient effect) may define local `--*` literals for values that are not theme roles — but they must be declared as custom properties at the component root, per theme where the effect is visible, and documented in the component header.

### 4.8 Global base rules

These live in `global.css` `@layer base`:

- **Cursor:** all interactive controls get `cursor: pointer`; disabled gets `not-allowed`.
- **Body defaults:** `body { @apply bg-canvas text-fg min-h-screen; }`
- **Orphans:** headings `text-wrap: balance`; body `text-wrap: pretty`.
- **Reduced motion:** every `transition`/`animation` respects `@media (prefers-reduced-motion: reduce)` (§8).

---

## 5. Components: the authoring standard

### 5.0 Composition model: pages → sections → components

Treat the UI as **three tiers**, and let each page read like a table of contents.

**1. Primitives & blocks — *open* components (props + slots).**
Reusable UI units with a clear identity: `Button`, `Card`, `Field`, `Tag`. They live flat in `components/`, are fully parameterized (typed props + slots — §5.1/§5.3), are styled only with tokens, and contain **no page-specific content**.

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
> **Visual framing is a brand decision.** The side rules are currently unconditional; a client whose design has no section borders needs an opt-out prop rather than bespoke markup (§14). Width and border color are already token-driven (`container-page`, `border-stroke`) and are tuned in `global.css`, not in the component.
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
- **Styling** → Tailwind utilities or a scoped `<style>` using `var(--token)` (§4.7). **Never inline `style="…"`** — it bypasses tokens/theming, can't express hover/focus/media states, and isn't cacheable.
- **Behavior** → an Astro `<script>` (bundled, type-checked, tree-shaken; §5.6). **Never inline `onclick="…"`.**
- Long Tailwind class lists are the one real noise source — fix by extracting a recurring combo into an `@utility` recipe, not by reaching for inline `style`.

### 5.1 Props typing

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

### 5.2 Defaults

Set defaults in the destructure, not with `??` scattered through the template:

```astro
const { label = "Learn More", variant = "primary", arrowDirection = "right" } = Astro.props;
```

### 5.3 Slots — default + named, with introspection

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

### 5.4 Variants & polymorphism

- Variants are a **typed union prop** (`variant?: "primary" | "secondary" | "tertiary"`), resolved via `class:list` or a lookup map. Never a freeform string.
- Polymorphic tag selection: `const Tag = href && !disabled ? "a" : "button"`, then `<Tag …>`.

### 5.5 Styling components

- Reach for **Tailwind utilities with semantic tokens** first (`bg-panel`, `text-fg-muted`, `border-stroke`).
- **Focus ring is mandatory and built-in** on every interactive element:
  ```
  focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
  ```
- **`is:global` is allowed with reason and must be namespaced.** Components that style slotted children (Field, Modal, Media, sliders) may use it, but **only** scoped under a component data attribute: `[data-field="component"] { … }`. Never emit a bare global class — it leaks site-wide and collides. Document the reason in a comment above the block.
- **External links:** `target="_blank"` always ships `rel="noopener noreferrer"`, and the link's accessible name indicates it opens a new context.

### 5.6 Client-side scripting

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

### 5.7 Forms — `Form` + `Field`, progressively enhanced and hardened

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

### 5.8 Documentation & shared components

- **Per-component reference docs live in `Doc/<Component>.md`** — purpose, props, gotchas. Every reusable component has one, plus a header comment in the file itself.
- **The live showcase is `src/content/components/*.mdx`**, rendered at `/components` in dev. This is the canonical target for component documentation; `Doc/` is the current, simpler home and the two should not disagree.
- **`src/components/_docs/`** holds showcase-only helpers (`Preview`, `PropsTable`) — never product components.
- **Don't modify a shared component for a one-off page need.** Add a prop or build a page-local wrapper. If a shared primitive genuinely must change, that's a deliberate, reviewed change — ask first, don't drive-by edit.

### 5.9 Prop & event naming

- **Booleans read as flags/state**, positive: `disabled`, `withArrow`, `hideLabel`, `isOpen` — prefer `is*/has*/with*`; avoid negatives.
- **Always accept a `class` passthrough** (`class?: string`, merged via `class:list`).
- **Variants are unions**, not freeform strings: `variant` / `size` / `tone`.
- **Custom events are `namespace:verb`**, bubbling + cancelable.

---

## 6. Component author templates

Three templates, because most components are not interactive and shouldn't be born with a script, a style block and a lifecycle they never use. **Start with the static template.** The starter ships `ComponentTemplateBasic.astro` / `ComponentTemplateAdvanced.astro` — keep them in sync with this section.

### 6.1 Static component (the default)

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

### 6.2 Interactive component

Adds state, ARIA, keyboard, a scoped style block only if needed, and the §5.6 lifecycle. Pass an `id` in rather than generating a random one — generated ids churn build output and can't be targeted by the caller.

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
  /* Only when a utility can't express it. Tokens via var() — §4.7. */
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

### 6.3 Native / polymorphic control

Attribute passthrough plus the few props of the alternate element (§5.1).

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

## 7. SEO, head & metadata

### 7.1 Site identity — one source of truth

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

### 7.2 The `Layout.astro` contract

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

### 7.3 The `Seo.astro` component

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

### 7.4 JSON-LD via `lib/schema.ts`

Structured data lives in `src/lib/schema.ts` as **pre-built graphs + builder functions**, not inline in pages:

- **`homepageSchema`** — a `@graph` with `Organization` + `WebSite` + `WebPage`, built from `site.*`.
- **`articleSchema({ path, title, description, datePublished, … })`** — `Article` + `BreadcrumbList`, with an optional `breadcrumbParent`.
- **Cross-referencing via `@id`**: every node has a stable `@id` (`${site.url}/#organization`) and others reference it — one canonical Organization/WebSite, no duplication.

**Standard:** homepage emits Organization + WebSite; content detail pages emit Article + BreadcrumbList; FAQ pages emit FAQPage. Extend `schema.ts` per project rather than inlining schema in pages.

### 7.5 Sitemap

`@astrojs/sitemap` is wired with a filter that excludes internal routes:

```js
const SITEMAP_EXCLUDE = ['/styleguide', '/components', '/tve-preview'];
```

Note what this does **not** do: demo routes are already excluded from production because they live in `src/demos/` and are never injected in a normal build (§10.8). The filter is a **safety net** for routes that do ship but shouldn't be indexed. Extend it per project.

### 7.6 Staging & preview: indexing control

**`Disallow: /` in robots.txt is not indexing control.** A disallowed URL can still be indexed from external links, and a crawler blocked by robots.txt never reads a page-level `noindex`.

**Required — a non-production deployment uses at least one of:**

1. **Access control** — host-level password/SSO (Cloudflare Access, Netlify password protection). Strongest, and the default choice for client review sites.
2. **`X-Robots-Tag: noindex, nofollow` response header** on the preview host, with crawling still allowed so the directive is actually read.
3. **`<meta name="robots" content="noindex">`** on every page (`noindex` through `Layout`), crawling allowed.
4. **A non-public preview URL** that is never linked publicly.

`Disallow: /` may accompany these as a secondary signal, never as the primary control.

> **Implementation caveat:** `public/_headers` ships to production too, so a blanket `X-Robots-Tag: noindex` there would deindex the live site. Apply it through a host-level rule scoped to preview deployments, or emit it from a build-time environment flag — and verify the production response headers before launch.

### 7.7 Drafts & announcements

- `draft: true` content sets `noindex`, and is excluded from listings and the sitemap.
- Announcements are a scheduled collection (`startsAt`/`endsAt`/`enabled`/`priority`); the layout picks the top active one at build time.

### 7.8 robots.txt & error pages

- Ship **`public/robots.txt`**: allow crawling, link the sitemap (`Sitemap: https://<site>/sitemap-index.xml`).
- Ship a styled **`src/pages/404.astro`** using `Layout`. Both hosts serve it for unknown static routes.

### 7.9 Astro/host gotchas (pure-static)

- **Don't call a syntax highlighter directly in component frontmatter** (e.g. `shiki.codeToHtml`) — it can silently truncate static HTML on some hosts. Use `<Code />` from `astro:components`.
- For **pure-static** sites, **stay adapter-free** so Astro's default Sharp image service runs at build. A host adapter's image service may be a passthrough that emits mislabelled formats.
- A path matching a dynamic route but excluded from `getStaticPaths` can 500 in a host's dev runtime with a misleading error — **verify routing against a production build**, not dev (§13.7).
- Pre-launch, `site` / JSON-LD / canonical URLs may intentionally point at the production domain before DNS cutover. Don't "fix" them back to staging.

---

## 8. Accessibility

Accessibility is a build requirement, not a phase.

**Every component ships with the accessibility behavior it needs — semantics, keyboard, focus and reduced motion — from the start.** Prefer native HTML; add ARIA only where native semantics are insufficient. Redundant or incorrect ARIA is worse than none.

### 8.1 Semantic HTML first
Use `<nav>`, `<button>`, `<dialog>`, `<header>`, `<main>`, `<details>` before `<div role="…">`. Add an explicit `role` only when no element fits.

### 8.2 Labels & state
- Icon-only controls get an accessible name (`aria-label` or visually-hidden text). Decorative icons get `aria-hidden="true"`.
- Toggles set `aria-expanded` + `aria-controls`; checkable items `aria-checked`; tabs `aria-selected`.
- Every landmark of a repeated type gets a distinguishing `aria-label`.
- Meaningful images get real `alt`; decorative get `alt=""`.

### 8.3 Keyboard support

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

### 8.4 Focus management
- Never drop focus to `<body>`. On close/remove, move focus to the next logical element.
- Dialogs store `document.activeElement` on open and restore on close.
- Roving tabindex: only the active item is `tabindex="0"`.
- **Focus must not be obscured** by sticky headers, banners or footers (WCAG 2.2 SC 2.4.11). Use `scroll-margin-top` matched to the sticky header height.

### 8.5 Reduced motion
Wrap every animation in `@media (prefers-reduced-motion: reduce)`, **and** gate JS/GSAP animations on `matchMedia("(prefers-reduced-motion: reduce)")`, updating on its `change` event.

### 8.6 Measurable thresholds

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

### 8.7 Page-level
- Skip link to `#main` in `Layout.astro`.
- Logical heading order, no skipped levels.
- **One `h1` per page** — an agency convention for clarity and SEO, not a WCAG requirement. Deviate only with a reason.
- Visible focus everywhere.

---

## 9. Content collections & data

### 9.1 Collections (`content.config.ts`)
- Every collection is **Zod-typed**. No untyped content.
- **Use `reference()` for taxonomies** so a typo'd tag fails at build, not in production.
- **Use `image()` in the schema** for content images so they go through `astro:assets`. Paths resolve relative to the data file.
- **Model dual internal/external entries** where useful (an `externalUrl` that links off-site and skips detail-page generation).
- Keep schemas lean — add fields when real content needs them.
- A frontmatter `slug` field **overrides** the glob entry id; route on `entry.id` unless you deliberately want that.

### 9.2 Content-source seam

Components and sections take **plain data props** — arrays and objects with a shape the component owns. The mapping from a source (files today, a CMS tomorrow) to that shape lives in a loader or a `lib/` function, never inside the component.

This costs nothing now and means adding a CMS later is a loader change, not a component rewrite. When a project does add a CMS, keep the seam: file-based content and API content produce the same shape.

### 9.3 Data registries (`src/data/*.ts`)
- Centralize lookup tables (footer links, nav menus) and site identity. **No hardcoded link lists inside components.**
- Filter placeholder entries (`href: "#"`) at render time.
- **Validate references at build time** — prefer a thrown error over a silent fallback.

### 9.4 Draft handling
`draft: true` must (a) set `noindex`, and (b) be excluded from sitemap and index listings.

### 9.5 `.md` vs `.mdx` — pick by whether the author places components
- **Default to `.md`** for editorial content — prose with frontmatter and standard elements. Lighter build, authors need zero component knowledge.
- **Use `.mdx` only when the content must embed components** — importing and placing components inline, or needing JSX expressions.
- You can restyle standard elements in plain `.md` via the `components` prop when rendering `<Content />` — so reserve `.mdx` for when the *author* places components, not merely to restyle output.
- **In the starter:** `content/faq` and `content/announcements` are `.md`; `content/components` is `.mdx` because each entry renders live previews of the component it documents.

---

## 10. Performance & build optimization

### 10.1 Images — use `astro:assets`
- **Import from `src/images/` and render with `<Image>`/`<Picture>`.** Don't reference raw `/public` paths for content images.
- Put only un-optimized assets (favicons, OG/social images) in `public/`.
- Always set `width`/`height` (or let `<Image>` infer) to prevent CLS. `loading="lazy" decoding="async"` below the fold.
- **Don't lazy-load the LCP image.** The hero gets `loading="eager"` + `fetchpriority="high"`.

### 10.2 Fonts — self-hosted
**Required: self-host WOFF2.** No third-party font requests; no stack that names a family with no `@font-face` behind it.

- **Prefer variable fonts** when the family and browser support allow — one file per family covering all weights.
- **`@fontsource-variable/*` is the default source** when licensing and availability permit. Client-licensed, modified or proprietary faces are self-hosted directly — that is expected agency work, not a deviation.
- Subset to the character sets the site actually uses.
- Set `font-display` deliberately (`swap` for body, `optional` where a swap would be disruptive).
- Preload only the face(s) in the LCP element.
- Every family named in `--font-heading/-sans/-mono` must actually be loaded, or the stack silently falls through to a system font that only some machines have.

### 10.3 CSS inlining
The starter sets `build: { inlineStylesheets: 'always' }` — page CSS is inlined into `<head>` instead of emitting a render-blocking request. That's a material FCP/LCP win on small static sites.

**It is a trade, not a free win:** the shared stylesheet is duplicated into every HTML document and cannot be cached across navigations. **Re-measure and consider `'auto'`** when a site passes roughly 20 routes, or the shared CSS passes roughly 15KB gzipped. Record the decision in the project's notes.

### 10.4 Navigation prefetch
**Default: enable Astro's built-in `prefetch`** with `defaultStrategy: 'hover'` for a near-free navigation win, and `prefetchAll` on small sites. Use `viewport` strategy only for a short, high-intent link set (primary nav) — it costs bandwidth on long pages. Not yet configured in the starter (§14).

### 10.5 Third-party scripts
- **Gate tracking behind cookie consent** before launch in regulated regions.
- Analytics IDs come from env vars; the tag is injected only when the var is set.
- **Partytown is preferred for third-party scripts that survive it** — after testing consent flow, page navigation, and conversion/goal events end to end. Several vendors need forwarding configuration or don't work in a worker at all; for those, a deferred main-thread integration is correct. Test per vendor, don't assume.
- **Heavy embeds use a facade** — YouTube, maps, chat: render a lightweight placeholder and load the real iframe/SDK on interaction or when scrolled into view.

### 10.6 Animated canvases & heavy client JS

An animated `<canvas>` driven by a `requestAnimationFrame` loop is the most common cause of a poor mobile score on an otherwise fast static site. The signature is a low mobile Performance score with **green LCP and CLS** — the cost is TBT/INP from a perpetual loop plus a one-time shader/compile task in the load window. Lighthouse often rasterizes WebGL in software, so "GPU" effects land on the main thread.

**Required for any animated canvas or long-lived rAF loop:**
- Respect `prefers-reduced-motion` — draw a single static frame, never start the loop.
- Pause when offscreen (`IntersectionObserver`) and when the tab is hidden (`visibilitychange`).
- Provide a static fallback frame that looks finished, not broken.
- Never initialize a non-critical visual effect during the LCP window — defer setup/compile to idle.
- Tear the loop down on teardown (§5.6); never leave an unbounded loop running.

**Defaults (deviate with a stated reason and a measurement):**
- **Static single frame at ≤768px.** The breakpoint is a starter default and may be tuned per project.
- **Cap the frame rate** (~24–30fps) on desktop, advancing by *real elapsed time* so visual speed stays fps-independent.
- **Trim shaders** to what's used; smaller source compiles faster.
- **Guard and rAF-batch `ResizeObserver`** so layout settling doesn't thrash buffer reallocation.
- Consider device pixel ratio, `prefers-reduced-data` and battery cost when sizing the effect.

**Measure, don't assume:** set a frame-time budget per effect and profile on a representative mid-range device before shipping it.

### 10.7 Budgets & targets

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

### 10.8 Deployment — static

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
- **Headers & caching — portable.** Ship `public/_headers`: `/_astro/*` gets `Cache-Control: public, max-age=31536000, immutable` (hashed filenames), plus baseline security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a conservative CSP). Remember these apply to production (§7.6).
- Forms → a separate function/Worker with an email binding (§5.7).
- **Demo/showcase routes are gated, not deleted.** `/styleguide`, `/components` and previews live in `src/demos/`, injected by an integration only in `astro dev` or when `SHOW_DEMOS=true`. The client keeps the full showcase locally; production deploys without it.

---

## 11. Checklists

---

### 11.1 New component
- [ ] Searched the starter first — not already covered by a prop on an existing component
- [ ] Typed props: `interface Props` (or `type` for a union/polymorphic shape, §5.1); typed-union variants; defaults in the destructure
- [ ] Native-attribute passthrough (`extends HTMLAttributes<…>` + `...rest`) if it proxies an element
- [ ] Slots: default with fallback; named for regions; render-and-inspect for conditional wrappers
- [ ] Only semantic tokens / Tailwind utilities — **zero hardcoded hex AND zero raw Tailwind neutrals**
- [ ] Focus ring on every interactive element
- [ ] Native semantics first; ARIA only where native falls short; landmark labels; decorative icons `aria-hidden`
- [ ] Keyboard per §8.3 for the pattern; roving tabindex where applicable
- [ ] Focus management on open/close/remove; focus not obscured by sticky UI
- [ ] `@media (prefers-reduced-motion)` + JS `matchMedia` guard for any animation
- [ ] Animated `<canvas>`/rAF: reduced-motion static, paused offscreen/hidden, static fallback, deferred compile (§10.6)
- [ ] Per-behavior init guard (`WeakSet` or namespaced flag) + `AbortController` teardown (§5.6)
- [ ] `is:global` (if used) namespaced under `[data-component]`, with the reason in a comment
- [ ] Scoped styles use `var(--token)` or `@reference`
- [ ] Header comment + `Doc/<Component>.md` entry
- [ ] `npm run check` passes

---

### 11.2 Page done
- [ ] Page is a thin composition — no page-level `<style>`/`<script>`
- [ ] Every section builds on `SectionMain` (or the deviation is stated)
- [ ] Renders correctly at 320 / 375 / 768 / 1024 / 1440; no horizontal scroll at 320
- [ ] Renders correctly in every theme the project ships
- [ ] Content extremes handled: long headings, empty optional regions, missing images
- [ ] All internal links resolve; external links have `rel="noopener noreferrer"`
- [ ] Images go through `astro:assets`; LCP image is eager + `fetchpriority="high"`
- [ ] One `h1`; logical heading order
- [ ] §11.3 SEO and §11.4 a11y passes done for this template

---

### 11.3 SEO (per page / template)
- [ ] `title` (+ `description`) passed to Layout, or set via frontmatter
- [ ] Canonical resolves correctly (absolute, no trailing-slash mismatch)
- [ ] OG + Twitter present; OG image absolute and exists
- [ ] `noindex` for drafts/internal pages
- [ ] JSON-LD from `lib/schema.ts` for the page type
- [ ] In the sitemap if public; excluded if draft/internal

---

### 11.4 Accessibility audit (per page)
- [ ] Keyboard-only pass: every control reachable/operable; visible focus throughout; focus never obscured
- [ ] Screen-reader pass on nav, forms, dialogs
- [ ] Skip link works
- [ ] Contrast meets §8.6 thresholds in every active theme — text **and** non-text
- [ ] Target sizes meet §8.6
- [ ] 400% zoom / 320px reflow with no horizontal scroll
- [ ] `forced-colors: active` renders usably
- [ ] Reduced-motion: animations disabled/simplified with the OS setting on
- [ ] Forms: labels wired, errors in `aria-live`, `aria-invalid` on bad fields
- [ ] Images: correct `alt` (or `alt=""` if decorative)

---

### 11.5 Pre-launch

> **Executable form: the `launch` skill (§13.6)**, which runs this list in `staging` or `production` mode against the built output. Run it, then work the report; this list stays the source of truth for *what* is checked.

- [ ] `npm run check` clean (`astro check` + build)
- [ ] Real domain set in `data/site.ts`; the config guard passes (§7.1)
- [ ] Budgets met on home + 2 representative templates (§10.7)
- [ ] All active `data-theme`s render correctly; no contrast regressions
- [ ] Sitemap generated + filtered; `robots.txt` correct for production
- [ ] **Staging/preview is protected by §7.6 method 1–4** — not robots.txt alone; production headers verified to *not* carry `noindex`
- [ ] Migrations: `public/_redirects` maps every old URL → new
- [ ] `public/_headers`: `/_astro/*` immutable cache + security headers
- [ ] Analytics gated behind consent where required; real IDs via env
- [ ] Form endpoint meets §5.7 security requirements; real email received; failure alerting live
- [ ] Production build excludes demo routes (plain `npm run build` logs "Demo routes excluded")
- [ ] 404 page present and styled; favicons + OG images in place
- [ ] Production deploy verified on the real host — routing, forms, images
- [ ] Git history committed under the correct author identity; `starterVersion` recorded

---

## 12. New-client setup runbook

Phase numbers map to §2.

**1. Scaffold**

1. Copy the starter → `<client>-build`. Record `starterVersion` in `package.json` and add the starter as an `upstream` remote (§3.7).
2. Update `package.json` `name` and README; confirm the §3.5 scripts.
3. Fill in `src/data/site.ts` (name, url, description, ogImage, logo, socials). `astro.config.mjs` reads the URL from it (§7.1).
4. Add host config for the chosen target (§10.8). Add `public/_headers` and, for a migration, `public/_redirects`.
5. Add `public/robots.txt` + `src/pages/404.astro`.
6. Add `.env` keys; commit `.env.example` (§3.6). Write the per-client agent brief (§3.8).
7. Set up preview/staging protection now, not at launch (§7.6).

**2. Design-system intake**

8. Fill every `--color-*` role in `global.css` `@theme`, for every theme the project ships. Add brand-named accents separately; map `--color-intent` to the primary.
9. Decide the theme set and register the `@custom-variant`s.
10. Set per-client decisions (§4.2): radius stance, depth, accents.
11. Wire fonts (§10.2); set `--font-heading/-sans/-mono`. Tune the fluid type clamps. Rewrite `DESIGN.md`.

**3. Componentize**

12. Build pages from starter primitives; keep `components/` flat. New components → §6 template + §11.1.
13. **Keep the full starter component set** — don't delete unused components (§1, principle 10). Production stays lean via route gating and tree-shaking. Remove only deprecated or broken code.

**4. Content & SEO**

14. Define collections in `content.config.ts` (lean; `reference()` taxonomies; `image()` for content images). Keep the content-source seam (§9.2).
15. Author `lib/schema.ts` graphs; pass `jsonLd` from pages.
16. Set per-page `title`/`description`/`image`/`noindex`. Extend the sitemap filter.

**5. Optimize & QA**

17. Import images via `astro:assets`; measure against §10.7 budgets.
18. Run §11.2, §11.3 and §11.4 on every template.

**6. Launch**

19. Run §11.5. Deploy to the chosen production host. Verify production. Hand off.

---

## 13. Automated guardrails

> §13.1 and §13.6 ship today; §13.2–§13.5 are **Roadmap** (§15). The aim: standards enforced by tooling and executable procedure, not memory.

### 13.1 Type & build gate (Required — shipped)
`npm run check` = `astro check --minimumFailingSeverity warning && astro build` (§3.5). The minimum local gate before every PR. Still to do: wire it into CI.

### 13.2 Linting (Roadmap)
`eslint` + `eslint-plugin-astro` + `@typescript-eslint`. Rules worth enforcing:
- ban raw hex/rgba **and raw Tailwind neutral classes** (`text-gray-*`, `bg-zinc-*`) in components
- flag bare global selectors in `is:global` blocks (require a `[data-*]` namespace)
- ban inline `style=` and `on*=` attributes
- require `rel="noopener noreferrer"` alongside `target="_blank"`

### 13.3 Formatting (Roadmap)
`prettier` + `prettier-plugin-astro` with a shared `.prettierrc` committed to the starter.

### 13.4 CI (Roadmap)
One PR workflow: `install → npm run check → eslint → (optional) Lighthouse CI on a preview build`. Block merge on failure; assert the §10.7 budgets so performance can't silently regress.

### 13.5 Accessibility automation (Roadmap)
`axe-core` (via Playwright or `@axe-core/cli`) against key templates in CI, as a backstop to the manual §11.4 audit. Automated checks catch a minority of issues; they don't replace keyboard and screen-reader passes.

### 13.6 Agent skills & commands (Required — shipped)

The repo ships **executable forms of this document** under `.claude/`. They are how a standard gets *run* rather than remembered, and they are part of the client deliverable (§1, principle 10).

| Path | Kind | What it does |
|---|---|---|
| `.claude/skills/launch/` | Skill | Pre-launch audit — the executable form of §11.5. Takes a `staging` or `production` mode, then verifies site identity and canonicals, referenced assets, robots and sitemap, **built HTML** (not source), demo-route leakage, placeholder sweep, env keys and bindings, analytics/consent, legal pages, canvas gating, and a browser pass. Reports `BLOCKER` / `SHOULD FIX` / `NEEDS HUMAN` / `NIT` / `CLEAN`, then fixes only with permission and only from a fixed allowlist. |
| `.claude/commands/build-component.md` | Command | Guided component build — the executable form of §5 + §6. Scope → targeted behavior questions → written plan → explicit approval → build → verify in a browser before declaring done. |

**Rules for authoring and maintaining them:**

- **The skill is derived from this document, never the reverse.** When a rule here changes, update the matching step in the **same change**. A shipped audit that contradicts the standard is worse than no audit, because it launders a stale rule as a passing check.
- **Every `§` reference in a skill must resolve.** Renumbering a section in this file means updating the skills in that commit.
- **Skills state procedure and severity, not rules.** A skill says *what to check, in what order, at what severity*; the rule itself lives here (§1, no duplication). A skill that restates a rule is a second copy that will drift.
- **No client-specific stances in a starter-level skill.** Radius, palette and type choices belong in the client's `DESIGN.md` (§4.2). A skill that hardcodes one project's stance silently breaks the next build.
- **No machine-specific absolute paths.** A skill shipped in a client repo runs on someone else's machine.
- **Never report an unrun check as passed** — mark it `NEEDS HUMAN` with how to verify. The `CLEAN` section is not optional: a report listing only failures gives no coverage signal, and the reader can't distinguish a passed check from a skipped one.
- **Audit before fixing.** Report first, fix only with permission, and keep the auto-fix allowlist narrow — never user-visible copy, legal text, brand artwork or redirect maps.
- **Severity discipline.** `BLOCKER` means a visitor experiences something broken, or there is legal/brand exposure. If everything is a blocker, the label stops meaning anything.

**Roadmap:** an intake skill (§12 phases 1–2) and a standalone accessibility-audit skill (§11.4) are the obvious next two.

### 13.7 Local development notes
- **Runtime-imported dependencies need pre-bundling.** A dep imported at runtime inside a `<script>` (animation libraries and their plugins, for example) can 504 in `astro dev` on first use. Add it to `optimizeDeps.include` in the Vite config.
- **Verify against a production build whenever dev and the host runtime differ.** Routing, adapters and image services can behave differently in dev; `npm run build && npm run preview` is the source of truth before you call something broken or fixed.

---

## 14. Starter conformance gaps

Where the starter does not yet meet a rule in this document. Every entry is dated and verified. **A rule marked Required with an entry here is not gated on until the entry clears.**

*Verified 2026-08-01.*

| Rule | Gap | Action |
|---|---|---|
| §3.5 type gate | `package.json` still runs `astro sync && tsc --noEmit`, which does not check `.astro` files | Swap in `astro check --minimumFailingSeverity warning`. It currently reports **3 errors** (a demo page rendering `SliderBasicMap` with no `items` prop; missing type declarations for the `@fontsource-variable/*` side-effect imports) plus 32 hints. Fix those, then gate. |
| §7.1 site identity | `astro.config.mjs` hardcodes `site: 'https://example.com'` separately from `data/site.ts` | Import `site.url`; add the placeholder guard |
| §5.0 SectionMain | Side rules (`border-l border-r`) are unconditional — no opt-out prop | Add `sideRules?: boolean` (or a `frame` variant) |
| §10.4 prefetch | Not configured | Add `prefetch` config with `defaultStrategy: 'hover'` |
| §4.7 raw values | `HeroCanvas` and `ShinyButton` declare literal hex custom properties that don't follow the theme | Either promote to theme-aware tokens or document them under the §4.7 allowance |
| §3.7 lineage | No `starterVersion` field or upstream-remote convention in place yet | Add the field; document the pull workflow |
| §5.7 forms | The starter ships the `Form`/`Field` UI only; no reference endpoint implements the security requirements | Ship a reference endpoint meeting §5.7, or state per-project that it must be built |
| §3.6 env | No build-time assertion for required env keys | Add assertions; revisit when `astro:env` is adopted |
| §7.6 staging (vs §13.6) | The `launch` skill treats a missing `Disallow: /` on staging as a BLOCKER and accepts it as sufficient protection; §7.6 now demotes it to a secondary signal behind access control / `X-Robots-Tag` / meta-noindex | Rewrite the skill's staging row to check for one of the §7.6 methods, keeping `Disallow: /` as a bonus |
| §4.2 + §13.6 (build-component) | The `build-component` command hardcodes one client's radius stance ("every surface is a sharp rectangle, `rounded-*` off the table"), points at a machine-specific memory path, and restates token/a11y/init rules that live in this file — including an init pattern that predates §5.6's `WeakSet` recipe | Strip the client stance and the absolute path; replace restated rules with `§` pointers; align the init snippet with §5.6 |

**Cleared in v2** (verified against the code, previously listed as debts): `Button.astro` already uses `interface Props extends HTMLAttributes<"button">` with the intersection deliberately rejected; the script-init flag is already uniform across every component; there are **zero** raw Tailwind neutral classes in `components/`.

---

## 15. Roadmap

### P0 — correctness of the gate
1. Swap the type gate to `astro check` and fix the three errors it surfaces (§14).
2. Single-source the site URL with the placeholder guard (§7.1).
3. Ship a reference form endpoint meeting §5.7, or document the per-project requirement in the runbook.
4. Put preview/staging protection into the scaffold step so it's never left to launch day (§7.6).

### P1 — authoring quality
1. `sideRules` opt-out on `SectionMain` (§14).
2. Split the component templates into the three of §6 and update `ComponentTemplate*`.
3. Add `prefetch` config (§10.4).
4. `starterVersion` + upstream-remote workflow (§3.7).
5. Reduce `AGENTS.md`/`CLAUDE.md` to pointers; delete restated rules (§1).
6. Reconcile the shipped skills with v2 (§14): the `launch` staging rule against §7.6, and `build-component` against §4.2 / §5.6 / §13.6.

### P2 — tooling
1. Stand up linting (§13.2) with the listed rules; run inside `check`.
2. Prettier + shared config (§13.3).
3. Minimal CI: `check` + eslint on PR (§13.4).
4. Lighthouse CI asserting §10.7 budgets, and `axe-core` (§13.5).
5. Adopt `astro:env` for typed env (§3.6).
6. Cookie-consent gating as a reusable component (§10.5).
7. Two more skills (§13.6): design-system intake (§12 phases 1–2) and a standalone accessibility audit (§11.4).

---

## 16. Changelog

### v2 — 2026-08-01

**Correctness**
- **Type gate rewritten (§3.5).** `tsc --noEmit` does not read `.astro` files; the gate is now `astro check --minimumFailingSeverity warning`. Recorded as a gap until `package.json` follows (§14).
- **Conformance contract added (§1).** A Required rule must be true of the starter or appear in §14 with a date. §14 rewritten from an undated wish list into a verified gap table; three stale entries cleared.
- **Staging indexing (§7.6).** `Disallow: /` demoted to a secondary signal; access control / `X-Robots-Tag` / meta-noindex now required, with the `_headers` production caveat.
- **Site identity single-sourced (§7.1).** `astro.config.mjs` imports `site.url`; placeholder guard fails the build on `example.com`.
- **Version drift removed (§3.4).** Pinned framework versions replaced with a policy pointing at `package.json`.
- Token contract corrected (§4.1): `--color-warning`, `--pattern-stripe` and `--accent-line` added; radius stance restated (§4.2). Tree, root-file map and collection references corrected (§3.1, §9.5). Sitemap filter's actual role clarified (§7.5).

**Authoring**
- **Init guard changed to per-behavior** `WeakSet` (§5.6) — a single shared flag silently blocks a second behavior on the same element. Full `AbortController` teardown recipe added.
- **`astro:page-load` documented as conditional** on the client router, which is opt-in and not enabled in the starter (§5.6).
- **Props typing relaxed (§5.1):** `interface` for object shapes, `type` for unions/polymorphism/intersections; polymorphic guidance rewritten and the stale `Button` note removed.
- **Three component templates (§6)** — static (default), interactive, polymorphic. Random-id generation dropped.
- **`SectionMain`** documented as-is, with visual framing named as a brand decision and the missing opt-out logged (§14).
- Forms hardened (§5.7): server-side validation, limits, rate limiting, origin strategy, header-injection tests, logging/retention, failure alerting.
- Docs homes disambiguated (§5.8); `Hero` named as the sanctioned prefix exception (§3.2).

**New**
- **Agent skills & commands documented (§13.6)** — the `launch` pre-launch audit and the `build-component` guided build, with authoring rules: derived from this file and never the reverse, every `§` reference must resolve, procedure not rules, no client-specific stances, no machine-specific paths, audit before fixing, `CLEAN` and `NEEDS HUMAN` mandatory. §11.5 now names the skill as its executable form; two skill/standard conflicts logged in §14.
- Responsive contract (§4.5) — mobile-first, test widths, `min-w-0`, wide-content scrolling.
- `Layout.astro` prop contract (§7.2).
- Content-source seam (§9.2).
- Navigation prefetch policy (§10.4).
- Performance budgets (§10.7) alongside Lighthouse smoke targets.
- Accessibility thresholds (§8.6) and a "page done" checklist (§11.2).
- Local-development notes (§13.6); starter lineage (§3.7); no-duplication rule for agent docs (§1).

**Accessibility corrections (§8)**
- "Every component ships with ARIA" → ships the behavior it needs, native-first.
- Keyboard table split into required vs optional: Esc removed from the accordion pattern; arrow/Home/End marked optional there; automatic vs manual tab activation stated as a choice.
- "One `h1` per page" relabelled an agency convention, not a WCAG requirement.
- Added focus-not-obscured, forced-colors, target size, reflow and text-spacing checks.

**Performance reframed**
- Canvas rules split into Required behavior vs tunable Defaults, with a measurement rule; superlative claim and project-specific result removed (§10.6).
- `inlineStylesheets: 'always'` given an explicit re-measure trigger (§10.3).
- Partytown made per-vendor and test-gated (§10.5).
- Fonts: requirement is self-hosted WOFF2, variable preferred, Fontsource as the default source rather than the only one (§10.2).
- Hosting made host-neutral (§10.8): Cloudflare Workers static assets preferred, Pages supported, Netlify equal; downstream steps refer to "the production host".

---

*Maintained in the starter. Propose changes via PR against this file; once merged, roll relevant items into active client repos.*
