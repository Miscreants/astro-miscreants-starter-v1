<!--docs-module: checklists/pre-launch | order: 17-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

### Pre-launch
<!--rule: checklist.pre-launch | tier: checklist-->

> **Executable form: the `launch` skill ([guardrails.skills])**, which runs this list in `staging` or `production` mode against the built output. Run it, then work the report; this list stays the source of truth for *what* is checked.

- [ ] `npm run check` clean (`astro check` + build)
- [ ] Real domain set in `data/site.ts`; the config guard passes ([seo.identity])
- [ ] Budgets met on home + 2 representative templates ([perf.budgets])
- [ ] All active `data-theme`s render correctly; no contrast regressions
- [ ] Sitemap generated + filtered; `robots.txt` correct for production
- [ ] **Staging/preview is protected by [seo.staging] method 1–4** — not robots.txt alone; production headers verified to *not* carry `noindex`
- [ ] Migrations: `public/_redirects` maps every old URL → new
- [ ] `public/_headers`: `/_astro/*` immutable cache + security headers
- [ ] Analytics gated behind consent where required; real IDs via env
- [ ] Form endpoint meets [components.forms] security requirements; real email received; failure alerting live
- [ ] Production build excludes demo routes (plain `npm run build` logs "Demo routes excluded")
- [ ] 404 page present and styled; favicons + OG images in place
- [ ] Production deploy verified on the real host — routing, forms, images
- [ ] Git history committed under the correct author identity; `starterVersion` recorded
