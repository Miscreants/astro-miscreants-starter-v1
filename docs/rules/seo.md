<!--docs-module: rules/seo | order: 07-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## SEO, head & metadata
<!--rule: seo | tier: reference-->

### Site identity — one source of truth
<!--rule: seo.identity | tier: required-->

`src/data/site.ts` owns site-wide identity:

```ts
export const site = {
  name: "Your Site Name",
  url: "https://example.com",
  description: "One-line description…",
  ogImage: "/og.jpg",
  logo: "/logo.png",
  twitter: "",
  sameAs: [] as string[],
};
```

**Required:** `astro.config.mjs` **imports** this value for its `site` field rather than repeating the URL. Astro loads the config through Vite, so importing a `.ts` module works. Two copies of the domain plus a checklist item to keep them in sync is not a single source of truth.

```js
import { site } from './src/data/site';

if (site.url.includes('example.com')) {
  throw new Error('site.url is still the placeholder — set the real domain before building.');
}

export default defineConfig({ site: site.url, /* … */ });
```

The placeholder guard means a build can't ship with `example.com` canonicals.

### The `Layout.astro` contract
<!--rule: seo.layout-contract | tier: required-->

Every page goes through `Layout`. Its props are the page's whole head surface:

| Prop | Type | Purpose |
|---|---|---|
| `title` | `string` | page title |
| `description` | `string?` | meta description; falls back to `site.description` |
| `image` | `string?` | social image; falls back to `site.ogImage`, resolved absolute |
| `ogType` | `"website" \| "article"` | `article` for posts |
| `noindex` | `boolean?` | drafts and internal pages |
| `jsonLd` | `object \| object[]` | structured data from `lib/schema.ts` |
| `theme` | `"light" \| "dark" \| "brand"` | sets `data-theme` on the document root |
| `frontmatter` | `object?` | auto-populated for `.md`/`.mdx` pages using `layout:` |

Markdown pages pass their frontmatter under `frontmatter` while `.astro` pages pass props flat; the layout falls back so both work. **Pages set head metadata only through these props** — never by emitting tags directly.

### The `Seo.astro` component
<!--rule: seo.component | tier: reference-->

`src/components/Seo.astro` owns all head metadata:

```ts
interface Props {
  title: string;
  description?: string;
  ogType?: "website" | "article";
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
```

It emits `<title>` + description, canonical (computed from `Astro.url`, absolute against `Astro.site`), `robots` when `noindex`, favicons, full Open Graph, Twitter Card, and one `<script type="application/ld+json">` per schema.

### JSON-LD via `lib/schema.ts`
<!--rule: seo.json-ld | tier: default-->

Structured data lives in `src/lib/schema.ts` as **pre-built graphs + builder functions**, not inline in pages:

- **`homepageSchema`** — a `@graph` with `Organization` + `WebSite` + `WebPage`, built from `site.*`.
- **`articleSchema({ path, title, description, datePublished, … })`** — `Article` + `BreadcrumbList`, with an optional `breadcrumbParent`.
- **Cross-referencing via `@id`**: every node has a stable `@id` (`${site.url}/#organization`) and others reference it — one canonical Organization/WebSite, no duplication.

**Standard:** homepage emits Organization + WebSite; content detail pages emit Article + BreadcrumbList; FAQ pages emit FAQPage. Extend `schema.ts` per project rather than inlining schema in pages.

### Sitemap
<!--rule: seo.sitemap | tier: default-->

`@astrojs/sitemap` is wired with a filter that excludes internal routes:

```js
const SITEMAP_EXCLUDE = ['/styleguide', '/components', '/tve-preview'];
```

Note what this does **not** do: demo routes are already excluded from production because they live in `src/demos/` and are never injected in a normal build ([deploy.static]). The filter is a **safety net** for routes that do ship but shouldn't be indexed. Extend it per project.

### Staging & preview: indexing control
<!--rule: seo.staging | tier: required-->

**`Disallow: /` in robots.txt is not indexing control.** A disallowed URL can still be indexed from external links, and a crawler blocked by robots.txt never reads a page-level `noindex`.

**Required — a non-production deployment uses at least one of:**

1. **Access control** — host-level password/SSO (Cloudflare Access, Netlify password protection). Strongest, and the default choice for client review sites.
2. **`X-Robots-Tag: noindex, nofollow` response header** on the preview host, with crawling still allowed so the directive is actually read.
3. **`<meta name="robots" content="noindex">`** on every page (`noindex` through `Layout`), crawling allowed.
4. **A non-public preview URL** that is never linked publicly.

`Disallow: /` may accompany these as a secondary signal, never as the primary control.

> **Implementation caveat:** `public/_headers` ships to production too, so a blanket `X-Robots-Tag: noindex` there would deindex the live site. Apply it through a host-level rule scoped to preview deployments, or emit it from a build-time environment flag — and verify the production response headers before launch.

### Drafts & announcements
<!--rule: seo.drafts | tier: required-->

- `draft: true` content sets `noindex`, and is excluded from listings and the sitemap.
- Announcements are a scheduled collection (`startsAt`/`endsAt`/`enabled`/`priority`); the layout picks the top active one at build time.

### robots.txt & error pages
<!--rule: seo.robots-404 | tier: default-->

- Ship **`public/robots.txt`**: allow crawling, link the sitemap (`Sitemap: https://<site>/sitemap-index.xml`).
- Ship a styled **`src/pages/404.astro`** using `Layout`. Both hosts serve it for unknown static routes.

### Astro/host gotchas (pure-static)
<!--rule: seo.host-gotchas | tier: reference-->

- **Don't call a syntax highlighter directly in component frontmatter** (e.g. `shiki.codeToHtml`) — it can silently truncate static HTML on some hosts. Use `<Code />` from `astro:components`.
- For **pure-static** sites, **stay adapter-free** so Astro's default Sharp image service runs at build. A host adapter's image service may be a passthrough that emits mislabelled formats.
- A path matching a dynamic route but excluded from `getStaticPaths` can 500 in a host's dev runtime with a misleading error — **verify routing against a production build**, not dev ([guardrails.local-dev]).
- Pre-launch, `site` / JSON-LD / canonical URLs may intentionally point at the production domain before DNS cutover. Don't "fix" them back to staging.
