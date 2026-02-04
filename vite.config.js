/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Polyfill specific modules needed by @elastic/ems-client
      include: ['url', 'buffer', 'process'],
    }),
  ],
  
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
          // EUI and related Elastic packages
          eui: ['@elastic/eui', '@elastic/eui-theme-borealis', '@emotion/react', '@emotion/css'],
          // React ecosystem
          react: ['react', 'react-dom'],
        },
      },
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
