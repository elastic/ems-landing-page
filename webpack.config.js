var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: {
    mapbox: './node_modules/mapbox-gl/dist/mapbox-gl.js',
    main: ['babel-polyfill', path.resolve(__dirname, 'public/main.js')]
  },
  output: {
    path: __dirname,
    filename: 'public/[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'resolve-url-loader', 'postcss-loader', 'sass-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!@elastic\/eui)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    alias: {
    }
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'mapbox',
      minChunks: Infinity
    }),
    new webpack.ProvidePlugin({}),
    new UglifyJsPlugin({
      sourceMap: true,
      exclude: 'public/mapbox.bundle.js',
      parallel: 4
    })
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map',
  cache: false
};
