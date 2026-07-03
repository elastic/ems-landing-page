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
    alias: [
      { find: 'buffer', replacement: 'buffer' },
      { find: 'process', replacement: 'process/browser.js' },
      { find: 'url', replacement: 'url' },
      { find: 'util', replacement: 'util' },
      // @babel/runtime v8 dropped the public "helpers/esm/*" subpath from its
      // exports map, but several deps (emotion, react-redux, react-focus-lock,
      // react-window, redux, ...) still deep-import that path from their
      // precompiled ESM output. Resolve straight to the file on disk.
      {
        find: /^@babel\/runtime\/helpers\/esm\/(.+)$/,
        replacement: resolve(__dirname, 'node_modules/@babel/runtime/helpers/esm/$1.js'),
      },
    ],
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
    chunkSizeWarningLimit: 3200,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/maplibre-gl')) return 'maplibre';
          if (
            id.includes('node_modules/@elastic/eui') ||
            id.includes('node_modules/@elastic/eui-theme-borealis') ||
            id.includes('node_modules/@emotion/react') ||
            id.includes('node_modules/@emotion/css')
          ) return 'eui';
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
