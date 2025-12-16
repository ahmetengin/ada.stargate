import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path'; 
import { fileURLToPath } from 'url';

// Use process.env for API_KEY injection during build for frontend
// This key will be available as import.meta.env.VITE_API_KEY in React components
const API_KEY = process.env.API_KEY || '';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows access to API_KEY in the frontend
    // Use import.meta.env.VITE_API_KEY in React code
    'process.env.API_KEY': JSON.stringify(API_KEY)
  },
  resolve: {
    alias: {
      // FIX: Ensure @ points directly to the project root using process.cwd()
      '@': path.resolve((process as any).cwd(), './'), 
    },
  },
  server: {
    host: true,
    port: 3000, 
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        ws: true 
      },
      '/ws': {
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        ws: true
      },
      '/radio': {
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist', 
    emptyOutDir: true, 
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    css: true,
  },
});