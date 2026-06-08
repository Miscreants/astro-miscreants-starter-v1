# Miscreants Astro Build Standards

> The single source of truth for how we build Astro sites for clients.
> This lives in `astro-miscreants-starter-v1` because the starter is the canonical baseline every client repo inherits. When a rule here changes, it changes here first, then propagates to client repos.

**Status:** v1 — the standard the starter implements.
**Audience:** anyone building or reviewing an Astro site at Miscreants.
**How to use:** Read §1–§2 once. Keep §11 (Checklists) and §12 (Runbook) open while you work. Reviewers gate PRs on §11.

---

## Table of contents

1. [Why this exists](#1-why-this-exists)
2. [The build process (lifecycle)](#2-the-build-process-lifecycle)
3. [Project structure & conventions](#3-project-structure--conventions)
4. [Design tokens & styling](#4-design-tokens--styling)
5. [Components: the authoring standard](#5-components-the-authoring-standard)
6. [Component author template](#6-component-author-template)
7. [SEO, head & metadata](#7-seo-head--metadata)
8. [Accessibility](#8-accessibility)
9. [Content collections & data](#9-content-collections--data)
10. [Performance & build optimization](#10-performance--build-optimization)
11. [Checklists](#11-checklists)
12. [New-client setup runbook](#12-new-client-setup-runbook)
13. [Automated guardrails](#13-automated-guardrails)
14. [Known cleanups in the starter](#14-known-cleanups-in-the-starter)
15. [Roadmap](#15-roadmap)

---

## 1. Why this exists

We build multiple client sites from one starter. Without a written standard, every project re-invents how it names files, defines colors, types props, exposes slots, and wires SEO. This document codifies the patterns the starter already implements so the next build looks like the last one — and so reviewers have one rulebook to point at.

### Core principles

These ten principles are the spine of the system; every section below is an elaboration of one of them.

1. **The starter is the canonical source of truth.** When a rule or pattern changes, it changes in the starter first, then propagates to client repos.
2. **Client sites inherit the starter; proven improvements flow back.** Client repos pull from a clean baseline and don't each carry their own fixes — fixes proven on a build get ported back here.
3. **Pages stay thin and compose sections.** A `pages/*.astro` file reads like a table of contents: a `<Layout>` wrapping a short list of sections (§5.0).
4. **Sections own page-specific content and layout.** A `Section*` component encapsulates one chunk of a page — its landmark, content, and markup — so the page file stays readable (§5.0).
5. **Reusable UI lives in typed, open components.** Primitives (`Button`, `Card`, `Field`) are fully parameterized (`interface Props` + slots), token-styled, and carry no page-specific content (§5).
6. **Semantic tokens only — never raw colors or one-off values.** Components reference roles (`bg-intent`, `text-fg-muted`), never hex or raw Tailwind neutrals (`text-gray-700`). Theme swaps "just work" through the cascade (§4).
7. **Accessibility, keyboard, focus, and reduced motion are authored from day one** — never retrofitted. ARIA, keyboard support, focus management, and reduced-motion ship with every component (§8).
8. **Content, SEO, schema, redirects, and site identity are centralized.** One source of truth each — `site.ts`, `Seo.astro`, `lib/schema.ts`, `_redirects` — so each lives in exactly one place (§7).
9. **Static output is the default; client JS is added only when it earns its cost.** Astro ships zero JS by default; interactivity is progressively enhanced and degrades to working HTML when JS fails (§5.6, §10).
10. **The production deploy is lean; the repo keeps the full toolbox, docs, and examples.** Clients receive the *full* repo — every component, the showcase, and the docs — because their AI agent uses all of it to build pages themselves (this is the point of moving to Astro). "Lean" applies to the **production deploy**, not the repo: demo/showcase routes are gated out of the live build, never stripped from the codebase (§10.6). The docs are agent fuel — keep them rich and in-repo.

> **One way to do a thing.** Where two patterns exist, this doc picks one — consistency beats local cleverness. The runbook (§12) and checklists (§11) are *derived views* of these principles and the starter's actual state: when a principle or the starter changes, update §11/§12 in the **same** change so they never drift.

### How rules are labeled

To separate hard standards from preferences and future work, rules fall into four tiers:

- **Required** — a standard reviewers gate on; a violation blocks a PR (e.g. semantic tokens only, accessibility, one `h1` per page).
- **Default** — the standard choice; deviate only with a stated reason (e.g. `.md` over `.mdx`, static over SSR, start a section closed).
- **Allowed with reason** — permitted when justified and scoped (e.g. `is:global` namespaced under a `data-*` attribute, a genuinely page-unique one-off style).
- **Roadmap** — not yet enforced; tooling or work still to land (everything in §13, tracked in §15).

---

## 2. The build process (lifecycle)

Every client engagement follows the same arc. Each phase has an owner-facing checklist in §11 and a step-by-step in §12.

```
┌─ 0. Kickoff ──────────────────────────────────────────────────────┐
│  Gather brand assets: colors, fonts, logos, design refs (Figma).   │
│  Confirm hosting target (Cloudflare Pages or Netlify; static).     │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 1. Scaffold ─────────────────────────────────────────────────────┐
│  Clone starter → rename → wire site URL, GA, wrangler.jsonc.       │
│  Keep demo routes (src/demos, gated).                              │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 2. Design system intake ─────────────────────────────────────────┐
│  Translate brand into @theme tokens (colors, fonts, radius,        │
│  motion). Decide light/dark/brand themes. Rewrite DESIGN.md.       │
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
│  astro:assets images, fonts, Lighthouse, a11y audit, build clean.  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 6. Launch ───────────────────────────────────────────────────────┐
│  Pre-launch checklist, deploy to CF Pages, verify prod, hand off.  │
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
│   └── _docs/           # internal-only doc helpers (Preview, PropsTable)
├── content/             # Markdown/MDX content collections
├── content.config.ts    # Zod schemas for every collection
├── data/                # static data & site identity (site.ts, *.json)
├── images/              # source images imported through astro:assets
├── layouts/             # Layout.astro and any page-type layouts
├── lib/                 # logic helpers — JSON-LD builders (schema.ts)
├── pages/               # kebab-case routes
└── styles/              # global.css
```

**Rules:**
- **Flat `components/` directory** with semantic filename prefixes (`Card*`, `Nav*`, `Section*`). Only group into a subfolder when a component is a true family (Card variants live as sibling files `CardFeatured`, `CardIcon`, …, not nested).
- **One component = one PascalCase file.** No `index.astro` component folders.
- **`_docs/` underscore prefix** keeps Preview/PropsTable out of the public component list.
- **`lib/` for logic helpers** (schema builders), **`data/` for static registries and site identity**. Don't put either inside `components/`.

### 3.2 Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | `PascalCase.astro` | `CardFeatured.astro` |
| Page file & route | `kebab-case` | `contact.astro` → `/contact` |
| Dynamic route | bracket placeholder | `[...slug].astro` |
| Data / lib file | `kebab-case` / `camelCase.ts` | `site.ts`, `schema.ts` |
| Content slug | `kebab-case`, matches frontmatter | `series-a.md` |
| CSS data hook | `data-<component>` kebab | `data-field="component"` |
| Script-init flag | `data-script-initialized` (§5.6) | — |
| Semantic color | `--color-<role>` | `--color-fg-muted` |
| Typography utility | `@utility h1`, `text-body-lg` | — |

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

Baseline:
- Astro `^6.1.x`, Tailwind `^4.2.x` (via `@tailwindcss/vite`), Node `>=22.12.0`
- `astro-icon` (icons via `@iconify-json/*`), `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/partytown`
- Variable fonts via `@fontsource-variable/*`

When bumping a major (Astro, Tailwind), bump the **starter first**, validate, then roll clients forward.

### 3.5 Required scripts

**Required — already in the starter.** The local gate is `npm run check`. Every client repo keeps these identical:

```jsonc
"scripts": {
  "dev":       "astro dev",
  "build":     "astro build",
  "preview":   "astro preview",
  "typecheck": "astro sync && tsc --noEmit",
  "check":     "npm run typecheck && astro build"
}
```

`@astrojs/check` + `typescript` are already devDeps. `npm run check` is the local gate before every PR.

### 3.6 Environment variables & secrets

- **`PUBLIC_` prefix = public.** Only `PUBLIC_*` vars reach client code / the bundle (Astro rule). Everything else is build/server-only. **Never put a secret in a `PUBLIC_` var.**
- Read via `import.meta.env.PUBLIC_*` (client) or `import.meta.env.*` (build-only).
- **Commit `.env.example`** (keys, no values); **never commit `.env`** (it's gitignored).
- Build-time vars are set in the host dashboard (Cloudflare/Netlify) or the per-host config file. Runtime secrets (e.g. the contact-form Worker) live in the host's secret store / Worker bindings (§5.7) — never in the repo.

### 3.7 Git, branching & deploy

- **Push source, never `dist`.** The host builds from source; `dist/` stays gitignored.
- **One branch deploys.** The production branch (usually `main`) is wired to the host's Git build — pushing it ships. **Know which *remote* is production before you push** (a repo often has an agency mirror *and* the client's production repo).
- Commit under the **correct author identity**; present-tense, conventional messages.
- Non-trivial work goes on a branch → PR → merge to the deploy branch. Don't commit straight to production for anything risky.

### 3.8 Repo as an agent platform (`CLAUDE.md`)

The client builds pages with an AI agent, so the repo must **brief that agent** — the docs are part of the deliverable (§1, principle 10). Every client repo ships a root **`CLAUDE.md`** (and/or `AGENTS.md`) that:
- points to `DESIGN.md` (tokens/brand) and `STANDARDS.md` as **authoritative**;
- states the non-negotiables once: semantic tokens only, accessibility required, **pages compose sections** (§5.0), `astro:assets` for images, gate animated canvases (§10.5);
- gives a **"how to add a page" recipe**: create `src/pages/<route>.astro` → wrap in `Layout` with `title`/`description`/`jsonLd` → compose existing sections → add new `Section*` components for new chunks → `npm run check`;
- says **where to look**: primitives in `components/`, the live showcase at `/components` (dev), content in `content/`.

Keep it short and imperative — it's the agent's front door, not a manual.

---

## 4. Design tokens & styling

This is the heart of the system. **Get this right at intake (process phase 2) and the rest of the build is fast.**

### 4.1 The token model

All design decisions live as CSS custom properties in `src/styles/global.css`, declared in a Tailwind v4 `@theme` block, with themes registered via `@custom-variant` and overridden per theme via `[data-theme="..."]`. Components never see raw values — only semantic roles.

**Semantic color roles (the contract).** Every client defines exactly these roles; only the values change. The starter ships a monochrome palette (light default):

```css
@theme {
  /* Canvas — page background */
  --color-canvas: #f3f3f3;

  /* Surfaces */
  --color-panel: #f9f9f9;          /* cards, popovers */
  --color-panel-muted: #ebebeb;    /* subtle surfaces, hover states */

  /* Text */
  --color-fg: #0a0a0a;             /* body text */
  --color-fg-muted: #525252;       /* secondary / captions */
  --color-fg-subtle: #8a8a8a;      /* disabled / placeholder */
  --color-fg-on-intent: #ffffff;   /* text ON an intent surface */

  /* Intent — primary action (monochrome: equals fg by design) */
  --color-intent: #0a0a0a;
  --color-intent-hover: #1a1a1a;

  /* Borders */
  --color-stroke: #d7d7d7;         /* hairline */
  --color-stroke-strong: #bdbdbd;  /* emphasized dividers */

  /* Focus ring */
  --color-focus: #0a0a0a;

  /* Status — the only permitted accent hues */
  --color-error: #dc2626;
  --color-success: #16a34a;
}
```

> **When a client has brand color**, add brand-named swatches (`--color-<brand>: …`) **separately** and *map* `--color-intent` to the primary. Keeping the brand palette distinct from `intent` lets the action color and decorative brand colors move independently, and lets `intent` flip per theme without disturbing the brand swatches. Same role contract, different values.

**Theme registration & overrides.** Register variants, then re-declare the same role names per theme. The starter ships `light` (default) + `dark`:

```css
@custom-variant dark  (&:where([data-theme="dark"],  [data-theme="dark"]  *));
@custom-variant brand (&:where([data-theme="brand"], [data-theme="brand"] *));

[data-theme="dark"] {
  --color-canvas: #0a0a0a;
  --color-fg: #f5f5f5;
  --color-intent: #f5f5f5;     /* monochrome intent flips with the theme */
  /* ...all roles... */
  color-scheme: dark;          /* don't forget — fixes native controls/scrollbars */
}
```

A single `data-theme` attribute on any ancestor flips every descendant through the cascade. No `prefers-color-scheme` magic — themes are explicit and author-controlled.

### 4.2 Per-client design decisions (set at intake)

These vary by brand. Decide them and record them in the client's `DESIGN.md`. The starter's defaults:

| Decision | Starter default | Note |
|---|---|---|
| Default theme | `light` | client may ship dark-default |
| Intent color | monochrome (`= fg`) | map to the brand primary when branded |
| Brand accents | none | add as separate `--color-<brand>` tokens |
| Border radius | `0` (sharp rectangles); `--radius-*` tokens defined but unused | **rounding is a brand choice** — don't copy one client's stance to another |
| Depth | tonal, no shadows | add `--shadow-*` tokens only if the design uses them |
| Heading / body / mono font | Archivo Variable / Inter / JetBrains Mono | swap per brand; keep the three roles |

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
@utility text-body-lg {
  font-size: clamp(0.9375rem, 0.8839rem + 0.2679cqi, 1.125rem); /* 15 → 18px */
  line-height: 1.55;
}
```

**Rules:**
- **Always use `rem`, never `px`, for font sizes.** `px` ignores the user's browser font-size preference. Mapping Figma px → rem: 16→1, 18→1.125, 24→1.5.
- Fluid type needs a query container. `body` is the default container. Drop `container-type: inline-size` (the `cq` / `container-large` utilities) on a wrapper to **re-anchor** the scale to that wrapper's width.
- Three font roles only: `--font-heading`, `--font-sans` (body), `--font-mono`.

### 4.4 Layout & spacing utilities

Use the semantic layout `@utility` recipes instead of ad-hoc padding:

```css
@utility container-large  { @apply mx-auto w-full max-w-7xl; container-type: inline-size; }
@utility container-page   { @apply mx-auto w-full max-w-[90rem] px-site-margin; }
@utility section-gutter   { @apply px-4 md:px-12 lg:px-24; }
@utility section-padding  { @apply py-24 md:py-24; }   /* + -xs/-sm/-lg variants */
```

Page sections reach for `section-padding*` + `section-gutter` rather than raw `py-*`/`px-*`. This keeps vertical rhythm consistent across pages and clients.

### 4.5 Motion tokens

Durations and easings are centralized so "how long is a hover" has one answer:

```css
--cubic-default: cubic-bezier(0.625, 0.05, 0, 1);
--duration-default-half: 0.4s;
--timing-default-half: var(--duration-default-half) var(--cubic-default);
```

**Rule:** components reference `--timing-*` / `--duration-*`. Don't hardcode `300ms` or invent a one-off easing in a component. If a motion need isn't covered, add a token, don't inline a number.

### 4.6 Accessing tokens inside scoped `<style>` — the #1 gotcha

Astro scoped/`is:global` `<style>` blocks **cannot resolve** `@theme` tokens through `@apply`/`theme()` by default. This is the most common source of drift. **The standard, in priority order:**

1. **Prefer Tailwind utility classes in markup** (`class="bg-intent text-fg-on-intent"`). No custom CSS needed — this always resolves tokens correctly. This is the default.
2. **When you write a `<style>` block, reference the CSS variable directly** — custom properties *do* cascade into scoped styles:
   ```css
   <style>
     .thing { background-color: var(--color-intent); color: var(--color-fg-muted); }
   </style>
   ```
3. **If you need `@apply` or `theme()` inside the block,** add `@reference "../styles/global.css";` at the top.

**Never** hardcode a hex/rgba or a raw Tailwind neutral (`text-gray-700`) that duplicates a token — it won't follow theme changes. If a status needs a color, add a `--color-*` token for it.

### 4.7 Global base rules

These live in `global.css` `@layer base` and are house standards:

- **Cursor:** all interactive controls get `cursor: pointer`; disabled gets `not-allowed`:
  ```css
  :where(a[href], button:not(:disabled), [role="button"]:not([aria-disabled="true"]), summary) { cursor: pointer; }
  :where(button:disabled, [aria-disabled="true"]) { cursor: not-allowed; }
  ```
- **Body defaults:** `body { @apply bg-canvas text-fg min-h-screen; }`
- **Orphans:** headings `text-wrap: balance`; body `text-wrap: pretty`.
- **Reduced motion:** every `transition`/`animation` wrapped in `@media (prefers-reduced-motion: reduce)`. Non-negotiable (see §8).

---

## 5. Components: the authoring standard

The starter's components are the reference implementations. Each rule below is tied to how they're built.

### 5.0 Composition model: pages → sections → components

Astro lets you build the same page a dozen ways. To make every build feel the same, treat the UI as **three tiers**, and let each page read like a table of contents.

**1. Primitives & blocks — *open* components (props + slots).**
Reusable UI units with a clear identity: `Button`, `Card`, `Field`, `Tag`, `ResourceCard`. They live flat in `components/`, are fully parameterized (typed `interface Props` + slots — §5.1/§5.3), are styled only with tokens, and contain **no page-specific content**. Built to be used many times — in this project and the next.

**2. Sections — *closed* components (little or no props).**
A whole page section: `Hero`, `SectionWhyGhost`, `SectionGetInTouch`. Lives flat in `components/` with a `Section*` prefix (group into `components/<domain>/` only once a build has many — per §3.1), **owns its own semantic `<section>` landmark**, and composes primitives + content inline. **Closed by default**: it bakes in its content and exposes *no* props. A section's job is to encapsulate a chunk of a page so the page file stays readable — not to be reusable.

**3. Pages — composition only.**
`pages/*.astro` reads like a table of contents: a `<Layout>` wrapping a short list of sections. Push markup *down* into sections; keep pages thin. **Avoid page-level `<style>`/`<script>`** — custom CSS or behavior in a page file is a signal it belongs in a section component (or, if reusable, in `global.css` / an `@utility`). Astro allows both in pages, but a page growing its own styles/scripts is the cue to extract a section. Small, genuinely page-unique one-offs are the rare exception.

```astro
<Layout title="…" jsonLd={homepageSchema}>
  <Hero />
  <SectionWhyGhost />
  <SectionGetInTouch />
</Layout>
```

**Open vs closed — the test:** *"Will this be reused with different content?"* Yes → **open** component with props/slots. No → **closed** section. When unsure, start closed; adding props later is easy, while removing speculative props is friction. Don't parameterize a section "just in case."

**Components vs raw markup — the balance.**
The "extract after the 2nd use" rule holds, but don't over-correct into atomizing every wrapper — that's *less* clean in Astro (prop-drilling, a maze of tiny files, harder for humans *and* the AI agent to read). Inside a section, **raw semantic HTML + Tailwind is expected and correct** for one-off layout.
- **Extract to a component** when the thing has **identity, behavior, or reuse**: reused ≥2×, *or* it carries interaction/state/script, *or* it has a nameable identity with variants (even used once, e.g. `Hero`), *or* it owns accessibility logic that must stay consistent (`Button`, `Modal`).
- **Leave it as raw markup** when it's a purely-presentational one-off wrapper (a flex row, a grid). Don't invent a `<Stack>`/`<Row>` for every `<div>`.

Rule of thumb: **components for *things* (units of UI/behavior), raw markup for *arrangement* (layout within a section).** Cleanliness comes from the section boundary, not from componentizing every `<div>`.

**"Raw markup" ≠ inline CSS/JS.** It means semantic HTML + Tailwind classes, *not* `style="…"` or `onclick="…"`. It's the *fastest* path (Astro ships zero JS by default; Tailwind is one shared, atomic, inlined stylesheet — §10.3), and it's legible because the whole section reads in one file. Keep the three concerns separated:
- **Structure** → semantic HTML + Tailwind utilities.
- **Styling** → Tailwind utilities or a scoped `<style>` using `var(--token)` (§4.6). **Never inline `style="…"`** — it bypasses tokens/theming, can't do hover/focus/media states, and isn't cacheable.
- **Behavior** → an Astro `<script>` (bundled, type-checked, tree-shaken — *not* "inline JS"; §5.6). **Never inline `onclick="…"`.** If a section accumulates substantial script, that's the signal to promote it to a component.
- Long Tailwind class lists are the one real noise source — fix by extracting a recurring combo into an `@utility` recipe (§4.4), not by reaching for inline `style`.

### 5.1 Props typing — ONE style: `interface Props`

**Standard:** declare props with `interface Props`. It's the dominant pattern across the starter and gives the cleanest consumer IDE hints.

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

**Exception — components that proxy a native element** (Button, anchor-or-button) should extend native attributes so callers can pass any `data-*`, `aria-*`, or event handler without you enumerating them:

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

> `Button.astro` currently uses a `type Props = HTMLAttributes<"button"> & HTMLAttributes<"a"> & {...}` intersection. It works, but it's the **non-standard** form (§14). For a polymorphic component (renders `<a>` *or* `<button>`), prefer `interface Props extends HTMLAttributes<"button">` and add the few anchor props (`href`, `target`, `rel`) explicitly. Use `interface` everywhere.

### 5.2 Defaults

Set defaults in the destructure, not with `??` scattered through the template:

```astro
const { label = "Learn More", variant = "primary", arrowDirection = "right" } = Astro.props;
```

### 5.3 Slots — default + named, with introspection

- **Default slot** for the component's main content; provide a fallback if optional: `<slot>{label}</slot>`.
- **Named slots** for distinct regions: `<slot name="title" />`, `<slot name="media" />`, `<slot name="footer" />`.
- **Introspect to wire conditional regions + ARIA.** Two patterns:
  - Cheap check: `Astro.slots.has("title")` (Modal uses this to decide `aria-labelledby`).
  - **Robust check** when a slot may be passed but render empty (e.g. `{flag && <img slot="media" />}`): render then inspect, because `has()` returns true even for falsy conditional content:
    ```astro
    const mediaContent = Astro.slots.has("media") ? await Astro.slots.render("media") : "";
    const hasMedia = mediaContent.trim().length > 0;
    ```
- Hide empty slotted regions with CSS `:empty { display: none }`.

**Prop vs slot decision:** plain string/number/boolean → **prop**. Rich markup the caller composes (media, a CTA, arbitrary body) → **slot**. Don't accept HTML strings as props. (Form controls like `Field` are intentionally all-prop, no slots, because their shape is fixed.)

### 5.4 Variants & polymorphism

- Variants are a **typed union prop** (`variant?: "primary" | "secondary" | "tertiary"`), resolved to classes via `class:list` or a lookup map. Never a freeform string.
- Polymorphic tag selection: `const Tag = href && !disabled ? "a" : "button"`, then `<Tag ...>`.

### 5.5 Styling components

- Reach for **Tailwind utilities with semantic tokens** first (`bg-panel`, `text-fg-muted`, `border-stroke`).
- **Focus ring is mandatory and built-in** on every interactive element. The starter's house style:
  ```
  focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
  ```
- **`is:global` is allowed but must be justified and namespaced.** Components that style their own children/siblings dynamically (Field, Avatar, Modal, Media) may use `is:global`, but **only** scoped under a component data attribute: `[data-field="component"] { ... }`. Never emit a bare global class like `.field__label` — that leaks site-wide and collides. If a style is truly global, put it in `global.css` deliberately.

### 5.6 Client-side scripting

- **Drive behavior from `data-*` attributes**; keep ARIA/semantic attributes separate from scripting hooks (`data-modal-open` for JS; `role="dialog"` for a11y).
- **Guard single initialization** so handlers don't double-bind across view transitions. **Standardize the flag name: `data-script-initialized`** (kebab form):
  ```js
  if (el.dataset.scriptInitialized) return;
  el.dataset.scriptInitialized = "true";
  ```
  For page-global singletons, `if (!(window as any).__modalInit) { ... }` is fine.
- **Re-init dynamic content** by listening to `astro:page-load` so components added after navigation still wire up.
- **Clean up** listeners/observers/timeouts (AbortController or a cleanup array) for components that mount/unmount.
- **Custom events bubble and are cancelable** so parents can intercept (`form:success`, `tag:close`).

### 5.7 Forms — use `Form` + `Field`, always progressively enhanced

`Form.astro` is the standard for every form:
- Works without JS (native submit to `action`); JS intercepts and `fetch`-posts, setting `data-form-status="submitting|success|error"`.
- **Honeypot on by default** — override the honeypot field name to something less guessable per project.
- Validation surfaces in each `Field`'s `[data-field-error]` region; first invalid field receives focus.
- Success/error feedback in `role="status"`/`role="alert"` live regions.
- On a **pure-static Cloudflare** site, the form posts to a **separate Worker** with a `send_email` binding (Pages can't use `send_email`); mount it on a same-origin `/api/*` route. Don't use `mimetext` in the Worker — hand-roll the MIME string and sanitize header CR/LF.

### 5.8 Documentation & not modifying shared components

- Every reusable component ships with a header comment (purpose, key props, gotcha) and a docs entry in `components/_docs/` for now. The target home for live showcase docs is `content/components/*.mdx`.
- **Don't modify a shared component for a one-off page need.** Add a prop or build a page-local wrapper. If a shared primitive genuinely must change, that's a deliberate, reviewed change — ask first, don't drive-by edit.

### 5.9 Prop & event naming

- **Booleans read as flags/state**, positive: `disabled`, `withArrow`, `hideLabel`, `isOpen` — prefer `is*/has*/with*`; avoid negatives (`hidden`, not `notVisible`).
- **Always accept a `class` passthrough** (`class?: string`, merged via `class:list`) so callers can extend styling without forking the component.
- **Variants are unions**, not freeform strings: `variant` / `size` / `tone` (§5.4).
- **Custom events are `namespace:verb`**, bubbling + cancelable: `tag:close`, `form:success` (§5.6).

---

## 6. Component author template

Copy this as the starting point for any new component. It bakes in every §5 rule. The starter ships `ComponentTemplateBasic.astro` / `ComponentTemplateAdvanced.astro` — keep those in sync with this.

```astro
---
/**
 * <ComponentName>
 * One line on what it's for.
 *
 * @prop label   - Visible text / accessible name.
 * @prop variant - Visual style. Default "primary".
 * @prop size    - Scale. Default "md".
 * Gotcha (if any): ...
 */
interface Props {
  /** Accessible name / visible label. */
  label: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  class?: string;
}

const {
  label,
  variant = "primary",
  size = "md",
  hideLabel = false,
  class: className,
} = Astro.props;

// Slot introspection drives conditional regions + ARIA wiring.
const hasIcon = Astro.slots.has("icon");

// Stable id for ARIA relationships when needed.
const uid = `cmp-${Math.random().toString(36).slice(2, 9)}`;
---

<div
  class:list={[
    "component",
    `component--${variant}`,
    `component--${size}`,
    className,
  ]}
  data-component
>
  {hasIcon && <span class="component__icon" aria-hidden="true"><slot name="icon" /></span>}

  <span class:list={["component__label", hideLabel && "sr-only"]} id={`${uid}-label`}>
    <slot>{label}</slot>
  </span>
</div>

<style>
  /* Reference tokens via var() — they cascade into scoped styles. */
  .component {
    color: var(--color-fg);
    background-color: var(--color-panel);
    border: 1px solid var(--color-stroke);
  }
  .component--primary {
    background-color: var(--color-intent);
    color: var(--color-fg-on-intent);
  }
  .component__icon:empty { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .component { transition: none; }
  }
</style>

<script>
  function initComponent() {
    document.querySelectorAll("[data-component]").forEach((el) => {
      const node = el as HTMLElement;
      if (node.dataset.scriptInitialized) return;   // standardized flag name
      node.dataset.scriptInitialized = "true";
      // wire interactions here
    });
  }
  initComponent();
  document.addEventListener("astro:page-load", initComponent);
</script>
```

**Interactive variant additions** (buttons, toggles, menus): add the focus-ring classes from §5.5, full keyboard handling from §8, and `aria-*` state attributes.

---

## 7. SEO, head & metadata

The starter ships a production SEO system: a `Seo.astro` component, a `lib/schema.ts` JSON-LD builder, a `data/site.ts` identity file, and a filtered sitemap. Per-page SEO is a matter of passing props (or relying on frontmatter).

### 7.1 Site identity — `src/data/site.ts`

One file owns site-wide identity. Edit it once per project:

```ts
export const site = {
  name: "Your Site Name",
  url: "https://example.com",        // keep in sync with astro.config `site`
  description: "One-line description…",
  ogImage: "/og.jpg",                // in /public
  logo: "/logo.png",                 // in /public
  twitter: "",                       // @handle (optional)
  sameAs: [] as string[],            // social profiles (optional)
};
```

`Seo.astro` and `lib/schema.ts` both read from it, so name/URL/image live in exactly one place.

### 7.2 The `Seo.astro` component

`src/components/Seo.astro` owns all head metadata. Contract:

```ts
interface Props {
  title: string;
  description?: string;     // defaults to site.description
  ogType?: "website" | "article";
  image?: string;          // defaults to site.ogImage; resolved absolute
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
```

It emits `<title>` + description, canonical (computed from `Astro.url`, absolute against `Astro.site`), `robots` when `noindex`, favicons, full Open Graph, Twitter Card, and one `<script type="application/ld+json">` per schema in `jsonLd`.

`Layout.astro` renders `Seo` and falls back to MD/MDX **frontmatter** for `title`/`description`/`theme`, so content pages don't pass props manually:

```astro
<Seo title={title} description={description} ogType={ogType} image={image} noindex={noindex} jsonLd={jsonLd} />
```

### 7.3 JSON-LD via `lib/schema.ts`

Structured data lives in `src/lib/schema.ts` as **pre-built graphs + builder functions**, not inline in pages:

- **`homepageSchema`** — a `@graph` with `Organization` + `WebSite` + `WebPage`, all built from `site.*`.
- **`articleSchema({ path, title, description, datePublished, … })`** — returns `Article` + `BreadcrumbList` for any post/resource page, with an optional `breadcrumbParent`.
- **Cross-referencing via `@id`**: every node has a stable `@id` (`${site.url}/#organization`, `/#website`) and others reference it — one canonical Organization/WebSite, referenced everywhere, no duplication.

Pages pass it through:

```astro
<Layout title="…" jsonLd={homepageSchema}>
<Layout title={post.title} ogType="article" jsonLd={articleSchema({ path: `resources/${slug}`, ... })}>
```

**Standard:** homepage emits Organization + WebSite; content detail pages emit Article + BreadcrumbList; FAQ pages emit FAQPage. Extend `schema.ts` per project rather than inlining schema in pages.

### 7.4 Sitemap

`@astrojs/sitemap` is wired in `astro.config.mjs` with a filter that **excludes internal/demo routes**:

```js
const SITEMAP_EXCLUDE = ['/styleguide', '/components', '/tve-preview'];
// ...
sitemap({
  filter: (page) => {
    const { pathname } = new URL(page);
    return !SITEMAP_EXCLUDE.some((p) => pathname === p || pathname.startsWith(p + '/'));
  },
}),
```

Extend `SITEMAP_EXCLUDE` per project. **Set `site` in `astro.config.mjs`** (and match `site.url` in `data/site.ts`) so canonical + sitemap URLs are absolute — both are currently the placeholder `https://example.com`.

### 7.5 Draft & announcement handling

- `draft: true` content should set `noindex` (pass it from frontmatter) and be excluded from listings and the sitemap.
- Announcements are a scheduled collection (`startsAt`/`endsAt`/`enabled`/`priority`); `Layout.astro` picks the top active one for the nav banner at build time.

### 7.6 Cloudflare/Astro SEO gotchas (pure-static sites)

- **Don't call `shiki.codeToHtml` directly in component frontmatter** — it silently truncates static HTML on Cloudflare. Use `<Code />` from `astro:components`.
- For **pure-static** sites, **drop the Cloudflare adapter** so Astro's default Sharp image service runs; the CF adapter's image service is a passthrough and ships broken AVIF. Point `wrangler` `assets.directory` at `./dist` (the starter is already adapter-free static).
- A path matching a dynamic route but excluded from `getStaticPaths` 500s in CF **dev** with a misleading "module is not defined" — verify routing against a **production build**, not dev.
- Pre-launch: `site`/JSON-LD/canonical URLs may intentionally point at the production domain before DNS cutover. Don't "fix" them back to staging.

### 7.7 robots.txt & error pages

- Ship **`public/robots.txt`**: allow crawling and link the sitemap (`Sitemap: https://<site>/sitemap-index.xml`). On a staging/preview deploy, serve a `Disallow: /` variant so it isn't indexed.
- Ship a styled **`src/pages/404.astro`** (uses `Layout`, on-brand). Cloudflare Pages and Netlify both serve it automatically for unknown static routes.

---

## 8. Accessibility

Accessibility is a build requirement, not a phase. **Every component ships with ARIA, keyboard support, focus management, and reduced-motion from the start.** (Enforced in `CLAUDE.md`.)

### 8.1 Semantic HTML first
Use `<nav>`, `<button>`, `<dialog>`, `<header>`, `<main>` before `<div role="...">`. Add explicit `role` only when no element fits.

### 8.2 Labels & state
- Icon-only controls get `aria-label`. Decorative icons get `aria-hidden="true"` (`Icon.astro` does this automatically: `label` → `role="img"` + `aria-label`, else `aria-hidden`).
- Toggles set `aria-expanded` + `aria-controls`; checkable items `aria-checked`; tabs/list items `aria-selected`.
- Every landmark of a repeated type gets a distinguishing `aria-label`.
- Meaningful images get real `alt`; decorative get `alt=""`.

### 8.3 Keyboard support (per interactive component)

| Component | Keys |
|---|---|
| Button | Enter / Space (native) |
| Modal/Dialog | native `<dialog>`: Esc + focus trap; restore focus to trigger on close |
| Tabs | Arrow keys move, Home/End jump, Enter/Space activate; roving `tabindex` |
| Accordion | Arrow navigate, Enter/Space toggle, Esc close |
| Dropdown/Menu | ArrowDown opens+focuses first, Esc closes+returns focus to trigger |

`Tabs.astro` is the reference for full ARIA wiring + keyboard + reduced-motion done correctly. Read it before building any new interactive component.

### 8.4 Focus management
- Never drop focus to `<body>`. On close/remove, move focus to the next logical element.
- Modal stores `document.activeElement` on open, restores on close (native `<dialog>` handles the trap).
- Roving tabindex: only the active item is `tabindex="0"`.

### 8.5 Reduced motion
Wrap every animation in `@media (prefers-reduced-motion: reduce)`, **and** gate JS/GSAP animations on `matchMedia("(prefers-reduced-motion: reduce)")`, updating on its `change` event.

### 8.6 Page-level
- Skip link to `#main` (`sr-only focus:not-sr-only …`) in `Layout.astro`.
- One `h1` per page; logical heading order.
- Visible focus everywhere.

---

## 9. Content collections & data

### 9.1 Collections (`content.config.ts`)
- Every collection is **Zod-typed**. No untyped content.
- **Use `reference()` for taxonomies** so a typo'd tag fails at build, not in production.
- **Use `image()` in the schema** for content images (`heroImage: image().optional()`) so they go through `astro:assets`.
- **Model dual internal/external entries** where useful (e.g. an `externalUrl` that links off-site and skips detail-page generation).
- Keep schemas lean — add fields when real content needs them.

### 9.2 Data registries (`src/data/*.ts`)
- Centralize lookup tables (footer links, nav menus) and site identity (`site.ts`). **No hardcoded link lists inside components.**
- Filter placeholder entries (`href: "#"`) at render time so incomplete data doesn't surface.
- **Validate references at build time** where a registry can silently miss — prefer a thrown error or warning over silent fallback.

### 9.3 Draft handling
`draft: true` must (a) set `noindex`, and (b) be excluded from sitemap and index listings.

### 9.4 `.md` vs `.mdx` — pick by whether the author places components
- **Default to `.md`.** Use it for editorial content — prose with frontmatter and standard elements (resources/blog, FAQ, announcements). Lighter build, less to break, authors need zero component knowledge.
- **Use `.mdx` only when the content must embed components** — importing and placing `.astro`/UI components inline, or needing JSX expressions (callouts, live component previews, rich embeds). The component showcase docs are the canonical `.mdx` case.
- You can still restyle standard elements in plain `.md` (custom `<a>`/`<img>`/headings) by mapping them via the `components` prop when rendering `<Content />` — so reserve `.mdx` for when the *author* places components, not merely to restyle output.
- **Canonical split:** `content/resources` → `.md` (prose); `content/components` → `.mdx` (embeds `<Preview>` / live components). If a content type's body is "just writing," it's `.md`.

---

## 10. Performance & build optimization

### 10.1 Images — use `astro:assets`
- **Import from `src/images/` and render with `<Image>`/`<Picture>` from `astro:assets`.** Build emits optimized `dist/_astro/*.webp`. This is the standard — don't reference raw `/public` paths for content images.
- Put only un-optimized assets (favicons, OG/social images) in `public/`.
- Always set `width`/`height` (or let `<Image>` infer) to prevent CLS. `loading="lazy" decoding="async"` below the fold.
- **Don't lazy-load the LCP image.** The hero / above-the-fold image gets `loading="eager"` + `fetchpriority="high"`; lazy-loading the LCP element delays it and directly tanks the LCP metric. Only below-the-fold images use `lazy`.

### 10.2 Fonts — variable, self-hosted
- **Variable fonts via `@fontsource-variable/*` only.** One file per family, all weights. No third-party font requests, no fallback-only stacks with no `@font-face`.
- Set `--font-heading/-sans/-mono` to the imported families.

### 10.3 CSS inlining
- The starter sets `build: { inlineStylesheets: 'always' }`. Page CSS is inlined into `<head>` instead of emitting render-blocking stylesheet requests — a material FCP/LCP win on mobile. Keep it on for static sites.

### 10.4 Third-party scripts
- Offload analytics/marketing tags through `@astrojs/partytown` to keep the main thread free.
- **Gate tracking behind cookie consent** before launch in regulated regions.
- GA via `PUBLIC_GTAG_ID` env var (Layout injects gtag only when set).
- **Heavy embeds use a facade** — YouTube, maps, chat/HubSpot: render a lightweight placeholder and load the real iframe/SDK on interaction or when scrolled into view. An eager third-party embed can dominate TBT (same main-thread lesson as §10.5).

### 10.5 Animated canvases & heavy client JS
An animated `<canvas>` (WebGL or 2D) driven by a `requestAnimationFrame` loop is the **#1 mobile performance killer**. A low mobile Lighthouse score with *green LCP/CLS* is almost always **TBT/INP** from a perpetual rAF loop (plus a one-time shader-compile blocking task in the load window). TBT is 30% of the score, and Lighthouse often runs WebGL on a *software* rasterizer — so "GPU" effects become main-thread cost. Gate every animated canvas:
- **Static single frame on mobile** (`≤768px`) and under `prefers-reduced-motion` — draw once, never start the loop. Biggest mobile win.
- **Cap the frame rate** (~24–30fps) on desktop; advance the animation by *real elapsed time* so the visual speed stays fps-independent.
- **Pause** when offscreen (`IntersectionObserver`) and when the tab is hidden (`visibilitychange`).
- **Defer** WebGL setup/compile to `requestIdleCallback` so it's off the LCP/TBT critical path.
- **Trim shaders** to only what's used (smaller source = faster compile); don't ship unused shapes/branches.
- **Guard + rAF-batch** `ResizeObserver` so layout settling doesn't thrash buffer reallocation.
- Same discipline for any heavy client script: defer non-critical work to idle, and never leave an unbounded loop running after the effect is out of view.

> Real result: a full-screen WebGL hero backdrop running a 60fps loop indefinitely tanked a mobile score; applying static-on-mobile + fps-cap + deferred-compile (identical visual) took mobile Performance to **96**.

### 10.6 Deployment — static to Cloudflare Pages or Netlify
- Default target is **pure-static**, deployed via Git build to **Cloudflare Pages/Workers Builds** *or* **Netlify**. Both: build command `npm run build`, publish/assets dir `dist/`.
- **Stay adapter-free for static sites** so Astro's Sharp image service runs at build (host-agnostic; the CF adapter's image service is a broken passthrough). Keep `output: 'static'`, no adapter. `@astrojs/netlify` is only for SSR — **not needed for static.**
  - *Note on the starter's deps:* `@astrojs/cloudflare` + `mimetext` ship in `package.json` but are **unused by the default static build** — they exist only for the optional SSR contact-form path (`Doc/contact-form-cloudflare-email.md`). Per §5.7, the standalone-Worker form path hand-rolls MIME instead of `mimetext`; drop both deps when a client's form uses the static Pages-Function / Worker route.
- **Per-host config (the only real difference):**
  - **Cloudflare** → `wrangler.jsonc`: `assets.directory: "./dist"`, no `main` Worker, `compatibility_flags: ["nodejs_compat"]`, `observability.enabled`.
  - **Netlify** → `netlify.toml`: `[build] command = "npm run build"`, `publish = "dist"` (or set the same in the dashboard).
- **Redirects — portable.** Ship `public/_redirects` — **both hosts read the same format** (`/old  /new  301`). **Essential for Webflow→Astro migrations:** map every old URL to its new path so SEO/link equity survives the cutover. (Netlify alternative: `[[redirects]]` in `netlify.toml`.)
- **Headers & caching — portable.** Ship `public/_headers` (also a shared format): set `/_astro/*` to `Cache-Control: public, max-age=31536000, immutable` (hashed filenames → safe to cache forever) and baseline security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a conservative CSP). Improves repeat-visit speed and the Lighthouse **Best Practices** score.
- Contact form → separate Worker/function with an email binding (see §5.7). On Netlify this can be a Netlify Function; on Cloudflare a Worker with `send_email`.
- **Demo/showcase routes are gated, not deleted.** `/styleguide`, `/components`, `/tve-preview` live in `src/demos/` (not `src/pages/`), so they're never auto-built. The `demoRoutes()` integration in `astro.config.mjs` injects them only in `astro dev` (or in a build when `SHOW_DEMOS=true`). The client keeps the full showcase locally for reference and agent grounding; production deploys without it. Run a local reference build with `SHOW_DEMOS=true npm run build` when you want the showcase deployed somewhere internal.

### 10.7 Targets
- Lighthouse: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO = 100 on key templates (home, a content detail page, a listing page).
- `npm run check` passes clean — zero TS errors, zero build warnings.
- **Don't strip core interactive components (Tabs/GSAP) just to chase a Lighthouse number.** They're commonly used; optimize around them.

---

## 11. Checklists

### 11.1 New component
- [ ] Searched the starter first — not already covered by a prop on an existing component
- [ ] `interface Props` with typed unions for variants; defaults in the destructure
- [ ] Native-attribute passthrough (`extends HTMLAttributes<...>` + `...rest`) if it proxies an element
- [ ] Slots: default with fallback; named for regions; `Astro.slots.has()` or render-and-inspect for conditional wrappers
- [ ] Only semantic tokens / Tailwind utilities — **zero hardcoded hex AND zero raw Tailwind neutrals (`text-gray-*`)**
- [ ] Focus ring on every interactive element
- [ ] ARIA: labels, state, landmark labels; decorative icons `aria-hidden`
- [ ] Keyboard: Enter/Space/Esc/Arrows/Home/End as applicable; roving tabindex
- [ ] Focus management on open/close/remove
- [ ] `@media (prefers-reduced-motion)` + JS `matchMedia` guard for any animation
- [ ] Animated `<canvas>`/rAF loops: static on mobile + reduced-motion, fps-capped, paused offscreen/hidden, compile deferred to idle (§10.5)
- [ ] Single-init guard via `data-script-initialized` + `astro:page-load` re-init; cleanup on unmount
- [ ] `is:global` (if used) namespaced under `[data-component]`; no bare global classes
- [ ] Scoped styles use `var(--token)` or `@reference`
- [ ] Header comment + `Doc/`/MDX entry
- [ ] `npm run check` passes

### 11.2 SEO (per page / template)
- [ ] Passed `title` (+ `description`) to Layout/Seo, or set via frontmatter
- [ ] Canonical resolves correctly (absolute, no trailing-slash mismatch)
- [ ] OG + Twitter present; OG image absolute and exists
- [ ] `noindex` for drafts/internal pages
- [ ] JSON-LD from `lib/schema.ts` for the page type (Organization/WebSite/Article/FAQ/Breadcrumb)
- [ ] In sitemap if public; in `SITEMAP_EXCLUDE` if draft/internal
- [ ] One `h1`; logical heading order

### 11.3 Accessibility audit (per page)
- [ ] Keyboard-only pass: every control reachable/operable; visible focus throughout
- [ ] Screen-reader pass on nav, forms, modals
- [ ] Skip link works
- [ ] Color contrast meets WCAG AA in every active theme
- [ ] Reduced-motion: animations disabled/simplified with the OS setting on
- [ ] Forms: labels wired, errors in `aria-live`, `aria-invalid` on bad fields
- [ ] Images: correct `alt` (or `alt=""` if decorative)

### 11.4 Pre-launch
- [ ] `npm run check` clean (typecheck + build)
- [ ] `site` set in `astro.config.mjs` and `data/site.ts` to the real domain (no `example.com` left)
- [ ] Lighthouse targets met on home + 2 representative templates (§10.7)
- [ ] All active `data-theme`s render correctly; no contrast regressions
- [ ] Sitemap generated + filtered; `robots.txt` present and correct (`Disallow: /` on staging)
- [ ] Migrations: `public/_redirects` maps every old URL → new (no broken inbound links / lost SEO)
- [ ] `public/_headers`: `/_astro/*` immutable cache + baseline security headers
- [ ] Analytics/marketing tags gated behind consent where required; real IDs via env
- [ ] Contact form Worker deployed + verified (real email received)
- [ ] Production build excludes demo routes (plain `npm run build` shows "Demo routes excluded"); no placeholder content shipped
- [ ] 404 page present and styled; favicons + social/OG images in place
- [ ] Production deploy verified on CF (not just dev) — routing, forms, images
- [ ] Git history committed under the correct author identity

---

## 12. New-client setup runbook

Phase numbers map to §2.

**1. Scaffold**

1. Copy `astro-miscreants-starter-v1` → `<client>-build`. Reset git history.
2. Update `package.json` `name`, README, and add the §3.5 scripts.
3. Set `site` in `astro.config.mjs` (`inlineStylesheets: 'always'` is already on).
4. Add host config (§10.6): **Cloudflare** → `wrangler.jsonc` (`assets.directory: "./dist"`, `nodejs_compat`, observability); **Netlify** → `netlify.toml` (`command`/`publish`). Add `public/_headers` (immutable `/_astro/*` cache + security headers) and, for a migration, `public/_redirects` (old→new URLs).
5. Fill in `src/data/site.ts` (name, url, description, ogImage, logo, socials); add `public/robots.txt` + `src/pages/404.astro`.
6. Add `.env` keys (`PUBLIC_GTAG_ID`, form/CRM IDs); commit `.env.example` (§3.6). Write the per-client `CLAUDE.md` agent brief (§3.8).
7. Demo/showcase routes are already dev-only (`src/demos/` + `demoRoutes()`), so they don't ship to production — no stripping needed. Keep them for the client's local reference. Update `SITEMAP_EXCLUDE` only if you add new internal routes.

**2. Design-system intake**

8. Fill every `--color-*` role in `global.css` `@theme`. Add brand-named accents separately; map `--color-intent` to the primary.
9. Decide default theme + which `[data-theme]` overrides exist; register `@custom-variant`s.
10. Set per-client decisions (§4.2): radius stance, shadows, accents.
11. Wire fonts via `@fontsource-variable/*`; set `--font-heading/-sans/-mono`. Tune the fluid type clamps. Rewrite `DESIGN.md`.

**3. Componentize**

12. Build pages from starter primitives; keep `components/` flat. New components → §6 template + §11.1.
13. **Keep the full starter component set** — don't delete unused components (they're agent fuel and reuse fodder; §1, principle 10). Production stays lean via route gating and tree-shaking, not by stripping the repo. Remove only deprecated, broken, or project-harmful code.

**4. Content & SEO**

14. Define collections in `content.config.ts` (lean; `reference()` taxonomies; `image()` for hero images).
15. Author `lib/schema.ts` graphs (homepage Organization/WebSite + per-template builders); pass `jsonLd` from pages.
16. Set per-page `title`/`description`/`image`/`noindex`. Extend the sitemap filter.

**5. Optimize & QA**

17. Import images via `astro:assets`; run Lighthouse to §10.7.
18. Run §11.2 / §11.3.

**6. Launch**

19. Run §11.4. Deploy to CF Pages. Verify production. Hand off.

---

## 13. Automated guardrails

> Mostly **Roadmap** (tracked in §15): the type/build gate (§13.1) already ships; linting, formatting, CI, and a11y automation are not yet installed. The aim: standards enforced by tooling, not memory.

### 13.1 Type & build gate (Required — shipped)
`npm run check` = `astro sync && tsc --noEmit && astro build`. Already in the starter (§3.5); the minimum local gate before every PR. Still to do: wire it into CI.

### 13.2 Linting (to add)
`eslint` + `eslint-plugin-astro` + `@typescript-eslint`. Custom rules worth enforcing:
- ban raw hex/rgba **and raw Tailwind neutral classes** (`text-gray-*`, `bg-zinc-*`) in components
- require `interface Props`; flag `type Props =` except temporary allowlisted legacy components until normalized
- flag bare global selectors in `is:global` blocks (require a `[data-*]` namespace)

### 13.3 Formatting (to add)
`prettier` + `prettier-plugin-astro` with a shared `.prettierrc` committed to the starter so every client formats identically.

### 13.4 CI (to add)
One PR workflow: `install → npm run check → eslint → (optional) Lighthouse CI on a preview build`. Block merge on failure; Lighthouse CI asserts §10.7 budgets so perf/a11y can't silently regress.

### 13.5 Accessibility automation (to add)
`axe-core` (via Playwright or `@axe-core/cli`) against key templates in CI, as a backstop to the manual §11.3 audit. Automated checks catch ~40% of issues; they don't replace the keyboard/SR passes.

---

## 14. Known cleanups in the starter

Small consistency debts to fix on next touch (don't churn for its own sake):

- **`Button.astro` props use `type` intersection**, not `interface Props extends HTMLAttributes` (§5.1). Normalize.
- **Audit `is:global` blocks** for proper `[data-*]` namespacing — no bare global classes (§5.5).
- **Confirm no raw colors** (hex/rgba or `text-gray-*`) in any component; all should be tokens (§4.6).
- **Standardize the script-init flag** to `data-script-initialized` everywhere (§5.6).
- **`Form` honeypot field name** should be overridden per project, not left at the default (§5.7).
- **Confirm motion values** reference `--timing-*`/`--duration-*` tokens, not inline numbers (§4.5).

---

## 15. Roadmap

Concrete follow-up work, prioritized.

### Done (this revision)
- ✅ `Seo.astro` component (meta/OG/Twitter/canonical/robots) wired into `Layout.astro`.
- ✅ `lib/schema.ts` JSON-LD system (Organization/WebSite graph + `articleSchema()` builder).
- ✅ `data/site.ts` single source of truth for site identity.
- ✅ `@astrojs/sitemap` with a public-only `filter` + `site` set in config.
- ✅ `build.inlineStylesheets: 'always'` for render-blocking-free CSS.
- ✅ `typecheck` + `check` scripts (§3.5); fixed deprecated `baseUrl` in tsconfig.
- ✅ Expanded `CLAUDE.md` agent brief (§3.8); `AGENTS.md` now points to it (no more duplicate).
- ✅ Host files scaffolded: `public/_headers` (immutable cache + security), `public/_redirects` (migration template), `public/robots.txt`, `src/pages/404.astro`.

### P1 — codify + highest-value additions
1. Stand up linting (§13.2) with the three custom rules; run inside `check`.
2. Add Prettier + shared config (§13.3).
3. Add a minimal CI workflow: `check` + eslint on PR (§13.4).

### P2 — consistency cleanups
1. Work through §14.

### P3 — roadmap
1. Lighthouse CI budgets (§13.4) and `axe-core` in CI (§13.5).
2. Cookie-consent gating for marketing tags as a reusable component (§10.4).

---

*Maintained in the starter. Propose changes via PR against this file; once merged, roll relevant items into active client repos.*