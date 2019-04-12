'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

let entryFolder = path.resolve(__dirname + '/asset')
let helperFolder = path.resolve(__dirname + '/../../helpers/asset')
let outputFolder = path.resolve(__dirname + '/public/dist')

/**
 * Configure Webpack
 * @type {object}
 */
module.exports = {
  entry: {
    required: helperFolder + '/required.js',
    extra: entryFolder + '/extra.js',
    dataTables: helperFolder + '/dataTables.js',
    tuiEditor: helperFolder + '/tuiEditor.js'
  },
  mode: process.env.DEV === 'kado' ? 'development' : 'production',
  devtool: process.env.DEV === 'kado' ? 'cheap-module-source-map' : 'source-map',
  output: {
    path: outputFolder,
    filename: '[name].js'
  },
  module: {
    rules: [
      {test: /datatables\.net.*/, loader: 'imports-loader?define=>false'},
      {test: /\.js$/, exclude: /node_modules/, use: {
        loader: 'babel-loader', options: {presets: ['env']}}}
    ]
  },
  optimization: {
    minimizer: [new TerserPlugin({
      parallel: true,
      sourceMap: true,
      terserOptions: {
        warnings: false,
        ie8: false
      }
    })]
  },
  performance: {hints: false}
}
