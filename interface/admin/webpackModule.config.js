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
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

const ifaceName = 'admin'

let entryFolder = path.resolve(process.env.KADO_ROOT +
  '/interface/' + ifaceName + '/asset')
let systemEntryFolder = entryFolder
let outputFolder = path.resolve(process.env.KADO_ROOT +
  '/interface/' + ifaceName + '/public/dist')
if(0 !== +process.env.KADO_USER_ROOT && fs.existsSync(
  path.resolve(
    process.env.KADO_USER_ROOT + '/interface/' + ifaceName + '/asset'))
)
{
  entryFolder = path.resolve(process.env.KADO_USER_ROOT +
    '/interface/' + ifaceName + '/asset')
}
if(0 !== +process.env.KADO_USER_ROOT && fs.existsSync(
  path.resolve(
    process.env.KADO_USER_ROOT + '/interface/' + ifaceName + '/public'))
)
{
  outputFolder = path.resolve(process.env.KADO_USER_ROOT +
    '/interface/' + ifaceName + '/public/dist')
}

let moduleAsset = []
let moduleAssetExtra = []
let moduleJs = ''
let moduleExtraJs = ''
let moduleList = childProcess.execSync(
  'node ' + process.env.KADO_ROOT +
  '/kado_modules/kado/bin/util.js scan-modules'
).toString('utf-8').split('\n')
moduleList.map((modRoot)=>{
  let assetFile = modRoot + '/' + ifaceName + '/asset/module.js'
  let assetExtraFile = modRoot + '/' + ifaceName + '/asset/moduleExtra.js'
  if(fs.existsSync(assetFile)){
    moduleAsset.push(assetFile)
    moduleJs = moduleJs + 'require(\'' + assetFile + '\')\n'
  }
  if(fs.existsSync(assetExtraFile)){
    moduleAssetExtra.push(assetExtraFile)
    moduleExtraJs = moduleExtraJs + 'require(\'' + assetExtraFile + '\')\n'
  }
})
//write the module list for reading in the extra.js helper
fs.writeFileSync(systemEntryFolder + '/module.js',moduleJs)
fs.writeFileSync(systemEntryFolder + '/moduleExtra.js',moduleExtraJs)


/**
 * Configure Webpack
 * @type {object}
 */
module.exports = {
  entry: {
    module: systemEntryFolder + '/module.js',
    moduleExtra: systemEntryFolder + '/moduleExtra.js',
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
