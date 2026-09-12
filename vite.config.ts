import { defineConfig, type Plugin } from 'vite';
import glsl from 'vite-plugin-glsl';

function siteUrl(): Plugin {
  const env = process.env;
  const url = (
    (env.CONTEXT === 'production' ? env.URL : env.DEPLOY_PRIME_URL || env.URL) ||
    env.VITE_SITE_URL ||
    'https://thecosmere.netlify.app'
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
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
