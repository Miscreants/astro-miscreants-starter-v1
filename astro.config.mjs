// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

import mdx from '@astrojs/mdx';

// Pure static site, no adapter. The @astrojs/cloudflare adapter's image
// service passes images through UNoptimized (no sharp), so we drop it and let
// Astro's default sharp service transcode/resize at build into static /_astro/*.
// The contact-form Cloudflare action is disabled for now (src/actions/
// index.ts.disabled); re-enabling a working form needs server rendering — see
// notes: use Cloudflare Pages Functions or imageService:'cloudflare' alongside
// the adapter. For now the form is a static placeholder.

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [icon(), mdx()],
  vite: {
    plugins: [tailwindcss()]
  }
});