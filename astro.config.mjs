// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Keep pages static. Astro Actions still work via the adapter — Astro
  // mounts them at `/_actions/<name>` as on-demand endpoints alongside the
  // prerendered pages.
  //
  // platformProxy is intentionally OFF: enabling it makes `astro dev` run
  // every page through workerd, which breaks CJS-flavored deps like
  // `astro-icon` used across this project. The contact action's DEV branch
  // logs the payload and returns success without needing the binding.
  output: 'static',
  adapter: cloudflare(),
  integrations: [icon(), mdx()],
  vite: {
    plugins: [tailwindcss()]
  }
});