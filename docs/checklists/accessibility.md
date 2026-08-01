<!--docs-module: checklists/accessibility | order: 16-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

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
