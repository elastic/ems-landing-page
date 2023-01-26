/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

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
        //        use: [MiniCssExtractPlugin.loader,'style-loader', 'css-loader'],
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'resolve-url-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
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
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: [
        path.resolve(__dirname, 'build/release/icon*')
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './public/config.json', to: '.' }
      ]
    }),
    new HTMLWebpackPlugin({
      template: 'public/index.hbs',
      hash: true,
    }),
    // new MiniCssExtractPlugin(),
    new FaviconsWebpackPlugin({
      logo: './public/app_ems.svg',
      favicons: {
        icons: {
          coast: false,
          yandex: false,
          android: false,
          appleIcon: false,
          appleStartup: false,
          windows: false,
          firefox: false
        }
      }
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
