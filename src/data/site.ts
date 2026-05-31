// Central site identity. Edit these once per project — Seo.astro and lib/schema.ts
// both read from here, so there's a single source of truth for name, URL, social
// image, logo, and social profiles.
//
// IMPORTANT: keep `url` in sync with `site` in astro.config.mjs. Canonical URLs,
// og:url/og:image, and schema.org @id identifiers are all resolved against it.

export const site = {
  /** Brand / site name — used for og:site_name and schema.org Organization. */
  name: "Your Site Name",
  /** Production origin, no trailing slash. Must match astro.config `site`. */
  url: "https://example.com",
  /** Default meta description; pages can override per-page. */
  description: "One-line description of the site for search and social cards.",
  /** Default social-share image, placed in /public (root-relative or absolute). */
  ogImage: "/og.jpg",
  /** Organization logo, placed in /public. Used in JSON-LD. */
  logo: "/logo.png",
  /** Twitter/X handle for twitter:site (optional). */
  twitter: "",
  /** Public profiles for schema.org sameAs (optional). */
  sameAs: [] as string[],
};
