<!--docs-module: runbook | order: 18-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 12. New-client setup runbook

Phase numbers map to §2.

**1. Scaffold**

1. Copy the starter → `<client>-build`. Record `starterVersion` in `package.json` and add the starter as an `upstream` remote (§3.7).
2. Update `package.json` `name` and README; confirm the §3.5 scripts.
3. Fill in `src/data/site.ts` (name, url, description, ogImage, logo, socials). `astro.config.mjs` reads the URL from it (§7.1).
4. Add host config for the chosen target (§10.8). Add `public/_headers` and, for a migration, `public/_redirects`.
5. Add `public/robots.txt` + `src/pages/404.astro`.
6. Add `.env` keys; commit `.env.example` (§3.6). Write the per-client agent brief (§3.8).
7. Set up preview/staging protection now, not at launch (§7.6).

**2. Design-system intake**

8. Fill every `--color-*` role in `global.css` `@theme`, for every theme the project ships. Add brand-named accents separately; map `--color-intent` to the primary.
9. Decide the theme set and register the `@custom-variant`s.
10. Set per-client decisions (§4.2): radius stance, depth, accents.
11. Wire fonts (§10.2); set `--font-heading/-sans/-mono`. Tune the fluid type clamps. Rewrite `DESIGN.md`.

**3. Componentize**

12. Build pages from starter primitives; keep `components/` flat. New components → §6 template + §11.1.
13. **Keep the full starter component set** — don't delete unused components (§1, principle 10). Production stays lean via route gating and tree-shaking. Remove only deprecated or broken code.

**4. Content & SEO**

14. Define collections in `content.config.ts` (lean; `reference()` taxonomies; `image()` for content images). Keep the content-source seam (§9.2).
15. Author `lib/schema.ts` graphs; pass `jsonLd` from pages.
16. Set per-page `title`/`description`/`image`/`noindex`. Extend the sitemap filter.

**5. Optimize & QA**

17. Import images via `astro:assets`; measure against §10.7 budgets.
18. Run §11.2, §11.3 and §11.4 on every template.

**6. Launch**

19. Run §11.5. Deploy to the chosen production host. Verify production. Hand off.
