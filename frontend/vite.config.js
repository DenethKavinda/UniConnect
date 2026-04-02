import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// If the backend moved to another port (e.g. after ALLOW_PORT_FALLBACK), set VITE_PROXY_API_TARGET in .env.local
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Use 127.0.0.1 so the proxy hits the same stack as curl; [::1]/localhost mismatches are avoided.
  const apiTarget = env.VITE_PROXY_API_TARGET || 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
