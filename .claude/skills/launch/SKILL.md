---
name: launch
description: Audit an Astro site before launch. Verify production identity, canonicals, OG assets, favicons, robots, sitemap, built HTML, links, placeholders, environment variables, legal content, performance, and deployment readiness. Use for staging or production launch checks, client handoff, first deployment to a real domain, or when asked what remains before a site can go live.
---

Run a pre-launch audit. Never report an unrun check as passed; mark it `NEEDS HUMAN`.
Do not fix anything before Step 8. Audit, report, then fix only with permission.

This is the executable form of the pre-launch checklist [checklist.pre-launch]. Bracketed tokens below are **rule ids** — look them up in `docs/` (the router is `docs/workflow.md`, the assembled view is `STANDARDS.md`). `npm run docs:check` fails if any id cited here no longer exists.

**Severity standard.** `BLOCKER` means a visitor experiences something broken, or there is a legal or brand exposure. Everything else is `SHOULD FIX` or lower. If every check is a blocker, the label stops meaning anything and people start overriding it.

## Step 0 — Set mode

Read `$ARGUMENTS` (or the arguments passed to this skill) as `staging` or `production`; default to `production`. State the mode and continue.

| Check | staging | production |
|---|---|---|
| `robots.txt` crawl rule | Must contain `Disallow: /`; otherwise **BLOCKER** | Must not block crawling; `Disallow: /` is **BLOCKER** |
| Sitemap | Do not advertise one | `sitemap-index.xml` required; missing is **BLOCKER** |
| Empty public links | Ignore as work in progress | **BLOCKER** |
| Placeholder copy | **SHOULD FIX** | **BLOCKER** |
| `site` domain | Real domain not required before cutover | Must be the client's real domain |

## Step 1 — Establish facts and build

Read:

- `astro.config.mjs`: `site`, `SITEMAP_EXCLUDE`, integrations, adapter
- `src/data/site.ts`: `name`, `url`, `description`, `ogImage`, `logo`, `twitter`, `sameAs`
- `package.json`: `name`, scripts
- `.env.example`: declared keys
- `CLAUDE.md`: real domain, host, and client-specific requirements

Run `npm run check` and retain the build log. If it fails, stop and report the failure as the only blocker; output checks are invalid without a successful build.

Trust project files and built output over stale notes or TODOs.

## Step 2 — Identity, URLs, and robots

Report each finding with its severity:

- `astro.config.mjs` `site` is `https://example.com` — **BLOCKER**
- `site.ts` `url` is `https://example.com` — **BLOCKER**
- In production, either value is not the client's real domain — **BLOCKER**
- `site` and `url` are not byte-identical, including protocol, host, and trailing slash — **BLOCKER**
- `site.ts` still contains `Your Site Name` or `One-line description of the site…` — **BLOCKER**
- `package.json` `name` is `astro-playground` — **NIT**

Inspect the repository copy of `public/robots.txt` and its body:

- Staging does not contain `Disallow: /` — **BLOCKER**
- Production contains a crawl-blocking rule such as `Disallow: /` — **BLOCKER**
- Production file is missing, lacks `Sitemap:`, or points to a host other than `site` — **SHOULD FIX**

Do not use HTTP 200 alone as proof: Cloudflare may synthesize a `robots.txt` that lacks the required rules.

## Step 3 — Referenced assets

Resolve every referenced asset:

- `site.ts` `ogImage` missing from `public/` — **BLOCKER**
- `ogImage` is an absolute URL that returns an error — **BLOCKER**; if it cannot be fetched from this environment at all, **NEEDS HUMAN**
- `site.ts` `logo` missing — **SHOULD FIX**
- Referenced favicon, Apple touch icon, or manifest missing — **SHOULD FIX**
- Missing per-route image under `/og/<route>.png` when that convention is used — **SHOULD FIX**
- Apple touch icon is not 180×180 — **SHOULD FIX**
- OG image exceeds roughly 300 KB — **SHOULD FIX**

Hash-compare favicons and OG images against the starter's `public/` assets. A byte-identical starter asset is a **BLOCKER** because it can ship the wrong brand.

## Step 4 — Inspect built output

Inspect the HTML that will ship, not only source files.

1. Look for `dist/**/*.html`.
2. If no HTML exists because an adapter emits `dist/client/` and `dist/server/`, serve the production build or fetch the deployed site.
3. Never treat an empty HTML glob as a clean result.
4. Use a throwaway Node script in the scratchpad; do not add it to the repository.

For every public page collect:

- `<title>`
- `meta[name=description]`
- `link[rel=canonical]`
- `meta[property=og:image]`
- `h1` count
- `script[type=application/ld+json]`
- every `<a href>`
- every `<img>` without an `alt` attribute

Report:

- Missing title or description — **BLOCKER**
- Canonical missing, relative, or on a host other than `site` — **BLOCKER**
- OG image missing, relative, or unresolved — **BLOCKER**
- Missing JSON-LD or invalid JSON-LD — **SHOULD FIX**
- `h1` count not equal to 1 — **SHOULD FIX**
- Duplicate title or description across routes — **SHOULD FIX**
- Internal link resolving to no built route — **BLOCKER**
- `<img>` missing the `alt` attribute — **SHOULD FIX**

