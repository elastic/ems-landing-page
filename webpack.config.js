var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    main: ['babel-polyfill', path.resolve(__dirname, 'public/main.js')]
  },
  output: {
    path: __dirname,
    filename: 'public/[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(png|jpg|gif)$/,
        loaders: ['file-loader']
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
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
