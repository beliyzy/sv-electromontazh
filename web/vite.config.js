import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const env = process.env;

// SITE_URL: public address of the site without a trailing slash (canonical, sitemap), e.g. https://example.ru.
const siteUrl = (env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

// BASE_PATH: where the site is served from, e.g. /sv-electromontazh/ on GitHub Pages.
export default defineConfig({
  base: env.BASE_PATH ?? '/',
  define: {
    __SITE_URL__: JSON.stringify(siteUrl),
    // The demo (placeholders, github.io) must not be indexed: it would compete with the real domain.
    __NOINDEX__: JSON.stringify(env.VITE_DEMO === 'true' || env.NOINDEX === 'true'),
    __YANDEX_VERIFICATION__: JSON.stringify(env.YANDEX_VERIFICATION ?? ''),
    __GOOGLE_VERIFICATION__: JSON.stringify(env.GOOGLE_VERIFICATION ?? ''),
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
});
