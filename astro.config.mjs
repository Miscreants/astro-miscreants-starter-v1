// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Internal / demo routes excluded from the public sitemap. A path is dropped if
// it equals one of these or sits under it. Extend per project.
const SITEMAP_EXCLUDE = ['/styleguide', '/components', '/tve-preview'];

// Demo / reference routes live in src/demos (NOT src/pages), so they are never
// auto-built. This integration injects them only in `astro dev` — or in a build
// when SHOW_DEMOS=true — so the component showcase + styleguide are available
// locally (for the client and their AI agent) but never shipped to production.
/** @returns {import('astro').AstroIntegration} */
function demoRoutes() {
  const DEMOS = [
    { pattern: '/styleguide', entrypoint: './src/demos/styleguide.astro' },
    { pattern: '/tve-preview', entrypoint: './src/demos/tve-preview.astro' },
    { pattern: '/components', entrypoint: './src/demos/components/index.astro' },
    { pattern: '/components/[...slug]', entrypoint: './src/demos/components/[...slug].astro' },
  ];
  return {
    name: 'demo-routes',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, logger }) => {
        const enabled = command === 'dev' || process.env.SHOW_DEMOS === 'true';
        if (!enabled) {
          logger.info('Demo routes excluded from this build (set SHOW_DEMOS=true to include).');
          return;
        }
        for (const route of DEMOS) injectRoute(route);
        logger.info(`Demo routes enabled (${DEMOS.length} routes).`);
      },
    },
  };
}

// Pure static site, no adapter. The @astrojs/cloudflare adapter's image
// service passes images through UNoptimized (no sharp), so we drop it and let
// Astro's default sharp service transcode/resize at build into static /_astro/*.
// The contact-form Cloudflare action is disabled for now (src/actions/
// index.ts.disabled); re-enabling a working form needs server rendering — see
// notes: use Cloudflare Pages Functions or imageService:'cloudflare' alongside
// the adapter. For now the form is a static placeholder.

// https://astro.build/config
export default defineConfig({
  // Set this to the client's production origin. Required for canonical URLs,
  // og:url/og:image, JSON-LD @id values (keep src/data/site.ts `url` in sync),
  // and the sitemap. Replace the placeholder per project.
  site: 'https://example.com',
  output: 'static',
  build: {
    // Inline page CSS into <head> instead of emitting render-blocking
    // stylesheet requests — a material FCP/LCP win for static sites.
    inlineStylesheets: 'always',
  },
  integrations: [
    icon(),
    mdx(),
    demoRoutes(),
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !SITEMAP_EXCLUDE.some(
          (p) => pathname === p || pathname.startsWith(p + '/')
        );
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});