<!--docs-module: changelog | order: 22-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## Changelog
<!--rule: changelog | tier: reference-->

### v2.2 — 2026-08-01 — the gates become true

**Site identity single-sourced ([seo.identity]).** `astro.config.mjs` now imports `site.url` from `src/data/site.ts` instead of repeating the domain, so there is one declaration rather than two plus a checklist item asking someone to keep them equal.

A placeholder origin is now structurally un-shippable: hosts set `CI=true`, so the config throws on a host build, while a local build — including the starter's own, which legitimately still has the placeholder — logs a warning and continues. Making the guard unconditional would force the reference implementation to violate its own rule, and a rule the starter breaks is a rule nobody keeps.

Downstream, the `launch` skill's "`site` and `url` are not byte-identical" check is gone — that drift is now impossible — and is replaced by a check that the config still imports rather than redeclaring.

### The type gate actually type-checks

`typecheck` ran `tsc --noEmit`, which never opens a `.astro` file — so every component, prop type and component usage in the repo passed the gate unread. It now runs `astro check --minimumFailingSeverity warning` ([structure.gate]), which checks `.astro` **and** `.ts` and runs `astro sync` itself.

The swap surfaced three real errors, all fixed at their source rather than suppressed:

- **`@fontsource-variable/*` side-effect imports** had no type declarations (ts 2882). Added `src/fontsource.d.ts` — a global declaration file, because an ambient module declaration for an unknown package is illegal in a file that has top-level imports.
- **`CodeBlock`'s `lang` prop** was `string`, which doesn't satisfy shiki's language union. Now derived from `<Code />` via `ComponentProps`, so it stays correct if Astro's accepted set changes.
- **`SliderBasicMap`'s `items`** was declared required while the destructure defaulted it to `[]` and the component documented manual children as an alternative. The declaration was the bug; `items` is now optional, and the preview route that tripped it renders real sample slides instead of an empty slider.

Result: 0 errors, 0 warnings across 71 files. 32 hints remain and do not fail the gate.

### v2.1 — 2026-08-01 — documentation restructure

The rulebook was a single 1,340-line file with no entry point shorter than "read all of it", and nothing detecting a stale cross-reference. Renumbering during the v2 rewrite silently broke four references across two files; this release fixes that structurally. **No rule text changed.**

**Structure**
- Split into modules under `docs/`: `rules/` (the rules), `checklists/` (the gates), and the process docs. `STANDARDS.md` is now **generated** from them by `scripts/build-standards.mjs` — table of contents included — and is never edited directly.
- **`docs/workflow.md`** added as the router: 13 task rows mapping a job to just the modules it needs.
- **Verification tiers** added, Tier 0 (copy) to Tier 4 (launch), classified by blast radius. A copy edit and a token change no longer carry the same gate.
- `AGENTS.md` became the vendor-neutral agent contract; `CLAUDE.md` reduced to a pointer at it, reversing the old direction. `README.md` replaced the stock Astro template readme.
- `astro-for-beginners.md` moved to `docs/learn/`, explicitly marked non-authoritative; the contact-form guide moved to `docs/how-to/`.

**Stable rule ids replace section numbers**
- Every rule now declares an id beside its heading (`<!--rule: components.scripting | tier: required-->`) and is cited as `[components.scripting]`. 87 rules declared; 194 section references converted.
- Section numbers are gone from headings entirely, and `§N` is now **banned syntax** — the gate rejects it.
- Ids are linkified automatically in the generated `STANDARDS.md`, so citations stay clickable without hand-maintained anchors.

**Enforcement ([guardrails.docs-check])**
- `scripts/check-docs.mjs` added and wired into `npm run check`. It fails on an unresolvable citation, a duplicate id or module order, an unknown tier, a surviving `§` reference, a broken relative link, or a stale `STANDARDS.md`.

### v2 — 2026-08-01

