import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5005',
        changeOrigin: true
      }
    }
  }
});
