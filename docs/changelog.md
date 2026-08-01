<!--docs-module: changelog | order: 22-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 16. Changelog

### v2 — 2026-08-01

**Correctness**
- **Type gate rewritten (§3.5).** `tsc --noEmit` does not read `.astro` files; the gate is now `astro check --minimumFailingSeverity warning`. Recorded as a gap until `package.json` follows (§14).
- **Conformance contract added (§1).** A Required rule must be true of the starter or appear in §14 with a date. §14 rewritten from an undated wish list into a verified gap table; three stale entries cleared.
- **Staging indexing (§7.6).** `Disallow: /` demoted to a secondary signal; access control / `X-Robots-Tag` / meta-noindex now required, with the `_headers` production caveat.
- **Site identity single-sourced (§7.1).** `astro.config.mjs` imports `site.url`; placeholder guard fails the build on `example.com`.
- **Version drift removed (§3.4).** Pinned framework versions replaced with a policy pointing at `package.json`.
- Token contract corrected (§4.1): `--color-warning`, `--pattern-stripe` and `--accent-line` added; radius stance restated (§4.2). Tree, root-file map and collection references corrected (§3.1, §9.5). Sitemap filter's actual role clarified (§7.5).

**Authoring**
- **Init guard changed to per-behavior** `WeakSet` (§5.6) — a single shared flag silently blocks a second behavior on the same element. Full `AbortController` teardown recipe added.
- **`astro:page-load` documented as conditional** on the client router, which is opt-in and not enabled in the starter (§5.6).
- **Props typing relaxed (§5.1):** `interface` for object shapes, `type` for unions/polymorphism/intersections; polymorphic guidance rewritten and the stale `Button` note removed.
- **Three component templates (§6)** — static (default), interactive, polymorphic. Random-id generation dropped.
- **`SectionMain`** documented as-is, with visual framing named as a brand decision and the missing opt-out logged (§14).
- Forms hardened (§5.7): server-side validation, limits, rate limiting, origin strategy, header-injection tests, logging/retention, failure alerting.
- Docs homes disambiguated (§5.8); `Hero` named as the sanctioned prefix exception (§3.2).

**New**
- **Agent skills & commands documented (§13.6)** — the `launch` pre-launch audit and the `build-component` guided build, with authoring rules: derived from this file and never the reverse, every `§` reference must resolve, procedure not rules, no client-specific stances, no machine-specific paths, audit before fixing, `CLEAN` and `NEEDS HUMAN` mandatory. §11.5 now names the skill as its executable form; two skill/standard conflicts logged in §14.
- Responsive contract (§4.5) — mobile-first, test widths, `min-w-0`, wide-content scrolling.
- `Layout.astro` prop contract (§7.2).
- Content-source seam (§9.2).
- Navigation prefetch policy (§10.4).
- Performance budgets (§10.7) alongside Lighthouse smoke targets.
- Accessibility thresholds (§8.6) and a "page done" checklist (§11.2).
- Local-development notes (§13.6); starter lineage (§3.7); no-duplication rule for agent docs (§1).

**Accessibility corrections (§8)**
- "Every component ships with ARIA" → ships the behavior it needs, native-first.
- Keyboard table split into required vs optional: Esc removed from the accordion pattern; arrow/Home/End marked optional there; automatic vs manual tab activation stated as a choice.
- "One `h1` per page" relabelled an agency convention, not a WCAG requirement.
- Added focus-not-obscured, forced-colors, target size, reflow and text-spacing checks.

**Performance reframed**
- Canvas rules split into Required behavior vs tunable Defaults, with a measurement rule; superlative claim and project-specific result removed (§10.6).
- `inlineStylesheets: 'always'` given an explicit re-measure trigger (§10.3).
- Partytown made per-vendor and test-gated (§10.5).
- Fonts: requirement is self-hosted WOFF2, variable preferred, Fontsource as the default source rather than the only one (§10.2).
- Hosting made host-neutral (§10.8): Cloudflare Workers static assets preferred, Pages supported, Netlify equal; downstream steps refer to "the production host".

---

*Maintained in the starter. Propose changes via PR against this file; once merged, roll relevant items into active client repos.*
