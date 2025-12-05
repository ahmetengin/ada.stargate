
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import 'path' module
// Fix: Import fileURLToPath from 'url' for ESM __dirname equivalent
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
      // Cast process to any to resolve 'Property 'cwd' does not exist on type 'Process'' error
      '@': path.resolve((process as any).cwd(), './'), // Maps @ directly to the current working directory (project root)
    },
  },
  server: {
    host: true,
    port: 3000, // Frontend will run on port 3000 for local dev
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Python backend
        changeOrigin: true,
        ws: true // Enable WebSocket proxying for /api if needed by backend
      },
      '/ws': {
        target: 'http://127.0.0.1:8000', // For telemetry WebSocket
        changeOrigin: true,
        ws: true
      },
      '/radio': {
        target: 'http://127.0.0.1:8000', // For FastRTC Gradio interface
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist', // Output directory for build files
    emptyOutDir: true, // Clear the output directory before building
  }
});