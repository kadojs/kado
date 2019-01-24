'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const K = require('../../../index')
const P = K.bluebird
const config = K.config
const fs = require('graceful-fs')
const ObjectManage = K.ObjectManage
let definitions = {}

if(fs.existsSync(__dirname + '/definitions.json'))
  require(__dirname + './definitions.json')

//make some promises
P.promisifyAll(fs)


/**
 * Build the config like a database would so we can manage it similar
 * @param {string} search
 * @param {number} start
 * @param {number} limit
 * @return {{rows: Array, count: number}}
 */
let queryConfig = (search,start,limit) => {
  let paths = config.$getPaths()
  let db = {rows: [], count: 0}
  paths.forEach((path) => {
    let parts = path.split('.')
    let isMod = config.$get(path) !== config.$get('originalConfig.' + path)
    //add a one line search filter :)
    if(search && parts.indexOf(search) < 0) return
    //dont show internals
    if(path.match(/^\$/) || path.match(/^originalConfig/)) return
    //dont show objects as they are containers
    if('object' !== typeof(config.$get(path))){
      if(path.match(/password/i)) return
      if(definitions[path]){
        db.rows.push({
          path: path,
          parts: parts,
          className: isMod ? 'alert-warning' : '',
          type: definitions[path].type,
          name: definitions[path].name,
          description: definitions[path].description,
          defaultValue: config.$get('originalConfig.' + path),
          value: config.$get(path)
        })
      } else{
        db.rows.push({
          path: path,
          parts: parts,
          className: isMod ? 'alert-warning' : '',
          type: typeof(config.$get(path)),
          name: parts[parts.length - 1],
          description: null,
          defaultValue: config.$get('originalConfig.' + path),
          value: config.$get(path)
        })
      }
    }
  })
  db.count = db.rows.length
  //set some defaults for the limit filter
  if(!start) start = 0
  if(!limit) limit = db.rows.length
  db.rows = db.rows.splice(start,limit)
  return db
}


/**
 * Find a config item to edit
 * @param {string} path
 * @return {object}
 */
let findConfig = (path) => {
  let result = queryConfig()
  let entry = {}
  result.rows.forEach((item) => {
    if(item.path === path) entry = item
  })
  return entry
}


/**
 * List settings
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  let result = queryConfig(null,0,10000)
  if(!result || !result.rows){
    res.render(res.locals._view.get('error'),{
      error: K._l.setting.no_settings_exist})
  } else {
    res.render(__dirname + '/view/list',{
      list: result.rows
    })
  }
}


/**
 * Process list actions
 * @param {object} req
 * @param {object} res
 */
exports.listAction = (req,res) => {
  let data = req.body
  let settingsFile = process.env.KADO_ROOT + '/settings.json'
  P.try(() => {
    //load settings overrides
    if(!fs.existsSync(settingsFile)){
      return fs.writeFileAsync(settingsFile,JSON.stringify({}))
    }
  })
    .then(() => {
      let settings = new ObjectManage(require(settingsFile))
      data.remove.forEach((path) => {
        //remove boot config
        settings.$remove(path)
        //revert running config
        config.$set(path,config.$get('originalConfig.' + path))
      })
      //write changes
      return fs.writeFileAsync(settingsFile,JSON.stringify(settings.$strip()))
    })
    .then(() => {
      req.flash('success',K._l.setting.overrides_cleared)
      res.redirect('/setting/list')
    })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
    })
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  P.try(() => {
    let setting = findConfig(req.query.path)
    if(!setting) throw new Error(K._l.setting.setting_not_found)
    res.render(__dirname + '/view/edit',{setting: setting})
  })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
    })
}


/**
 * Save
 * @param {object} req
 * @param {object} res
 */
exports.save = (req,res) => {
  let data = req.body
  let settingsFile = process.env.KADO_ROOT + '/settings.json'
  P.try(() => {
    //load settings overrides
    if(!fs.existsSync(settingsFile)){
      return fs.writeFileAsync(settingsFile,JSON.stringify({}))
    }
  })
    .then(() => {
      let settings = new ObjectManage(require(settingsFile))
      //save for restart
      settings.$set(data.path,data.value)
      //update running config
      config.$set(data.path,data.value)
      //write changes
      return fs.writeFileAsync(settingsFile,JSON.stringify(settings.$strip()))
    })
    .then(() => {
      req.flash('success',K._l.settings.setting_saved)
      res.redirect('/setting/edit?path=' + data.path)
    })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
    })
}
