<!--docs-module: guardrails | order: 19-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 13. Automated guardrails

> §13.1 and §13.6 ship today; §13.2–§13.5 are **Roadmap** (§15). The aim: standards enforced by tooling and executable procedure, not memory.

### 13.1 Type & build gate (Required — shipped)
`npm run check` = `astro check --minimumFailingSeverity warning && astro build` (§3.5). The minimum local gate before every PR. Still to do: wire it into CI.

### 13.2 Linting (Roadmap)
`eslint` + `eslint-plugin-astro` + `@typescript-eslint`. Rules worth enforcing:
- ban raw hex/rgba **and raw Tailwind neutral classes** (`text-gray-*`, `bg-zinc-*`) in components
- flag bare global selectors in `is:global` blocks (require a `[data-*]` namespace)
- ban inline `style=` and `on*=` attributes
- require `rel="noopener noreferrer"` alongside `target="_blank"`

### 13.3 Formatting (Roadmap)
`prettier` + `prettier-plugin-astro` with a shared `.prettierrc` committed to the starter.

### 13.4 CI (Roadmap)
One PR workflow: `install → npm run check → eslint → (optional) Lighthouse CI on a preview build`. Block merge on failure; assert the §10.7 budgets so performance can't silently regress.

### 13.5 Accessibility automation (Roadmap)
`axe-core` (via Playwright or `@axe-core/cli`) against key templates in CI, as a backstop to the manual §11.4 audit. Automated checks catch a minority of issues; they don't replace keyboard and screen-reader passes.

### 13.6 Agent skills & commands (Required — shipped)

The repo ships **executable forms of this document** under `.claude/`. They are how a standard gets *run* rather than remembered, and they are part of the client deliverable (§1, principle 10).

| Path | Kind | What it does |
|---|---|---|
| `.claude/skills/launch/` | Skill | Pre-launch audit — the executable form of §11.5. Takes a `staging` or `production` mode, then verifies site identity and canonicals, referenced assets, robots and sitemap, **built HTML** (not source), demo-route leakage, placeholder sweep, env keys and bindings, analytics/consent, legal pages, canvas gating, and a browser pass. Reports `BLOCKER` / `SHOULD FIX` / `NEEDS HUMAN` / `NIT` / `CLEAN`, then fixes only with permission and only from a fixed allowlist. |
| `.claude/commands/build-component.md` | Command | Guided component build — the executable form of §5 + §6. Scope → targeted behavior questions → written plan → explicit approval → build → verify in a browser before declaring done. |

**Rules for authoring and maintaining them:**

- **The skill is derived from this document, never the reverse.** When a rule here changes, update the matching step in the **same change**. A shipped audit that contradicts the standard is worse than no audit, because it launders a stale rule as a passing check.
- **Every `§` reference in a skill must resolve.** Renumbering a section in this file means updating the skills in that commit.
- **Skills state procedure and severity, not rules.** A skill says *what to check, in what order, at what severity*; the rule itself lives here (§1, no duplication). A skill that restates a rule is a second copy that will drift.
- **No client-specific stances in a starter-level skill.** Radius, palette and type choices belong in the client's `DESIGN.md` (§4.2). A skill that hardcodes one project's stance silently breaks the next build.
- **No machine-specific absolute paths.** A skill shipped in a client repo runs on someone else's machine.
- **Never report an unrun check as passed** — mark it `NEEDS HUMAN` with how to verify. The `CLEAN` section is not optional: a report listing only failures gives no coverage signal, and the reader can't distinguish a passed check from a skipped one.
- **Audit before fixing.** Report first, fix only with permission, and keep the auto-fix allowlist narrow — never user-visible copy, legal text, brand artwork or redirect maps.
- **Severity discipline.** `BLOCKER` means a visitor experiences something broken, or there is legal/brand exposure. If everything is a blocker, the label stops meaning anything.

**Roadmap:** an intake skill (§12 phases 1–2) and a standalone accessibility-audit skill (§11.4) are the obvious next two.

### 13.7 Local development notes
- **Runtime-imported dependencies need pre-bundling.** A dep imported at runtime inside a `<script>` (animation libraries and their plugins, for example) can 504 in `astro dev` on first use. Add it to `optimizeDeps.include` in the Vite config.
- **Verify against a production build whenever dev and the host runtime differ.** Routing, adapters and image services can behave differently in dev; `npm run build && npm run preview` is the source of truth before you call something broken or fixed.
