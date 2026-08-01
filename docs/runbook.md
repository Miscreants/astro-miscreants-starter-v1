<!--docs-module: runbook | order: 18-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## New-client setup runbook
<!--rule: runbook | tier: reference-->

Phase numbers map to [lifecycle].

**1. Scaffold**

1. Copy the starter → `<client>-build`. Record `starterVersion` in `package.json` and add the starter as an `upstream` remote ([structure.git]).
2. Update `package.json` `name` and README; confirm the [structure.gate] scripts.
3. Fill in `src/data/site.ts` (name, url, description, ogImage, logo, socials). `astro.config.mjs` reads the URL from it ([seo.identity]).
4. Add host config for the chosen target ([deploy.static]). Add `public/_headers` and, for a migration, `public/_redirects`.
5. Add `public/robots.txt` + `src/pages/404.astro`.
6. Add `.env` keys; commit `.env.example` ([structure.env]). Write the per-client agent brief ([structure.agent-brief]).
7. Set up preview/staging protection now, not at launch ([seo.staging]).

**2. Design-system intake**

8. Fill every `--color-*` role in `global.css` `@theme`, for every theme the project ships. Add brand-named accents separately; map `--color-intent` to the primary.
9. Decide the theme set and register the `@custom-variant`s.
10. Set per-client decisions ([tokens.per-client]): radius stance, depth, accents.
11. Wire fonts ([perf.fonts]); set `--font-heading/-sans/-mono`. Tune the fluid type clamps. Rewrite `DESIGN.md`.

**3. Componentize**

12. Build pages from starter primitives; keep `components/` flat. New components → [templates] template + [checklist.component].
13. **Keep the full starter component set** — don't delete unused components ([principles], principle 10). Production stays lean via route gating and tree-shaking. Remove only deprecated or broken code.

**4. Content & SEO**

14. Define collections in `content.config.ts` (lean; `reference()` taxonomies; `image()` for content images). Keep the content-source seam ([content.source-seam]).
15. Author `lib/schema.ts` graphs; pass `jsonLd` from pages.
16. Set per-page `title`/`description`/`image`/`noindex`. Extend the sitemap filter.

**5. Optimize & QA**

17. Import images via `astro:assets`; measure against [perf.budgets] budgets.
18. Run [checklist.page], [checklist.seo] and [checklist.a11y] on every template.

**6. Launch**

19. Run [checklist.pre-launch]. Deploy to the chosen production host. Verify production. Hand off.
