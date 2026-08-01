<!--docs-module: _standards-header | order: 00-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->
<!--fragment: underscore-prefixed module. Only ever read as the head of the generated STANDARDS.md, so its relative links resolve from the repo root, not from docs/.-->

# Miscreants Astro Build Standards

> The single source of truth for how we build Astro sites for clients.
> This lives in `astro-miscreants-starter-v1` because the starter is the canonical baseline every client repo inherits. When a rule here changes, it changes here first, then propagates to client repos.

**Status:** v2 — see [changelog] for what changed.
**Audience:** anyone building or reviewing an Astro site at Miscreants.
**How to use:** read [principles] once, then work from the router. Reviewers gate PRs on [checklists].
**Conformance:** every rule marked **Required** is true of the starter today, or it is listed in [conformance] with the date it was found. The doc never claims something the reference implementation doesn't do.
**Source:** this single file is **generated** from the modules in [`docs/`](./docs/README.md) — edit a module there and run `npm run docs:build`; never edit the assembled file. For task-scoped reading, enter through the router at [`docs/workflow.md`](./docs/workflow.md), which points at only the modules a given job needs.

### How to cite a rule

Every rule carries a **stable id** — `tokens.semantic-only`, `components.scripting`, `a11y.thresholds` — declared next to its heading:

```md
### Client-side scripting
<!--rule: components.scripting | tier: required-->
```

Reference one from anywhere in the repo by writing the id in square brackets: `[components.scripting]`. Ids never change when sections move or get renumbered, and `npm run docs:check` fails on a reference to an id that doesn't exist. **Never cite a rule by section number** — that's the failure mode this replaced.

---

## Table of contents

<!--toc-->

---
