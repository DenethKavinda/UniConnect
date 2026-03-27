import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5003',
        changeOrigin: true
      }
    }
  }
});
