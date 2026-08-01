<!--docs-module: roadmap | order: 21-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## Roadmap
<!--rule: roadmap | tier: reference-->

### Done — v2.1
- ✅ Split the rulebook into task-scoped modules with a router ([guardrails.docs-check], [changelog]).
- ✅ Stable rule ids replace section numbers everywhere; `§N` is banned syntax.
- ✅ `scripts/check-docs.mjs` wired into `npm run check`.
- ✅ Verification tiers so the gate scales with blast radius.
- ✅ `AGENTS.md` reduced to a contract of pointers; `CLAUDE.md` points at it *(P1.5)*.
- ✅ `build-component` command deleted; its unique content rescued into [components.styling] *(part of P1.6)*.

### P0 — correctness of the gate
1. Swap the type gate to `astro check` and fix the three errors it surfaces ([conformance]).
2. Single-source the site URL with the placeholder guard ([seo.identity]).
3. Ship a reference form endpoint meeting [components.forms], or document the per-project requirement in the runbook.
4. Put preview/staging protection into the scaffold step so it's never left to launch day ([seo.staging]).

### P1 — authoring quality
1. `sideRules` opt-out on `SectionMain` ([conformance]).
2. Split the component templates into the three of [templates] and update `ComponentTemplate*`.
3. Add `prefetch` config ([perf.prefetch]).
4. `starterVersion` + upstream-remote workflow ([structure.git]).
5. Reconcile the `launch` skill's staging rule with [seo.staging] — it still treats `Disallow: /` as sufficient protection ([conformance]).

### P2 — tooling
1. Stand up linting ([guardrails.lint]) with the listed rules; run inside `check`.
2. Prettier + shared config ([guardrails.format]).
3. Minimal CI: `check` + eslint on PR ([guardrails.ci]).
4. Lighthouse CI asserting [perf.budgets] budgets, and `axe-core` ([guardrails.axe]).
5. Adopt `astro:env` for typed env ([structure.env]).
6. Cookie-consent gating as a reusable component ([perf.third-party]).
7. Two more skills ([guardrails.skills]): design-system intake ([runbook] phases 1–2) and a standalone accessibility audit ([checklist.a11y]).
