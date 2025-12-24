
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path'; 
import { fileURLToPath } from 'url';

// Fix for: Cannot find name '__dirname' in ESM environment for Vite configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.API_KEY || '';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(API_KEY)
  },
  resolve: {
    alias: {
      // Standardize the alias to resolve paths correctly from the project root
      '@': path.resolve(__dirname, './'), 
    },
    // Ensure .ts and .tsx extensions are tried in order
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
