# SectionMain

**File:** `src/components/SectionMain.astro`

## What it does

The section primitive. **Build every `Section*` component on this** instead of hand-rolling a wrapper — it owns the semantic `<section>` landmark, the centered content column, the vertical rhythm presets and the left/right rules, so sections stay aligned with each other, the nav and the footer.

Hand-rolling `<section class="section-gutter section-padding">` drifts from the shared rhythm and silently drops the side rules. Bespoke markup is an allowed-with-reason deviation for genuinely full-bleed or self-framed sections — see STANDARDS §5.0.

It extends `HTMLAttributes<"section">`, so `id`, `aria-*` and any other native attribute pass straight through.

## Props

| Prop             | Type                                        | Default     | Description                                    |
|------------------|---------------------------------------------|-------------|------------------------------------------------|
| `id`             | `string`                                    | —           | HTML `id` for anchor linking (any native section attribute passes through) |
| `padding`        | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"`  | Vertical padding preset — shorthand for both edges |
| `paddingTop`     | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | —       | Overrides the top edge only                    |
| `paddingBottom`  | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | —       | Overrides the bottom edge only                 |
| `contentPadding` | `"none" \| "default"`                       | `"default"` | Horizontal padding inside the content column (`px-0` / `px-2 md:px-6`) |
| `contentClass`   | `string`                                    | `""`        | Additional classes on the inner flex column     |
| `borderTop`      | `boolean`                                   | `false`     | Add a top border to the section                |

## How it works

### Structure

Two elements — an outer `<section>` that centers, and an inner column that carries rhythm and rules:

```
<section class="container-page">          <!-- max-w-[90rem] + px-site-margin -->
  <div class="section-pt-* section-pb-*   <!-- vertical rhythm -->
              flex flex-col relative
              border-l border-r border-stroke  <!-- side rules -->
              px-2 md:px-6">              <!-- contentPadding -->
    <slot />
  </div>
</section>
```

Centering comes from the `container-page` utility. An earlier 5-column `section-grid-outside` grid with decorative `section-pattern` gutters was replaced by this — it still exists in `global.css` but is commented out and applied nowhere.

### Padding map

`padding` / `paddingTop` / `paddingBottom` map to the `section-pt-*` and `section-pb-*` utilities in `global.css`. They **do** step up at `md:`:

| Value  | Utility               | Mobile  | `md:` and up |
|--------|-----------------------|---------|--------------|
| `none` | (none)                | —       | —            |
| `xs`   | `section-p{t,b}-xs`   | `3rem`  | `4rem`       |
| `sm`   | `section-p{t,b}-sm`   | `4rem`  | `5rem`       |
| `md`   | `section-p{t,b}-md`   | `6rem`  | `8rem`       |
| `lg`   | `section-p{t,b}-lg`   | `8rem`  | `12rem`      |
| `xl`   | `section-p{t,b}-xl`   | `12rem` | `16rem`      |

`paddingTop` / `paddingBottom` each override `padding` for that edge.

## Usage

```astro
---
import SectionMain from "../components/SectionMain.astro";
---

<!-- Standard section -->
<SectionMain>
  <h2 class="h2">Features</h2>
  <p>Content goes here</p>
</SectionMain>

<!-- Tight section with top border, no content padding -->
<SectionMain padding="xs" contentPadding="none" borderTop={true}>
  <div class="grid grid-cols-3">...</div>
</SectionMain>

<!-- Section with anchor link target -->
<SectionMain id="pricing" padding="lg">
  <h2 class="h2">Pricing</h2>
</SectionMain>
```

## Notes

- This is the primary building block for page layout. Every section should be built on it unless it's full-bleed or self-framed.
- The left/right `border-stroke` rules give the page its ruled-column look, and they're the main thing you lose by hand-rolling a section.
- `contentClass` lets you add things like `items-center` to the flex column without overriding the base layout classes.
- Components like `FlowSteps` and `FeatureScrollSpy` already manage their own grid and padding — wrap them in `SectionMain padding="none" contentPadding="none"` so you don't double-indent.
