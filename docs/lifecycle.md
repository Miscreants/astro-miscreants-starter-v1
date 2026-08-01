<!--docs-module: lifecycle | order: 02-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->

## 2. The build process (lifecycle)

Every client engagement follows the same arc. Each phase has a checklist in §11 and a step-by-step in §12.

```
┌─ 0. Kickoff ──────────────────────────────────────────────────────┐
│  Gather brand assets: colors, fonts, logos, design refs (Figma).   │
│  Choose the production host (§10.8) and record it. Static output.  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 1. Scaffold ─────────────────────────────────────────────────────┐
│  Clone starter → rename → set site identity, analytics, host cfg.  │
│  Record starterVersion + upstream remote (§3.7).                   │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 2. Design system intake ─────────────────────────────────────────┐
│  Translate brand into @theme tokens (colors, fonts, radius,        │
│  motion). Decide the theme set. Rewrite DESIGN.md.                 │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 3. Componentize ─────────────────────────────────────────────────┐
│  Build page sections from starter primitives. New components       │
│  follow §5 + §6. Reuse before you create.                          │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 4. Content & SEO ────────────────────────────────────────────────┐
│  Wire content collections, per-page meta via Seo.astro, JSON-LD    │
│  in lib/schema.ts, sitemap filter.                                 │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 5. Optimize & QA ────────────────────────────────────────────────┐
│  astro:assets images, fonts, budgets (§10.7), a11y audit, clean    │
│  `npm run check`.                                                  │
└────────────────────────────────────────────────────────────────────┘
            │
┌─ 6. Launch ───────────────────────────────────────────────────────┐
│  Pre-launch checklist, deploy to the chosen host, verify prod.     │
└────────────────────────────────────────────────────────────────────┘
```

**Reuse-before-create rule:** before building any component or utility, search the starter. It ships 50+ components and a full token system. Most "new" needs are a prop away from an existing component.
