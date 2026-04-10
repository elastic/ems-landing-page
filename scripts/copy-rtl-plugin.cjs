/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 *
 * Copies the Mapbox RTL text plugin from node_modules to public/ so it can be
 * loaded by MapLibre at runtime. The copied file is gitignored; this script
 * runs on postinstall so it is created after yarn install.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'node_modules', '@mapbox', 'mapbox-gl-rtl-text', 'dist', 'mapbox-gl-rtl-text.js');
const dest = path.join(root, 'public', 'mapbox-gl-rtl-text.js');

if (!fs.existsSync(src)) {
  console.warn('copy-rtl-plugin: @mapbox/mapbox-gl-rtl-text dist not found, skipping copy');
  process.exit(0);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
