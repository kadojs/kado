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

let localAsset = []
let localAssetExtra = []
let localJs = ''
let localExtraJs = ''
let localList = [
  process.env.KADO_USER_ROOT + '/interface/' + ifaceName + '/asset'
]
localList.map((root)=>{
  let assetFile = path.resolve(root + '/local.js')
  let assetExtraFile = path.resolve(root + '/localExtra.js')
  if(fs.existsSync(assetFile)){
    assetFile = assetFile.replace(/\\/g,'/')
    localAsset.push(assetFile)
    localJs = localJs + 'require(\'' + assetFile + '\')\n'
  }
  if(fs.existsSync(assetExtraFile)){
    assetExtraFile = assetExtraFile.replace(/\\/g,'/')
    localAssetExtra.push(assetExtraFile)
    localExtraJs = localExtraJs + 'require(\'' + assetExtraFile + '\')\n'
  }
})
//write the module list for reading in the extra.js helper
fs.writeFileSync(systemEntryFolder + '/local.js',localJs)
fs.writeFileSync(systemEntryFolder + '/localExtra.js',localExtraJs)


/**
 * Configure Webpack
 * @type {object}
 */
module.exports = {
  entry: {
    local: systemEntryFolder + '/local.js',
    localExtra: systemEntryFolder + '/localExtra.js'
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
