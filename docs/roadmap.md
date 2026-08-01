<!--docs-module: roadmap | order: 21-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 15. Roadmap

### P0 — correctness of the gate
1. Swap the type gate to `astro check` and fix the three errors it surfaces (§14).
2. Single-source the site URL with the placeholder guard (§7.1).
3. Ship a reference form endpoint meeting §5.7, or document the per-project requirement in the runbook.
4. Put preview/staging protection into the scaffold step so it's never left to launch day (§7.6).

### P1 — authoring quality
1. `sideRules` opt-out on `SectionMain` (§14).
2. Split the component templates into the three of §6 and update `ComponentTemplate*`.
3. Add `prefetch` config (§10.4).
4. `starterVersion` + upstream-remote workflow (§3.7).
5. Reduce `AGENTS.md`/`CLAUDE.md` to pointers; delete restated rules (§1).
6. Reconcile the shipped skills with v2 (§14): the `launch` staging rule against §7.6, and `build-component` against §4.2 / §5.6 / §13.6.

### P2 — tooling
1. Stand up linting (§13.2) with the listed rules; run inside `check`.
2. Prettier + shared config (§13.3).
3. Minimal CI: `check` + eslint on PR (§13.4).
4. Lighthouse CI asserting §10.7 budgets, and `axe-core` (§13.5).
5. Adopt `astro:env` for typed env (§3.6).
6. Cookie-consent gating as a reusable component (§10.5).
7. Two more skills (§13.6): design-system intake (§12 phases 1–2) and a standalone accessibility audit (§11.4).
