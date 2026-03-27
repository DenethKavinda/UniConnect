import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
<<<<<<< HEAD
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
=======
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5005',
        changeOrigin: true
      }
    }
  }
>>>>>>> fd82afdf7682838533e000ecf352d65c4ac2dae6
});