When checking compiled Astro HTML, match `\balt\b`, not `alt=`; Astro may serialize `alt=""` as bare `alt`.

### Demo routes

Check the build log and output for `/styleguide`, `/components`, and `/tve-preview`.

- Present but non-indexable and current — **SHOULD FIX**
- Reachable and indexable, linked publicly, or stale from another client — **BLOCKER**

Open at least one present demo route before assigning severity.

### Sitemap

In production, verify `sitemap-index.xml` exists, uses the `site` host, and excludes every `SITEMAP_EXCLUDE` route. Missing sitemap integration or sitemap — **BLOCKER**.

In staging, a sitemap is not required and should not be advertised to crawlers.

### Other output

- No built 404 page — **SHOULD FIX**
- `public/_headers` lacks immutable caching for `/_astro/*` or baseline security headers — **SHOULD FIX**
- On a site migration, missing or incomplete `public/_redirects` — **BLOCKER**; otherwise not applicable

## Step 5 — Content, configuration, and code smells

### Placeholder sweep

Search source and built output for:

`Lorem ipsum`, `TODO`, `FIXME`, `example.com`, `Your Site Name`, `Client Name`, `Coming soon`, `href="#"`, `href=""`, `placeholder`

Read every match in context and report only user-visible or operational findings with `file:line`.

- Empty link on a public production route — **BLOCKER**
- Empty link on staging — ignore
- Placeholder copy on a public production route — **BLOCKER**
- Placeholder copy on staging — **SHOULD FIX**
- Comments, unused defaults, or non-shipping matches — **SHOULD FIX** at most

A dead internal route remains a **BLOCKER** in both modes.

### Environment variables

Find both categories:

1. Build-time: `import.meta.env.PUBLIC_[A-Z_]+`
2. Runtime: `cloudflare:workers` env reads, `getEnv()`, `wrangler secret`, and bindings in `wrangler.jsonc` or `wrangler.toml`, including D1, R2, KV, IMAGES, and `send_email`

Verify:

- Every build-time key appears in `.env.example`
- Every runtime secret or binding is documented
- Missing `.env.example` — **SHOULD FIX**
- Presence of each required key in the host's build or runtime configuration — **NEEDS HUMAN** unless verified directly

List every key and where it must be configured. Do not infer deployment configuration from a successful local build.

### Analytics and consent

For GTM, GA, or HubSpot IDs, verify the ID is real, not inherited from the starter, and consent gating required by [perf.third-party] is present — **SHOULD FIX**.

### Legal pages

Inspect whatever privacy, cookie, or terms content the site ships:

- Invented or placeholder legal text in production — **BLOCKER**, whether or not the site collects data
- The site collects personal data (forms, email capture, uploads, accounts) and ships no privacy policy — **BLOCKER** in production
- Required legal documents absent or not supplied by the client — **NEEDS HUMAN**

### Animated canvas

For every `requestAnimationFrame`, verify the same file includes:

- `prefers-reduced-motion`
- a mobile breakpoint
- an `IntersectionObserver` or `visibilitychange` pause

Missing gating — **SHOULD FIX**. Mention it as a likely contributor when mobile performance is low.

## Step 6 — Browser pass

Serve the production build with `npm run preview`, not the development server.

Test the homepage, one listing page, and one detail page with chrome-devtools MCP:

- Lighthouse: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO = 100
- Below-target score — **SHOULD FIX**
- Accessibility below 100 — **BLOCKER**
- Console error on load — **BLOCKER**
- Console warning on load — **SHOULD FIX**
- Keep the default viewport unless asked otherwise

If Lighthouse cannot run, report `NEEDS HUMAN`; never estimate scores.

## Step 7 — Report

Use these sections in order, most severe first within each:

```text
BLOCKER      (n)   ship-stopping: broken for a visitor, or a legal or brand exposure
SHOULD FIX   (n)   real defects that are not ship-stopping
NEEDS HUMAN  (n)   not verified; explain why and how to verify
NIT          (n)   cleanup with no launch impact
CLEAN              checks that passed
```

Every finding must include `file:line` or route plus a one-line concrete fix.

`CLEAN` is not optional. A report listing only failures gives no signal about coverage, and the reader cannot tell a passed check from a skipped one.

Unless verified during this run, always include these under `NEEDS HUMAN`:

- Keyboard-only and screen-reader pass ([checklist.a11y])
- Colour contrast in every active `data-theme`
- Contact form deployed and a real email received ([components.forms])
- Client sign-off on production copy
- DNS or domain cutover and verification on the real host
- Git history committed under the correct author identity

End with the number of findings safe to auto-fix and ask before changing files.

## Step 8 — Fix only with permission

Auto-fix only:

- `robots.txt` sitemap host and mode-appropriate crawl rule
- `package.json` `name`
- `site.ts` and `astro.config.mjs` URL alignment when the real domain is known
- sitemap integration or `SITEMAP_EXCLUDE` entries
- `_headers` immutable caching rule

Never auto-fix user-visible copy, legal text, favicons, OG artwork, or redirect maps.

After approved fixes, rerun the audit and report the delta.
