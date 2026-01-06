
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure API Key is available via environment variable during build/runtime
const API_KEY = process.env.API_KEY || '';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(API_KEY)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'), 
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist', 
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps for production security
    minify: 'terser',
    terserOptions: {
        compress: {
            drop_console: true, // Remove console logs in production
            drop_debugger: true
        }
    },
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
                ai: ['@google/genai', 'react-markdown'],
                charts: ['recharts'] // If added later
            }
        }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    css: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Explicitly include test files
  },
});
