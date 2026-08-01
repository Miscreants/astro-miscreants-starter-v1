<!--docs-module: _standards-header | order: 00-->
<!--nav: Part of the Astro Build Standards. Map: docs/README.md · Router: docs/workflow.md · Generated single file: STANDARDS.md-->
<!--fragment: underscore-prefixed module. Only ever read as the head of the generated STANDARDS.md, so its relative links resolve from the repo root, not from docs/.-->

# Miscreants Astro Build Standards

> The single source of truth for how we build Astro sites for clients.
> This lives in `astro-miscreants-starter-v1` because the starter is the canonical baseline every client repo inherits. When a rule here changes, it changes here first, then propagates to client repos.

**Status:** v2 — see §16 for what changed.
**Audience:** anyone building or reviewing an Astro site at Miscreants.
**How to use:** Read §1–§2 once. Keep §11 (Checklists) and §12 (Runbook) open while you work. Reviewers gate PRs on §11.
**Conformance:** every rule marked **Required** is true of the starter today, or it is listed in §14 with the date it was found. The doc never claims something the reference implementation doesn't do.
**Source:** this single file is **generated** from the modules in [`docs/`](./docs/README.md) — edit a module there and run `npm run docs:build`; never edit the assembled file. For task-scoped reading, enter through the router at [`docs/workflow.md`](./docs/workflow.md), which points at only the modules a given job needs.

---

## Table of contents

1. [Why this exists](#1-why-this-exists)
2. [The build process (lifecycle)](#2-the-build-process-lifecycle)
3. [Project structure & conventions](#3-project-structure--conventions)
4. [Design tokens & styling](#4-design-tokens--styling)
5. [Components: the authoring standard](#5-components-the-authoring-standard)
6. [Component author templates](#6-component-author-templates)
7. [SEO, head & metadata](#7-seo-head--metadata)
8. [Accessibility](#8-accessibility)
9. [Content collections & data](#9-content-collections--data)
10. [Performance & build optimization](#10-performance--build-optimization)
11. [Checklists](#11-checklists)
12. [New-client setup runbook](#12-new-client-setup-runbook)
13. [Automated guardrails](#13-automated-guardrails)
14. [Starter conformance gaps](#14-starter-conformance-gaps)
15. [Roadmap](#15-roadmap)
16. [Changelog](#16-changelog)
