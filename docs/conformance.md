<!--docs-module: conformance | order: 20-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## Starter conformance gaps
<!--rule: conformance | tier: reference-->

Where the starter does not yet meet a rule in this document. Every entry is dated and verified. **A rule marked Required with an entry here is not gated on until the entry clears.**

*Verified 2026-08-01.*

| Rule | Gap | Action |
|---|---|---|
| [seo.identity] site identity | `astro.config.mjs` hardcodes `site: 'https://example.com'` separately from `data/site.ts` | Import `site.url`; add the placeholder guard |
| [components.composition] SectionMain | Side rules (`border-l border-r`) are unconditional — no opt-out prop | Add `sideRules?: boolean` (or a `frame` variant) |
| [perf.prefetch] prefetch | Not configured | Add `prefetch` config with `defaultStrategy: 'hover'` |
| [tokens.scoped-styles] raw values | `HeroCanvas` and `ShinyButton` declare literal hex custom properties that don't follow the theme | Either promote to theme-aware tokens or document them under the [tokens.scoped-styles] allowance |
| [structure.git] lineage | No `starterVersion` field or upstream-remote convention in place yet | Add the field; document the pull workflow |
| [components.forms] forms | The starter ships the `Form`/`Field` UI only; no reference endpoint implements the security requirements | Ship a reference endpoint meeting [components.forms], or state per-project that it must be built |
| [structure.env] env | No build-time assertion for required env keys | Add assertions; revisit when `astro:env` is adopted |
| [seo.staging] staging (vs [guardrails.skills]) | The `launch` skill treats a missing `Disallow: /` on staging as a BLOCKER and accepts it as sufficient protection; [seo.staging] now demotes it to a secondary signal behind access control / `X-Robots-Tag` / meta-noindex | Rewrite the skill's staging row to check for one of the [seo.staging] methods, keeping `Disallow: /` as a bonus |

**Cleared in v2** (verified against the code, previously listed as debts): `Button.astro` already uses `interface Props extends HTMLAttributes<"button">` with the intersection deliberately rejected; the script-init flag is already uniform across every component; there are **zero** raw Tailwind neutral classes in `components/`.

**Cleared in v2.1:** the `build-component` command — which hardcoded one client's radius stance, pointed at a machine-specific path, and restated rules — was deleted. Its three pieces of unique content (the Astro `:global()` scoping trap, the hand-rolled focus-ring equivalent, and the BEM-vs-utilities naming guidance) were rescued into [components.styling] first.

**Cleared in v2.2 — [structure.gate] now holds.** `typecheck` runs `astro check --minimumFailingSeverity warning`, and the three errors it surfaced are fixed: ambient declarations for the untyped `@fontsource-variable/*` packages, `CodeBlock`'s `lang` prop derived from `<Code />` instead of a bare `string`, and `SliderBasicMap`'s `items` typed optional to match its own default and documented usage. Result: **0 errors, 0 warnings**, 71 files. 32 hints remain (unused locals, and the deprecated `z` re-export in `content.config.ts`) — hints don't fail the gate; see [roadmap].
