/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new FaviconsWebpackPlugin('@elastic/eui/lib/components/icon/assets/app_ems.svg'),
  ]
});
