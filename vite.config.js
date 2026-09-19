import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite dev-server + build configuration.
 *
 * `server.port = 5173` is not just a preference — it must match
 * `app.cors.allowed-origins` in the backend's application.properties.
 * If you change one, change the other.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
