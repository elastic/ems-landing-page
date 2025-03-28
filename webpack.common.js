/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const ASSET_PATH = process.env.ASSET_PATH || '';

module.exports = {
  entry: {
    main: ['@babel/polyfill', path.resolve(__dirname, 'public/main.js')]
  },
  mode: 'development',
  output: {
    clean: true,
    path: path.resolve(__dirname, 'build/release'),
    filename: '[name].[contenthash].bundle.js',
    publicPath: ASSET_PATH,
  },
  module: {
    noParse: /iconv-loader\.js/,
    rules: [
      {
        test: /mapbox-gl-rtl-text.min.js$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules|theme\.js/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.hbs$/,
        use: {
          loader: 'handlebars-loader'
        }
      }
    ]
  },
  externals: {
    'config': JSON.stringify(require(path.resolve(__dirname, 'public', 'config.json')))
  },
  resolve: {
    fallback: {
      "url": require.resolve("url/")
    },
    alias: {

    }
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: [
        path.resolve(__dirname, 'build/release/icon*')
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './public/config.json', to: '.' },
        { from: './public/favicon.ico', to: '.' },
      ]
    }),
    new HTMLWebpackPlugin({
      template: 'public/index.hbs',
      hash: true,
    }),
    new webpack.EnvironmentPlugin({
      EUI_THEME: 'amsterdam',
    }),
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: './build/release',
    },
  }
};
