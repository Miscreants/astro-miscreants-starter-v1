<!--docs-module: changelog-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md-->

## Changelog
<!--rule: changelog | tier: reference-->

### v2.7 — 2026-08-02 — DESIGN.md records decisions, not values

`DESIGN.md` was 233 lines, of which **155 were frontmatter duplicating `global.css`** — the full palette, the type ramp, the radius and spacing scales, and per-component specs. Nothing read that frontmatter. It existed only to go stale, and it had:

- **status colours already wrong** — `#dc2626` / `#16a34a` documented against `#841B20` / `#4C6649` actually rendering, so an agent would build bright red/green state styling for a maroon-and-olive site;
- **an internal contradiction** — "This build does not use rounded corners… Pills are off the table" three paragraphs above "**Nav (pill)** — a pill-rounded panel", with `nav-pill.rounded: {rounded.pill}` in the frontmatter backing the wrong one;
- **motion documented as "150–300 ms linear or ease-out"** against tokens of 0.2–1.6s on a custom bezier;
- a framework version two majors behind.

The rewrite ([tokens.design-doc]) keeps decisions, rationale and hard constraints, and drops every value in favour of pointers to `global.css`, `/styleguide` and `/components`. The file is ~45% shorter and considerably more specific about the things that can't rot — the editorial reasoning for sharp corners, why `intent` equals `fg`, the shadow-last depth order, what is deliberately not done.

**The reframe that drove it:** the problem was never specific-versus-general, it was derivable-versus-not. A stale *description* is worse than no description, because a description reads to an agent as an instruction — "the nav is a pill" becomes *make pills*. Normative statements ("never use rounded corners") can't fail that way: when code contradicts one, it identifies a bug instead of licensing it. So the fix was to be **more** specific about intent, not vaguer.

Enforced rather than remembered: [guardrails.docs-check] now fails the gate on any hex, `px` or `ms` literal in `DESIGN.md`. Discipline is what failed the first time.

### v2.6 — 2026-08-02 — the starter itself ships blocked

The AI crawler policy landed as allow-all in the starter's own `robots.txt`, which was the wrong file to put it in. The starter is a template: its preview deployment has no reason to be crawled, indexed, or used as training data.

`public/robots.txt` now ships `User-agent: * / Disallow: /`, with the full allow policy sitting directly beneath it as a commented block. Scaffold step 5 swaps them and sets the `Sitemap:` host. Keeping both in one file makes the flip a single edit with nothing to retype, and no drift between the rule and the file it describes.

The safety net was already in place: the launch audit blocks on a production `Disallow: /`, so a client site that never got flipped is caught rather than shipped. It now names that case directly, since "the scaffold step was skipped" is the most likely way it occurs.

**The starter deliberately does not ship `X-Robots-Tag: noindex` in `public/_headers`**, even though it would be a stronger signal. That file inherits into every client repo, and a blanket `noindex` reaching production deindexes the live site — the exact BLOCKER [seo.staging] defines. Keeping the landmine out of the template beats relying on an audit to defuse it in every project. The starter's preview leans on `Disallow: /` plus an unlinked URL; if it is ever shared widely, the fix is host-level access control or an `X-Robots-Tag` rule in the dashboard, where nothing can inherit it.

### v2.5 — 2026-08-02 — AI crawler policy stated, not inferred

`public/robots.txt` was `User-agent: * / Allow: /` — which does permit every AI crawler, but silently. An undeclared default is indistinguishable from nobody having considered the question, and it changes meaning the first time someone tightens the wildcard group.

**House policy is now explicit ([seo.ai-crawlers]): AI crawlers are allowed**, answer engines and training crawlers alike, each as a named group. Clients want to be cited in LLM answers, so allow-all is the deliberate default rather than an accident.

The named groups also document the trap that makes this worth writing down: **a crawler with its own group ignores `User-agent: *` entirely**, so a `Disallow` added to the wildcard blocks general crawlers while leaving the AI bots it was aimed at untouched. The `launch` skill treats that specific mistake as a BLOCKER.

`Google-Extended` and `Applebot-Extended` are documented as what they are — control tokens for Gemini/AI Overviews and Apple Intelligence grounding, not crawlers.

**`llms.txt` was considered and declined.** Direct `/llms.txt` fetches measure at roughly 0.1% of AI crawler traffic, and no major provider has committed to reading it in production; crawlers fetch HTML. What earns citations is what the starter already does — static HTML, real semantics, JSON-LD. It stays available on request and is explicitly not a launch finding at any severity, with the reasoning recorded so it isn't re-litigated.

Also corrects `robots.txt`'s own staging comment, which still advised `Disallow: /` "so the staging deploy is never indexed" — the claim [seo.staging] had already corrected everywhere else.

### v2.4 — 2026-08-02 — the placeholder origin warns, it doesn't block

The build-failing placeholder guard is gone, along with the `ALLOW_PLACEHOLDER_SITE` variable added to work around it. A placeholder origin now warns in every environment and never fails a build.

It was the wrong instrument at the wrong moment. Failing a build is the most disruptive response available, and a preview deploying with placeholder canonicals is harmless — nothing is indexed or linked. Client sites legitimately sit on a `*.pages.dev` URL for weeks before a domain is decided, and blocking every one of those deploys to prevent one launch mistake is a bad trade. It broke this starter's own preview on its first deploy, which is the kind of evidence worth listening to.

The escape hatch was worse than the problem: a variable that switches the check off is a footgun in a client repo, where setting it once silently removes the protection for good.

