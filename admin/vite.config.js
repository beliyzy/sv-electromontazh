import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The admin is served from <BASE_PATH>admin/, next to the site.
export default defineConfig({
  base: `${process.env.BASE_PATH ?? '/'}admin/`,
  plugins: [react()],
  server: {
    port: 5174,
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
});
