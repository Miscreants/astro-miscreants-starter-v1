<!--docs-module: rules/structure-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md-->

## Project structure & conventions
<!--rule: structure | tier: reference-->

### Directory layout
<!--rule: structure.layout | tier: required-->

The canonical `src/` tree:

```
src/
├── components/          # PascalCase .astro, one component per file (flat)
│   └── _docs/           # showcase-only helpers (Preview, PropsTable)
├── content/             # Markdown/MDX content collections
├── content.config.ts    # Zod schemas for every collection
├── data/                # static data & site identity (site.ts, *.json)
├── demos/               # dev-only routes: /styleguide, /components, previews
├── images/              # source images imported through astro:assets
├── layouts/             # Layout.astro and any page-type layouts
├── lib/                 # logic helpers — JSON-LD builders (schema.ts)
├── pages/               # kebab-case routes (production routes ONLY)
├── styles/              # global.css
└── env.d.ts             # ambient types
```

Root files that are part of the deliverable:

```
astro.config.mjs      # site, output, integrations, demo-route gating
wrangler.jsonc        # Cloudflare host config (or netlify.toml)
functions/            # host functions, when a project needs them
public/               # _headers, _redirects, robots.txt, favicons, OG images
DESIGN.md             # the client's token/brand contract
docs/                 # the rulebook — start at docs/workflow.md
AGENTS.md / CLAUDE.md # agent entry points — pointers, not rule copies ([principles])
```

**Rules:**
- **Flat `components/` directory** with semantic filename prefixes (`Card*`, `Nav*`, `Section*`). Only group into a subfolder when a component is a true family.
- **One component = one PascalCase file.** No `index.astro` component folders.
- **`src/demos/` is not `src/pages/`.** Anything in `pages/` ships. Demo, showcase and preview routes live in `demos/` and are injected only in dev ([deploy.static]).
- **`lib/` for logic helpers**, **`data/` for static registries and site identity**. Neither goes inside `components/`.

### Naming conventions
<!--rule: structure.naming | tier: required-->

| Thing | Convention | Example |
|---|---|---|
| Component file | `PascalCase.astro` | `CardFeatured.astro` |
| Page section | `Section*` prefix | `SectionFeatures.astro` |
| Page file & route | `kebab-case` | `contact.astro` → `/contact` |
| Dynamic route | bracket placeholder | `[...slug].astro` |
| Data / lib file | `kebab-case` / `camelCase.ts` | `site.ts`, `schema.ts` |
| Content slug | `kebab-case`, matches frontmatter | `series-a.md` |
| CSS data hook | `data-<component>` kebab | `data-field="component"` |
| Semantic color | `--color-<role>` | `--color-fg-muted` |
| Typography utility | `@utility h1`, `text-body-lg` | — |

**Naming exception — `Hero`.** A page's opening section may be named `Hero` (or `Hero*`) rather than `SectionHero`; it is still a section in every other respect ([components.composition]) and still builds on `SectionMain` unless it is genuinely full-bleed. This is the only sanctioned exception to the `Section*` prefix.

### Path aliases (tsconfig)
<!--rule: structure.aliases | tier: required-->

The starter defines these — **every client repo keeps them identical** so imports are portable:

```jsonc
"paths": {
  "@components/*": ["src/components/*"],
  "@layouts/*":    ["src/layouts/*"],
  "@content/*":    ["src/content/*"],
  "@styles/*":     ["src/styles/*"],
  "@images/*":     ["src/images/*"],
  "@data/*":       ["src/data/*"],
  "@/*":           ["src/*"]
}
```

Prefer aliases over deep relative paths. Sibling imports may stay relative.

### Versions & engines
<!--rule: structure.versions | tier: default-->

**The starter's `package.json` is the version baseline** — read it there rather than trusting a number written in prose. The policy:

