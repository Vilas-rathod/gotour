// `vitest/config` re-exports Vite's defineConfig and adds the `test` block.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5176,
    proxy: {
      // Dev-only convenience: hit the API gateway without CORS round trips.
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing libraries so the main bundle stays small
        // and a page-level code change does not bust the vendor cache.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id))
            return 'react';
          if (/[\\/]node_modules[\\/](@reduxjs|react-redux|redux)/.test(id)) return 'redux';
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)/.test(id))
            return 'motion';
          if (/[\\/]node_modules[\\/](recharts|d3-|victory-)/.test(id)) return 'charts';
          if (/[\\/]node_modules[\\/]swiper/.test(id)) return 'carousel';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/test/**', '**/*.d.ts', 'src/main.tsx'],
    },
  },
});
