'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const childProcess = require('child_process')
const fs = require('fs')
const K = require('../../index')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

let entryFolder = path.resolve(__dirname + '/asset')
let helperFolder = path.resolve(__dirname + '/../../helpers/asset')
let outputFolder = path.resolve(__dirname + '/public/dist')

let moduleAssets = []
let moduleList = childProcess.execSync('node ' + K.root() +
  '/kado_modules/kado/bin/util.js scan-modules').toString('utf-8').split('\n')
moduleList.map((modRoot)=>{
  let modName = path.basename(modRoot)
  let assetFile = modRoot + '/admin/asset/' + modName + '.js'
  if(fs.existsSync(assetFile)){
    moduleAssets.push(assetFile)
  }
})
//write the module list for reading in the extra.js helper
fs.writeFileSync(outputFolder + '/moduleAssets.json',JSON.stringify({
  assets: moduleAssets
}))


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
    minimizer: [new TerserPlugin()]
  },
  performance: {hints: false}
}
