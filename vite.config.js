/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  // Polyfill Node built-ins needed by @elastic/ems-client and deps (e.g. lru-cache uses util)
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser.js',
      url: 'url',
      util: 'util',
    },
  },
  // Set base path from environment variable (for CDN deployments)
  base: process.env.ASSET_PATH || '/',

  // Root directory for source files
  root: '.',

  // Public directory for static assets (copied as-is)
  publicDir: 'public',

  // Build configuration
  build: {
    outDir: 'build/release',
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
    // Increase limit since EUI is inherently large (~2.3 MB)
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          // MapLibre is the largest dependency
          maplibre: ['maplibre-gl'],
          // EUI and related Elastic packages (react/react-dom left to default to avoid empty chunk)
          eui: ['@elastic/eui', '@elastic/eui-theme-borealis', '@emotion/react', '@emotion/css'],
        },
      },
    },
  },

  // Use native class fields so MapLibre's web worker doesn't need the
  // __publicField helper (which is unavailable inside blob-URL workers).
  // - build.target: controls the production minification target
  // - esbuild.target: controls the dev/transform esbuild target
  // - optimizeDeps.esbuildOptions: covers the dev server pre-bundling
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },

  // Development server configuration
  server: {
    port: 8080,
    strictPort: true,
  },

  // Preview server (for testing production builds)
  preview: {
    port: 8080,
    strictPort: true,
  },

});
