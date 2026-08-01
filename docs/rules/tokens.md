<!--docs-module: rules/tokens | order: 04-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

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
