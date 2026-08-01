<!--docs-module: checklists/page | order: 14-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

### Page done
<!--rule: checklist.page | tier: checklist-->
- [ ] Page is a thin composition — no page-level `<style>`/`<script>`
- [ ] Every section builds on `SectionMain` (or the deviation is stated)
- [ ] Renders correctly at 320 / 375 / 768 / 1024 / 1440; no horizontal scroll at 320
- [ ] Renders correctly in every theme the project ships
- [ ] Content extremes handled: long headings, empty optional regions, missing images
- [ ] All internal links resolve; external links have `rel="noopener noreferrer"`
- [ ] Images go through `astro:assets`; LCP image is eager + `fetchpriority="high"`
- [ ] One `h1`; logical heading order
- [ ] [checklist.seo] SEO and [checklist.a11y] a11y passes done for this template
