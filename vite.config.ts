import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://ada-backend:8000',
        changeOrigin: true,
      }
    }
  }
});