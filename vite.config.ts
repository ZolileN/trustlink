import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // This enables the new JSX runtime (default in React 17+)
      jsxRuntime: 'automatic',
      // Fast Refresh is now enabled by default in @vitejs/plugin-react v2+
      // No need for explicit fastRefresh option
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    hmr: {
      clientPort: 5174,
      protocol: 'ws',
      // Add these HMR settings
      overlay: false, // Disable HMR overlay to prevent potential conflicts
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Ensure these are pre-bundled
    exclude: ['lucide-react'],
  },
  esbuild: {
    // This helps with Fast Refresh in development
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});