**Correctness**
- **Type gate rewritten ([structure.gate]).** `tsc --noEmit` does not read `.astro` files; the gate is now `astro check --minimumFailingSeverity warning`. Recorded as a gap until `package.json` follows ([conformance]).
- **Conformance contract added ([principles]).** A Required rule must be true of the starter or appear in [conformance] with a date. [conformance] rewritten from an undated wish list into a verified gap table; three stale entries cleared.
- **Staging indexing ([seo.staging]).** `Disallow: /` demoted to a secondary signal; access control / `X-Robots-Tag` / meta-noindex now required, with the `_headers` production caveat.
- **Site identity single-sourced ([seo.identity]).** `astro.config.mjs` imports `site.url`; placeholder guard fails the build on `example.com`.
- **Version drift removed ([structure.versions]).** Pinned framework versions replaced with a policy pointing at `package.json`.
- Token contract corrected ([tokens.model]): `--color-warning`, `--pattern-stripe` and `--accent-line` added; radius stance restated ([tokens.per-client]). Tree, root-file map and collection references corrected ([structure.layout], [content.md-vs-mdx]). Sitemap filter's actual role clarified ([seo.sitemap]).

**Authoring**
- **Init guard changed to per-behavior** `WeakSet` ([components.scripting]) — a single shared flag silently blocks a second behavior on the same element. Full `AbortController` teardown recipe added.
- **`astro:page-load` documented as conditional** on the client router, which is opt-in and not enabled in the starter ([components.scripting]).
- **Props typing relaxed ([components.props]):** `interface` for object shapes, `type` for unions/polymorphism/intersections; polymorphic guidance rewritten and the stale `Button` note removed.
- **Three component templates ([templates])** — static (default), interactive, polymorphic. Random-id generation dropped.
- **`SectionMain`** documented as-is, with visual framing named as a brand decision and the missing opt-out logged ([conformance]).
- Forms hardened ([components.forms]): server-side validation, limits, rate limiting, origin strategy, header-injection tests, logging/retention, failure alerting.
- Docs homes disambiguated ([components.docs]); `Hero` named as the sanctioned prefix exception ([structure.naming]).

**New**
- **Agent skills & commands documented ([guardrails.skills])** — the `launch` pre-launch audit and the `build-component` guided build, with authoring rules: derived from this file and never the reverse, every `§` reference must resolve, procedure not rules, no client-specific stances, no machine-specific paths, audit before fixing, `CLEAN` and `NEEDS HUMAN` mandatory. [checklist.pre-launch] now names the skill as its executable form; two skill/standard conflicts logged in [conformance].
- Responsive contract ([tokens.responsive]) — mobile-first, test widths, `min-w-0`, wide-content scrolling.
- `Layout.astro` prop contract ([seo.layout-contract]).
- Content-source seam ([content.source-seam]).
- Navigation prefetch policy ([perf.prefetch]).
- Performance budgets ([perf.budgets]) alongside Lighthouse smoke targets.
- Accessibility thresholds ([a11y.thresholds]) and a "page done" checklist ([checklist.page]).
- Local-development notes ([guardrails.skills]); starter lineage ([structure.git]); no-duplication rule for agent docs ([principles]).

**Accessibility corrections ([a11y])**
- "Every component ships with ARIA" → ships the behavior it needs, native-first.
- Keyboard table split into required vs optional: Esc removed from the accordion pattern; arrow/Home/End marked optional there; automatic vs manual tab activation stated as a choice.
- "One `h1` per page" relabelled an agency convention, not a WCAG requirement.
- Added focus-not-obscured, forced-colors, target size, reflow and text-spacing checks.

**Performance reframed**
- Canvas rules split into Required behavior vs tunable Defaults, with a measurement rule; superlative claim and project-specific result removed ([perf.canvas]).
- `inlineStylesheets: 'always'` given an explicit re-measure trigger ([perf.css]).
- Partytown made per-vendor and test-gated ([perf.third-party]).
- Fonts: requirement is self-hosted WOFF2, variable preferred, Fontsource as the default source rather than the only one ([perf.fonts]).
- Hosting made host-neutral ([deploy.static]): Cloudflare Workers static assets preferred, Pages supported, Netlify equal; downstream steps refer to "the production host".

---

*Maintained in the starter. Propose changes via PR against this file; once merged, roll relevant items into active client repos.*
