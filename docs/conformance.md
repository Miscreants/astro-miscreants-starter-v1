<!--docs-module: conformance | order: 20-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 14. Starter conformance gaps

Where the starter does not yet meet a rule in this document. Every entry is dated and verified. **A rule marked Required with an entry here is not gated on until the entry clears.**

*Verified 2026-08-01.*

| Rule | Gap | Action |
|---|---|---|
| §3.5 type gate | `package.json` still runs `astro sync && tsc --noEmit`, which does not check `.astro` files | Swap in `astro check --minimumFailingSeverity warning`. It currently reports **3 errors** (a demo page rendering `SliderBasicMap` with no `items` prop; missing type declarations for the `@fontsource-variable/*` side-effect imports) plus 32 hints. Fix those, then gate. |
| §7.1 site identity | `astro.config.mjs` hardcodes `site: 'https://example.com'` separately from `data/site.ts` | Import `site.url`; add the placeholder guard |
| §5.0 SectionMain | Side rules (`border-l border-r`) are unconditional — no opt-out prop | Add `sideRules?: boolean` (or a `frame` variant) |
| §10.4 prefetch | Not configured | Add `prefetch` config with `defaultStrategy: 'hover'` |
| §4.7 raw values | `HeroCanvas` and `ShinyButton` declare literal hex custom properties that don't follow the theme | Either promote to theme-aware tokens or document them under the §4.7 allowance |
| §3.7 lineage | No `starterVersion` field or upstream-remote convention in place yet | Add the field; document the pull workflow |
| §5.7 forms | The starter ships the `Form`/`Field` UI only; no reference endpoint implements the security requirements | Ship a reference endpoint meeting §5.7, or state per-project that it must be built |
| §3.6 env | No build-time assertion for required env keys | Add assertions; revisit when `astro:env` is adopted |
| §7.6 staging (vs §13.6) | The `launch` skill treats a missing `Disallow: /` on staging as a BLOCKER and accepts it as sufficient protection; §7.6 now demotes it to a secondary signal behind access control / `X-Robots-Tag` / meta-noindex | Rewrite the skill's staging row to check for one of the §7.6 methods, keeping `Disallow: /` as a bonus |
| §4.2 + §13.6 (build-component) | The `build-component` command hardcodes one client's radius stance ("every surface is a sharp rectangle, `rounded-*` off the table"), points at a machine-specific memory path, and restates token/a11y/init rules that live in this file — including an init pattern that predates §5.6's `WeakSet` recipe | Strip the client stance and the absolute path; replace restated rules with `§` pointers; align the init snippet with §5.6 |

**Cleared in v2** (verified against the code, previously listed as debts): `Button.astro` already uses `interface Props extends HTMLAttributes<"button">` with the intersection deliberately rejected; the script-init flag is already uniform across every component; there are **zero** raw Tailwind neutral classes in `components/`.
