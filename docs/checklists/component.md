<!--docs-module: checklists/component | order: 13-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

### New component
<!--rule: checklist.component | tier: checklist-->
- [ ] Searched the starter first — not already covered by a prop on an existing component
- [ ] Typed props: `interface Props` (or `type` for a union/polymorphic shape, [components.props]); typed-union variants; defaults in the destructure
- [ ] Native-attribute passthrough (`extends HTMLAttributes<…>` + `...rest`) if it proxies an element
- [ ] Slots: default with fallback; named for regions; render-and-inspect for conditional wrappers
- [ ] Only semantic tokens / Tailwind utilities — **zero hardcoded hex AND zero raw Tailwind neutrals**
- [ ] Focus ring on every interactive element
- [ ] Native semantics first; ARIA only where native falls short; landmark labels; decorative icons `aria-hidden`
- [ ] Keyboard per [a11y.keyboard] for the pattern; roving tabindex where applicable
- [ ] Focus management on open/close/remove; focus not obscured by sticky UI
- [ ] `@media (prefers-reduced-motion)` + JS `matchMedia` guard for any animation
- [ ] Animated `<canvas>`/rAF: reduced-motion static, paused offscreen/hidden, static fallback, deferred compile ([perf.canvas])
- [ ] Per-behavior init guard (`WeakSet` or namespaced flag) + `AbortController` teardown ([components.scripting])
- [ ] `is:global` (if used) namespaced under `[data-component]`, with the reason in a comment
- [ ] Scoped styles use `var(--token)` or `@reference`
- [ ] Header comment + `Doc/<Component>.md` entry
- [ ] `npm run check` passes
