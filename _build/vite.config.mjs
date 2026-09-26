import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
// Serves the published site (the repository root) for local checks: npm run dev
export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  appType: 'mpa',
  server: { host: '0.0.0.0' },
});
