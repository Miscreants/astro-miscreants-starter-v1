<!--docs-module: checklists/seo | order: 15-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

### 11.3 SEO (per page / template)
- [ ] `title` (+ `description`) passed to Layout, or set via frontmatter
- [ ] Canonical resolves correctly (absolute, no trailing-slash mismatch)
- [ ] OG + Twitter present; OG image absolute and exists
- [ ] `noindex` for drafts/internal pages
- [ ] JSON-LD from `lib/schema.ts` for the page type
- [ ] In the sitemap if public; excluded if draft/internal