- Node is pinned in `engines` (currently `>=22.12.0`); keep it identical across client repos.
- The stack is Astro + Tailwind v4 (via `@tailwindcss/vite`) + TypeScript, with `astro-icon`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/partytown`.
- **Bump the starter first**, validate with `npm run check` and a production build, then roll clients forward. Never bump a major in a client repo first.
- Record the starter version a client repo was cut from ([structure.git]) so upgrades are traceable.

### Required scripts — the type & build gate
<!--rule: structure.gate | tier: required-->

**Required.**

```jsonc
"scripts": {
  "dev":        "astro dev",
  "build":      "astro build",
  "preview":    "astro preview",
  "typecheck":  "astro check --minimumFailingSeverity warning",
  "docs:build": "node scripts/build-doc-links.mjs",
  "docs:check": "node scripts/check-docs.mjs",
  "check":      "npm run typecheck && npm run docs:check && npm run build"
}
```

**Why `astro check` and not `tsc --noEmit`:** `tsc` does not read `.astro` files at all, so a `tsc`-based gate type-checks almost none of an Astro codebase — missing required props, bad prop types and broken component usage all pass. `astro check` (from `@astrojs/check`, already a devDep) checks `.astro` **and** `.ts`, and runs the `astro sync` step itself, so no separate `astro sync` is needed.

`--minimumFailingSeverity warning` means compiler warnings — including accessibility warnings — fail the gate. That is deliberate and consistent with [a11y]. Hints do not fail.

**`docs:check`** is the documentation half of the gate ([guardrails.docs-check]): it fails the build on a citation to a rule id that doesn't exist, on a stale rule-link block, on a broken relative link, and on any surviving `§` section reference.

`npm run check` is the local gate before every PR. See [conformance] for the starter's current conformance state.

### Environment variables & secrets
<!--rule: structure.env | tier: required-->

- **`PUBLIC_` prefix = public.** Only `PUBLIC_*` vars reach client code / the bundle (Astro rule). Everything else is build/server-only. **Never put a secret in a `PUBLIC_` var.**
- Read via `import.meta.env.PUBLIC_*` (client) or `import.meta.env.*` (build-only).
- **Commit `.env.example`** (keys, no values); **never commit `.env`**.
- Build-time vars are set in the host dashboard. Runtime secrets (e.g. a form Worker) live in the host's secret store / bindings ([components.forms]) — never in the repo.
- **A missing required key must fail the build, not render `undefined`.** Until typed env lands ([roadmap]), assert required keys explicitly at config load.

> **Roadmap — `astro:env`.** Astro's typed env schema validates keys at build time and gives typed access with no manual assertions. Adopting it is the intended direction; until it ships in the starter, the `import.meta.env` rules above are the standard.

### Git, branching, deploy & starter lineage
<!--rule: structure.git | tier: required-->

- **Push source, never `dist`.** The host builds from source; `dist/` stays gitignored.
- **One branch deploys.** The production branch (usually `main`) is wired to the host's Git build — pushing it ships. **Know which *remote* is production before you push** (a repo often has an agency mirror *and* the client's production repo).
- Commit under the **correct author identity**; present-tense, conventional messages.
- Non-trivial work goes on a branch → PR → merge to the deploy branch.
- **Starter lineage (Required).** A client repo records the starter commit/version it was cut from — a `starterVersion` field in `package.json` — and keeps the starter as a second git remote (`upstream`). Improvements are made in the starter and pulled/cherry-picked forward. Resetting history to zero with no recorded lineage makes principle 2 impossible and is not acceptable.

### Repo as an agent platform
<!--rule: structure.agent-brief | tier: default-->

The client builds pages with an AI agent, so the repo must brief that agent — the docs are part of the deliverable ([principles], principle 10). Every client repo ships `AGENTS.md` (canonical) with `CLAUDE.md` pointing at it. That brief:

- names `DESIGN.md` (tokens/brand) and `docs/` as **authoritative**, and defers to them rather than restating rules ([principles]);
- lists the non-negotiables in one line each: semantic tokens only, accessibility required, pages compose sections, build sections on `SectionMain`, `astro:assets` for images, gate animated canvases;
- gives a **"how to add a page" recipe**: create `src/pages/<route>.astro` → wrap in `Layout` with `title`/`description`/`jsonLd` → compose existing sections → add new `Section*` components for new chunks → `npm run check`;
- says **where to look**: primitives in `components/`, the live showcase at `/components` (dev), per-component docs in `src/content/components/`, content in `content/`.

- points at the executable procedures in `.claude/` ([guardrails.skills]) — the guided component build and the pre-launch audit.

Keep it short and imperative — it's the agent's front door, not a manual.

<!-- rule-links: generated by scripts/build-doc-links.mjs — do not edit -->
[a11y]: ./accessibility.md#accessibility
[components.composition]: ./components.md#composition-model-pages--sections--components
[components.forms]: ./components.md#forms-----progressively-enhanced-and-hardened
[conformance]: ../conformance.md#starter-conformance-gaps
[deploy.static]: ./deployment.md#deployment--static
[guardrails.docs-check]: ../guardrails.md#documentation-integrity-check-required--shipped
[guardrails.skills]: ../guardrails.md#agent-skills--commands-required--shipped
[principles]: ./principles.md#why-this-exists
[roadmap]: ../roadmap.md#roadmap
[structure.git]: ./structure.md#git-branching-deploy--starter-lineage
<!-- /rule-links -->
