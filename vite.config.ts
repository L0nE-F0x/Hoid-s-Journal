import { defineConfig, type Plugin } from 'vite';
import glsl from 'vite-plugin-glsl';

/** The canonical home. Everything in the built <head> that names an origin —
 *  the canonical link, og:url, the social card — resolves against this. */
const CANONICAL = 'https://the-cosmere.com';

function siteUrl(): Plugin {
  const env = process.env;
  // A production build always claims the canonical domain, even before the
  // custom domain is Netlify's primary one, so the card and the canonical do
  // not point readers at a *.netlify.app that is only a deploy detail. A
  // preview still names itself, because a preview claiming to be production is
  // how duplicate URLs get indexed.
  const url = (
    env.VITE_SITE_URL ||
    (env.CONTEXT === 'production' ? CANONICAL : env.DEPLOY_PRIME_URL || env.URL) ||
    CANONICAL
  ).replace(/\/$/, '');

  return {
    name: 'ceph-site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_URL%', url),
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [glsl({ compress: false }), siteUrl()],
  server: { host: '127.0.0.1', port: 5174 },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // The engine and the lore are each ~650 kB on purpose; warn past that.
    chunkSizeWarningLimit: 720,
    // Three is most of the bytes and changes once a release; the lore changes
    // with nearly every commit. As one 1.6 MB chunk, a new paragraph about a
    // Herald sent every returning reader the whole renderer again. Split, a
    // lore deploy re-downloads the lore and the browser keeps the engine.
    // Both are preloaded by the entry, so a first visit costs the same.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/') || id.includes('/node_modules/postprocessing/')) return 'engine';
          if (id.includes('/src/data/')) return 'lore';
          return undefined;
        },
      },
    },
  },
});
