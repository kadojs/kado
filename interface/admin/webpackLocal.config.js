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

let entryFolder = path.resolve(process.env.KADO_ROOT +
  '/interface/admin/asset')
let outputFolder = path.resolve(process.env.KADO_ROOT +
  '/interface/admin/public/dist')
if(0 !== +process.env.KADO_USER_ROOT && fs.existsSync(
  path.resolve(process.env.KADO_USER_ROOT + '/interface/admin/asset'))
)
{
  entryFolder = path.resolve(process.env.KADO_USER_ROOT +
    '/interface/admin/asset')
}
if(0 !== +process.env.KADO_USER_ROOT && fs.existsSync(
  path.resolve(process.env.KADO_USER_ROOT + '/interface/admin/public'))
)
{
  outputFolder = path.resolve(process.env.KADO_USER_ROOT +
    '/interface/admin/public/dist')
}

let moduleAssets = []
let moduleJs = ''
let moduleList = childProcess.execSync(
  'node ' + process.env.KADO_ROOT +
  '/kado_modules/kado/bin/util.js scan-modules'
).toString('utf-8').split('\n')
moduleList.map((modRoot)=>{
  let assetFile = modRoot + '/admin/asset/index.js'
  if(fs.existsSync(assetFile)){
    moduleAssets.push(assetFile)
    moduleJs = moduleJs + 'require(\'' + assetFile + '\')\n'
  }
})
//write the module list for reading in the extra.js helper
fs.writeFileSync(entryFolder + '/module.js',moduleJs)


/**
 * Configure Webpack
 * @type {object}
 */
module.exports = {
  entry: {
    local: entryFolder + '/local.js',
    module: entryFolder + '/module.js',
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
    minimizer: [new TerserPlugin({
      parallel: true,
      terserOptions: {
        warnings: false,
        ie8: false
      }
    })]
  },
  performance: {hints: false}
}
