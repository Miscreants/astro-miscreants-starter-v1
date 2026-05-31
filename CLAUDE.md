# CLAUDE.md

> Agent front door for this repo. Read this first, then build. It points at the
> authoritative docs and states the non-negotiables. Keep it short — the full
> reasoning lives in `STANDARDS.md`.
>
> **Per client:** replace the Project line below with the client's name/brand and
> tune `DESIGN.md` tokens. Everything else stays.

## Project

Astro 6 + Tailwind v4 static site. (Replace with the client name + one-line description.)

## Authoritative docs — read before building

- **`DESIGN.md`** — the design system: colors, type, spacing, motion tokens. The brand contract.
- **`STANDARDS.md`** — how we build: structure, components, SEO, a11y, performance. The rulebook.
- Live component showcase: run `npm run dev` and open **`/components`** (dev-only).

## Non-negotiables

- **Semantic tokens only.** Style with Tailwind utilities mapped to roles (`bg-intent`, `text-fg-muted`, `border-stroke`). **Never** hardcode hex/rgba or raw Tailwind neutrals (`text-gray-700`). Tokens live in `@theme` in `src/styles/global.css`.
- **Accessibility is required**, authored from the start (see rules below).
- **Pages compose sections.** `pages/*.astro` is a thin table of contents wrapping `Layout` + section components. Push markup *down* into sections; no page-level `<style>`/`<script>`. (STANDARDS §5.0.)
- **Images** go through `astro:assets` (`<Image>`/`<Picture>` from `src/images/`), never raw `/public` paths. Don't lazy-load the LCP/hero image.
- **Animated canvases / rAF loops**: static on mobile + reduced-motion, fps-capped, paused offscreen, compile deferred. (STANDARDS §10.5 — the #1 mobile perf killer.)
- **Components:** `interface Props`, defaults in the destructure, typed-union variants, slots for rich content, always accept a `class` passthrough.
- Verify with **`npm run check`** (typecheck + build) before considering work done.

## How to add a page

1. Create `src/pages/<route>.astro` (kebab-case route).
2. Wrap content in `<Layout title="…" description="…" jsonLd={…}>` (SEO + head handled for you — STANDARDS §7).
3. **Compose existing sections/components** from `components/`. Reuse before creating.
4. For a new page chunk, create a `Section*` component (owns its `<section>`, content inline, no props unless reused) — STANDARDS §5.0.
5. `npm run check`.

## Where to look

- **Primitives/components:** `src/components/` (flat; `Section*` = page sections).
- **Live showcase + docs:** `/components` (dev) and `content/components/*.mdx`.
- **Content:** `src/content/` (Zod-typed collections). **Site identity:** `src/data/site.ts`.
- **Structured data:** `src/lib/schema.ts`. **Global CSS/tokens:** `src/styles/global.css`.

## Component development rules

### Accessibility is not optional

Every new component must include accessibility from the start, not as an afterthought:

- **ARIA roles**: use semantic HTML elements first (`<nav>`, `<button>`, `<dialog>`, `<header>`). Add explicit `role` attributes only when no semantic element fits (e.g. `role="status"` on a notification banner, `role="tabpanel"` on a tab content area).
- **ARIA labels**: every interactive element without visible text needs `aria-label`. Every landmark region (`role="banner"`, `role="navigation"`, etc.) needs `aria-label` or `aria-labelledby` to distinguish it from other landmarks.
- **ARIA state**: toggleable elements need `aria-expanded`. Triggers that control another element need `aria-controls` pointing to the target's `id`. Checkable items need `aria-checked`. Selected items need `aria-selected`.
- **Decorative SVGs**: add `aria-hidden="true"` to icons that are purely visual (the parent element's text or `aria-label` already communicates meaning).
- **Focus management**: when an element is removed/hidden (dismiss, close, delete), move focus to the next logical element — don't let it drop to `<body>`.
- **Keyboard navigation**: all interactive components must work with keyboard. At minimum: Enter/Space to activate, Escape to close/dismiss, Arrow keys for lists/tabs/menus.
- **Reduced motion**: wrap animations in `@media (prefers-reduced-motion: reduce)` to disable or simplify them for users who opt out.

### Tailwind v4 patterns

- Design tokens live in `@theme` blocks in `src/styles/global.css`.
- Component-scoped `<style>` blocks can't see `@theme` tokens via `@apply` — use raw `var(--color-*)` or add `@reference "../styles/global.css"` at the top.
- Use `@utility` for multi-property recipes. Single-property tokens belong in `@theme`.
