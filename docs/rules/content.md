<!--docs-module: rules/content | order: 09-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## Content collections & data
<!--rule: content | tier: reference-->

### Collections (`content.config.ts`)
<!--rule: content.collections | tier: required-->
- Every collection is **Zod-typed**. No untyped content.
- **Use `reference()` for taxonomies** so a typo'd tag fails at build, not in production.
- **Use `image()` in the schema** for content images so they go through `astro:assets`. Paths resolve relative to the data file.
- **Model dual internal/external entries** where useful (an `externalUrl` that links off-site and skips detail-page generation).
- Keep schemas lean — add fields when real content needs them.
- A frontmatter `slug` field **overrides** the glob entry id; route on `entry.id` unless you deliberately want that.

### Content-source seam
<!--rule: content.source-seam | tier: default-->

Components and sections take **plain data props** — arrays and objects with a shape the component owns. The mapping from a source (files today, a CMS tomorrow) to that shape lives in a loader or a `lib/` function, never inside the component.

This costs nothing now and means adding a CMS later is a loader change, not a component rewrite. When a project does add a CMS, keep the seam: file-based content and API content produce the same shape.

### Data registries (`src/data/*.ts`)
<!--rule: content.registries | tier: default-->
- Centralize lookup tables (footer links, nav menus) and site identity. **No hardcoded link lists inside components.**
- Filter placeholder entries (`href: "#"`) at render time.
- **Validate references at build time** — prefer a thrown error over a silent fallback.

### Draft handling
<!--rule: content.drafts | tier: required-->
`draft: true` must (a) set `noindex`, and (b) be excluded from sitemap and index listings.

### `.md` vs `.mdx` — pick by whether the author places components
<!--rule: content.md-vs-mdx | tier: default-->
- **Default to `.md`** for editorial content — prose with frontmatter and standard elements. Lighter build, authors need zero component knowledge.
- **Use `.mdx` only when the content must embed components** — importing and placing components inline, or needing JSX expressions.
- You can restyle standard elements in plain `.md` via the `components` prop when rendering `<Content />` — so reserve `.mdx` for when the *author* places components, not merely to restyle output.
- **In the starter:** `content/faq` and `content/announcements` are `.md`; `content/components` is `.mdx` because each entry renders live previews of the component it documents.
