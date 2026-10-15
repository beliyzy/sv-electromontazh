import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH: where the site is served from, e.g. /sv-electromontazh/ on GitHub Pages.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
});
