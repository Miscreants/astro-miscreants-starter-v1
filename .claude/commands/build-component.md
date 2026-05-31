---
description: Build an Astro component following the project design system
argument-hint: [optional one-line description]
---

You are building an Astro component for this project. Follow the four steps below in order. Do not skip ahead, do not write code until Step 4.

If `$ARGUMENTS` is non-empty, treat it as a draft scope — confirm in Step 1, never start coding from it directly.

## Step 1 — What are we building?

Ask the user:
> What component should I build? Send a description, a link (Figma, screenshot, reference site), or both. If there is an existing component in `src/components/` to model on, point me at the file — this project has ~50 prior components worth grepping for visual conventions (good starting points: `CardFeatured.astro`, `CardIcon.astro`, `Accordion*.astro`, `FlowSteps.astro`, `Tabs.astro`).

Wait for the response.

## Step 2 — Behavior and nuance

Based on their answer, ask only the questions that actually matter for this build. Pick from:

- Interactive behavior (hover, click, scroll-triggered, autoplay, drag)
- Responsive behavior — what changes at tablet / mobile, any reflow
- States — empty, loading, error, hover, active, disabled
- Data source — static, props, content collection (and shape of the data)
- Reduced-motion handling for any animation
- Accessibility specifics beyond the defaults — keyboard nav patterns, focus management, live regions
- Theming — does the surface need to be always-dark (use `data-theme="dark"` on the element), follow the page theme, or scope a light island

One focused message. Don't bury the user in a checklist.

Wait for the response.

## Step 3 — Plan and wait for approval

Before writing any code, post a short build plan:

- File layout — `.astro` file path under `src/components/`, plus the paired doc at `src/content/components/<kebab-name>.mdx`
- Markup outline — semantic structure, key elements, planned roles and ARIA
- Tokens from `global.css` you'll use, and for what (call them out by name)
- Rules from `DESIGN.md` that apply (especially: sharp rectangles, no rounded corners, semantic-token-only)
- Animation approach — CSS by default; reach for the project's motion tokens (`--cubic-default`, `--cubic-bounce`, `--timing-default-half`, etc.) before inventing your own. GSAP only if the user explicitly requested it
- Props / Astro frontmatter shape, including any CSS-var passthroughs for per-instance overrides
- Anything you're assuming because it wasn't specified

End with:
> Approve this plan, or tell me what to change before I start the build.

Do not proceed until the user approves explicitly. If they ask for changes, revise the plan and ask again.

## Step 4 — Build rules

These rules apply to every component you produce in this project.

### Read before you write

1. Read `DESIGN.md` (uppercase, project root) — system rules, brand voice, allowed surfaces, motion philosophy.
2. Read `CLAUDE.md` (project root) — project-level conventions and the accessibility checklist.
3. Read the auto-memory index at `~/.claude/projects/E--Apps-Astro-Builds/memory/MEMORY.md` — binding feedback from prior sessions (e.g., no "modeled on…" attribution in docs, cursor: pointer on all interactives, tabs is a core component, etc.). Apply anything relevant.

### Tokens — semantic only

Never hard-code colors, durations, easings, or radii when a token exists. Defaults to reach for first:

- **Colors:** `--color-canvas`, `--color-panel`, `--color-panel-muted`, `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-stroke`, `--color-stroke-strong`, `--color-focus`, `--color-intent`, `--color-intent-hover`, `--color-fg-on-intent`, `--color-error`, `--color-success`.
- **Motion:** `--cubic-default`, `--cubic-bounce`, `--hover-effect`, `--duration-default-quarter|half|onehalf|double`, `--timing-default-quarter|half|default|onehalf|double`, `--timing-hover-half|default`. Use these instead of inventing easings or durations.
- **Radii (DO NOT USE):** per `DESIGN.md`, every surface in this build is a sharp rectangle (`border-radius: 0`). `--radius-card`, `--radius-pill`, and `rounded-*` Tailwind utilities are off the table — strip them before merge unless the user explicitly overrides.

### Theming

Dark mode is `[data-theme="dark"]` on any ancestor; nested `[data-theme="light"]` forces a light island. There are no inverse tokens — for an always-dark card surface, put `data-theme="dark"` on the card itself and read `--color-canvas` / `--color-fg` (which the attribute scopes). Don't hard-code `#fff` / `#000`.