[checklist.pre-launch] remains the gate. It blocks on a placeholder origin in production mode and runs deliberately at cutover, which is the only moment this matters. The `launch` skill no longer implies a failed build would have caught it — it reads `site.ts` directly and treats the build's `[site]` warning as a hint, not proof.

The single-source import from [seo.identity] is unaffected and stays: the domain is still declared exactly once.

### v2.3 — 2026-08-02 — one home per thing

Three artifacts removed, each because something else already did its job better.

**`STANDARDS.md` (generated) — deleted.** Assembling every module into one file meant every documentation commit produced a doubled diff: the module and its copy. Its one unique benefit was that rule ids rendered as links there and nowhere else.

That benefit is now everywhere instead. `scripts/build-doc-links.mjs` appends an auto-managed reference-definition block to each citing file, listing only the ids that file uses — a `rule-links` comment wrapper around one `[id]: path#anchor` line per citation.

Reference definitions are invisible when rendered, so citations became clickable in every module, checklist and in `AGENTS.md` — 159 definitions across 20 files — while diffs went back to single. [guardrails.docs-check] now verifies those blocks are current instead of verifying a 1,500-line duplicate, and module headers lost the `order` field that only existed to sequence the assembly.

**`Doc/` — deleted.** 27 per-component reference docs that duplicated `src/content/components/*.mdx`, the live showcase and the documented home ([components.docs]). Four of them (Modal, AccordionMorph, Button, AnimatedTags) carried mechanism and design-rationale sections their MDX counterparts lack; that content is recoverable from git history if it's ever wanted. [components.docs] now states one home and raises the bar for what an MDX entry must cover, so the gap doesn't reopen.

**The `launch` skill's staging rule reconciled with [seo.staging].** It was the last place a shipped tool gave a wrong answer: it blocked when `Disallow: /` was *missing* from staging and treated its presence as protection — so it would have passed a staging site that search engines could index, which is precisely what [seo.staging] was rewritten to prevent.

It now checks for one of the four real methods, splitting them by what an audit can actually see: `X-Robots-Tag` and meta-`noindex` are verifiable from the repo and built output; host-level access control and a non-public preview URL are `NEEDS HUMAN`. It also gained the inverse production check — a blanket `X-Robots-Tag: noindex` in `public/_headers` ships to production and deindexes the live site — and is explicitly barred from auto-fixing the finding, because adding `Disallow: /` would close the report while leaving the site indexable.

**`Plan.md` — moved to [plan].** It was direction notes at the repo root competing for attention with the rulebook. Its "Component showcase site (in-repo)" section was dropped — that shipped, and is live at `/components`. The rest (template-repo distribution, component roadmap, long-term registry) is still live direction and now sits in `docs/` labelled as explicitly not rules.

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

<!-- rule-links: generated by scripts/build-doc-links.mjs — do not edit -->
[a11y]: ./rules/accessibility.md#accessibility
[a11y.thresholds]: ./rules/accessibility.md#measurable-thresholds
[checklist.page]: ./checklists/page.md#page-done
[checklist.pre-launch]: ./checklists/pre-launch.md#pre-launch
[components.docs]: ./rules/components.md#documentation--shared-components
[components.forms]: ./rules/components.md#forms--form--field-progressively-enhanced-and-hardened
[components.props]: ./rules/components.md#props-typing
[components.scripting]: ./rules/components.md#client-side-scripting
[conformance]: ./conformance.md#starter-conformance-gaps
[content.md-vs-mdx]: ./rules/content.md#md-vs-mdx--pick-by-whether-the-author-places-components
[content.source-seam]: ./rules/content.md#content-source-seam
[deploy.static]: ./rules/deployment.md#deployment--static
[guardrails.docs-check]: ./guardrails.md#documentation-integrity-check-required--shipped
[guardrails.skills]: ./guardrails.md#agent-skills--commands-required--shipped
[perf.budgets]: ./rules/performance.md#budgets--targets
[perf.canvas]: ./rules/performance.md#animated-canvases--heavy-client-js
[perf.css]: ./rules/performance.md#css-inlining
[perf.fonts]: ./rules/performance.md#fonts--self-hosted
[perf.prefetch]: ./rules/performance.md#navigation-prefetch
[perf.third-party]: ./rules/performance.md#third-party-scripts
[plan]: ./plan.md#plan--direction-notes
[principles]: ./rules/principles.md#why-this-exists
[seo.ai-crawlers]: ./rules/seo.md#ai-crawler-policy
[seo.identity]: ./rules/seo.md#site-identity--one-source-of-truth
[seo.layout-contract]: ./rules/seo.md#the-layoutastro-contract
[seo.sitemap]: ./rules/seo.md#sitemap
[seo.staging]: ./rules/seo.md#staging--preview-indexing-control
[structure.gate]: ./rules/structure.md#required-scripts--the-type--build-gate
[structure.git]: ./rules/structure.md#git-branching-deploy--starter-lineage
[structure.layout]: ./rules/structure.md#directory-layout
[structure.naming]: ./rules/structure.md#naming-conventions
[structure.versions]: ./rules/structure.md#versions--engines
[templates]: ./rules/component-templates.md#component-author-templates
[tokens.design-doc]: ./rules/tokens.md#designmd-records-decisions-not-values
[tokens.model]: ./rules/tokens.md#the-token-model
[tokens.per-client]: ./rules/tokens.md#per-client-design-decisions-set-at-intake
[tokens.responsive]: ./rules/tokens.md#responsive-contract
<!-- /rule-links -->
