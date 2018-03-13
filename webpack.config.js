var path = require('path');
var webpack = require('webpack');

module.exports = {
  // context: path.resolve(__dirname, 'public/'),
  entry: {
    main: ['babel-polyfill', path.resolve(__dirname, 'public/js/main.js')]
  },
  output: {
    path: __dirname,
    filename: 'public/dist/[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(png|jpg|gif)$/,
        loaders: ['file-loader']
      },
      {
        test: /\.css$/,
        loader: 'style!css',
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'postcss-loader', 'sass-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  resolve: {
    alias: {
    }
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({})
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map',
  debug: true,
  cache: true
};