### Accessibility

Semantic HTML first (`<button>`, `<nav>`, `<dialog>`, `<details>`, `<article>`, headings, landmarks). Add ARIA only where the semantic element doesn't carry the meaning:

- `aria-label` / `aria-labelledby` on anything without visible text. Icon-only buttons always get an accessible name.
- `aria-expanded` + `aria-controls` on toggles.
- `aria-current` on active items.
- `aria-hidden="true"` on decorative imagery and content hidden from the visible flow.
- `role` only when no semantic element fits.
- Keyboard-operable interactives with a visible focus state. The project standard is a `:focus-visible` ring built from `--color-focus` with a `--color-canvas` offset, e.g. `box-shadow: 0 0 0 2px var(--color-canvas), 0 0 0 4px var(--color-focus);`. The Tailwind `focus-visible:ring-2 ring-focus ring-offset-2 ring-offset-canvas` utility chain is equivalent — pick one per component, don't mix.
- All interactive controls (`<button>`, `<a>`, `[role="button"]`, `[role="menuitem"]`, `<summary>`) inherit `cursor: pointer` from the project's global base layer — don't override it.

### Naming

- BEM-style class naming for components with a meaningful internal structure and cross-element selectors (e.g., `CardsBento`, `AnimatedList`, `Accordion`). Class root matches the component (`alist__item`, `bento-card__header`).
- Tailwind utility classes for atomic components (`Button`, `Tag`, `Icon`, `Avatar`). Don't impose BEM where utilities suffice — match the existing file's style.

### CSS scoping (Astro gotcha)

Astro adds the component's scope hash to **both** ends of a descendant selector. If your trigger attribute lives on a parent rendered by a different `.astro` file, wrap that ancestor selector in `:global(...)` or the rule will never match:

```css
/* Wrong — Astro hashes both [data-state] and .child to this component's
   scope. The state attribute lives on a parent in another component. */
[data-state="open"] .child { ... }

/* Right — keep the ancestor unhashed. */
:global([data-state="open"]) .child { ... }
```

### JavaScript

- Vanilla, minimal. Function names start with `init`. Key comments only — no narration of obvious code.
- Default to Astro `<script>` (bundled module). Use `<script is:inline>` only when you need pre-hydration timing.
- Re-init on SPA navigation. Standard pattern:

```ts
function init(root: HTMLElement & { __myInit?: boolean }) {
  if (root.__myInit) return;
  root.__myInit = true;
  // ...
}
function initAll() {
  document.querySelectorAll<HTMLElement>("[data-my-component]").forEach(init);
}
initAll();
document.addEventListener("astro:page-load", initAll);
```

### Animation

CSS for animation by default. GSAP only if the user asked for it in Step 1 or 2. Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .my-component :global(.animated) {
    transition: none !important;
  }
}
```

### Doc page is required

Every component in `src/components/*.astro` ships with a paired `src/content/components/<kebab-name>.mdx` doc — without it the component won't appear in the gallery routing (`src/pages/components/[...slug].astro`). Include:

- Frontmatter: `title`, `description`, `category` (`block` / `atom` / `section` / etc., match an existing doc), `order`, `sourceFile`, `status` (`stable` / `wip`), `related`.
- One or more `<Preview>` examples at meaningful states.
- A `<PropsTable>` for every prop / sub-component.
- Slots table if applicable, mechanism notes, usage example.

**Do not** include "modeled on…", "based on…", or any attribution to reference sites/screenshots in the doc copy. Per binding memory rule: only credit if the user explicitly asks.

### Verify before declaring done

After the build:

1. `npm run dev` (start the server in background).
2. Open the new doc page in chrome-devtools MCP and confirm: component renders, hover/click/keyboard interactions work, focus ring is visible, no console errors.
3. If anything is wrong, fix and re-verify — don't claim success on a half-working build. Past sessions have caught real bugs (Astro scope leak, black-on-black tokens, init order) only at this step.

### Overrides

Rules under "Read before you write," "Tokens," "Theming," and "Accessibility" can be relaxed only when the user **explicitly** says this component sits outside the design system's style or scope. Confirm that override in chat before applying it.

---

After the build, summarize what you produced in 3–5 bullets and flag any open questions or follow-ups (missing tokens, tweaks the user might want, accessibility decisions worth reviewing).
