---
name: Miscreants Starter
version: alpha
summary: Functional monochrome — near-black ink on warm off-white, sharp rectangles, tonal depth, fluid container-query type.
---

# Design

The brand contract for this project: **what we decided, and why**.

## How to use this file

This file records **decisions and constraints**. It does not record values.

That split exists because a value written in two places drifts in one of them, and a stale design doc is worse than none — an agent reads "the nav is a pill" as *make pills*, and confidently generates the wrong thing.

**If a hex code, pixel value or duration appears in this file, it's a bug.** Those live in exactly one place each:

| Looking for | Read |
|---|---|
| Colour values, per theme | `src/styles/global.css` — `@theme` and the `[data-theme]` blocks |
| The type ramp, rendered | `/styleguide` in dev |
| A component's shape, props and states | `/components` in dev, and `src/content/components/*.mdx` |
| Spacing, rhythm and layout utilities | `src/styles/global.css` |
| Motion durations and easings | `src/styles/global.css` — the `--duration-*`, `--cubic-*` and `--timing-*` tokens |
| How to build to this system | [`docs/workflow.md`](./docs/workflow.md) |

The useful test when adding something here: **does this change as a side effect of routine work, or only when someone deliberately revisits the brand?** A padding value changes incidentally — it doesn't belong. A typeface choice changes deliberately — it does.

## Brand character

Functional monochrome. Near-black ink on a warm off-white canvas with no chromatic accent. The personality is precise, editorial and engineering-forward.

Colour is reserved for state signalling. Every other surface speaks through contrast, type and spatial rhythm. The UI favours flat surfaces separated by tonal layering rather than shadows, sharp hairline strokes, and generous whitespace.

Motion is restrained and purposeful — never decorative, never announcing itself, and always with a reduced-motion path. The site should read fast on product pages, marketing sites and documentation.

## The decisions

**Monochrome, with `intent` equal to `fg`.** There is no brand hue. In a monochrome system the primary action reads as a high-contrast rectangle rather than a coloured button, which is the point: hierarchy comes from contrast and placement, not from colour. When a client brings a brand palette, add it as separate named tokens and *map* `intent` to the primary — keeping the two apart lets the action colour and the decorative palette move independently.

**Depth is tonal, not shadowed.** A panel sits above the canvas because its background is one tone offset, not because a shadow separates them. Shadows are reserved for genuinely floating UI — popovers, and the header once scrolled — where the element must read as detached from the page rather than layered on it. Hairline borders carry separation wherever tonal offset alone is too subtle.

**Three type families, strictly allocated.** A display face for every heading level, a neutral grotesque for all body copy, and a monospace for technical data only — code, keyboard shortcuts, timestamps, metric values. The allocation is the rule; the families themselves are set in `global.css` and are a deliberate brand choice, currently Archivo / Inter / JetBrains Mono.

**Type is fluid, anchored to its container.** Every size is a `clamp()` driven by container-query units rather than the viewport, so a card, sidebar or modal can re-anchor the whole scale to its own width. This is why fixed font sizes are forbidden: they opt a component out of the system silently.

**Vertical rhythm belongs to the section, horizontal padding to the container.** Sections own their spacing above and below; the centred page column owns the gutter. Layouts therefore compose at the section level, not the element level, and every section lines up with the nav and footer without coordination.

**Theming is explicit, never inferred.** A `data-theme` attribute on any ancestor flips every descendant through the cascade, and a nested light island inside a dark parent works by construction. There is deliberately no `prefers-color-scheme` fallback — mixing the two mechanisms produces a flash on load, and the theme is a design decision rather than a user-agent one.

## Hard constraints

Normative rules. These stay true regardless of what any component currently does — if code contradicts one, the code is wrong.

- **No hue outside the status roles.** `error` and `success` are the only permitted accents, used strictly for state messaging. Everything else is neutral.
- **One `intent` action per screen.** A second filled action reads as a duplicate, not a hierarchy.
- **No raw neutrals or hex in components.** Semantic roles only, so theme switching keeps working.
- **No fixed `font-size`.** Author at the scale name and let the clamp do the work.
- **Every interactive element carries the focus ring**, and every animation has a reduced-motion path.

## Do's and don'ts

- **Do** reference semantic colour roles (`bg-canvas`, `text-fg`, `border-stroke`). Dark mode then works through the cascade with no per-component effort.
- **Don't** hard-code neutrals (`bg-neutral-50`, `text-black`) inside a reusable component — it breaks themeability. The raw scale is for one-off decorative use only.
- **Do** author typography at the scale name (`h2`, `text-body-lg`).
- **Don't** set a fixed `font-size` — it bypasses container-query scaling and desynchronises a card-scoped context from a page-scoped one.
- **Do** re-anchor fluid type with `container-type: inline-size` (the `cq` utility) when a component renders inside a narrow column.
- **Do** put the focus ring on every interactive atom; the focus colour is theme-aware by construction.
- **Don't** ship a component without its accessibility pattern — semantic element first, names on unlabelled controls, state attributes on toggles, keyboard handling, reduced-motion fallback.
- **Don't** rely on `prefers-color-scheme`; the theme is explicit via `data-theme`.
- **Don't** reach for a shadow to create hierarchy. Try tonal offset, then a hairline, then a shadow — in that order.

## Decide per project

Settle these at design intake and record the answer here, replacing this section:

- **Default theme** and which themes ship at all.
- **Brand palette**, if any, and which swatch `intent` maps to.
- **Depth** — tonal only, or are shadows part of the language?
- **Typefaces** for the heading / body / mono roles.
- **Motion character** — how much, and where it is allowed to be expressive.
