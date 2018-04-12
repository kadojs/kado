'use strict';
const K = require('../../../index')
const P = K.bluebird
const config = K.config
const fs = require('graceful-fs')
const list = K.list
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
let queryConfig = function(search,start,limit){
  let paths = config.$getPaths()
  let db = {rows: [], count: 0}
  paths.forEach(function(path){
    let parts = path.split('.')
    //add a one line search filter :)
    if(search && parts.indexOf(search) < 0) return
    //dont show internals
    if(path.match(/^\$/) || path.match(/^originalConfig/)) return
    //dont show objects as they are containers
    if('object' === typeof(config.$get(path))){
      db.rows.push({
        path: path,
        parts: parts,
        group: parts[parts.length - 1]
      })
    } else {
      if(definitions[path]){
        db.rows.push({
          path: path,
          parts: parts,
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
let findConfig = function(path){
  let result = queryConfig()
  let entry = {}
  result.rows.forEach(function(item){
    if(item.path === path) entry = item
  })
  return entry
}


/**
 * List settings
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  let limit = +req.query.limit || 20
  let start = +req.query.start || 0
  let search = req.query.search || ''
  if(start < 0) start = 0
  let result = queryConfig(search,start,limit)
  res.render(__dirname + '/view/list',{
    page: list.pagination(start,result.count,limit),
    count: result.count,
    search: search,
    limit: limit,
    list: result.rows
  })
}


/**
 * Process list actions
 * @param {object} req
 * @param {object} res
 */
exports.listAction = function(req,res){
  let data = req.body
  let settingsFile = process.env.KADO_ROOT + '/settings.json'
  P.try(function(){
    //load settings overrides
    if(!fs.existsSync(settingsFile)){
      return fs.writeFileAsync(settingsFile,JSON.stringify({}))
    }
  })
    .then(function(){
      let settings = new ObjectManage(require(settingsFile))
      data.remove.forEach(function(path){
        //remove boot config
        settings.$remove(path)
        //revert running config
        config.$set(path,config.$get('originalConfig.' + path))
      })
      //write changes
      return fs.writeFileAsync(settingsFile,JSON.stringify(settings.$strip()))
    })
    .then(function(){
      req.flash('success','Setting overrides cleared')
      res.redirect('/setting/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = function(req,res){
  P.try(function(){
    let setting = findConfig(req.query.path)
    if(!setting) throw new Error('Setting not found')
    res.render(__dirname + '/view/edit',{setting: setting})
  })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Save
 * @param {object} req
 * @param {object} res
 */
exports.save = function(req,res){
  let data = req.body
  let settingsFile = process.env.KADO_ROOT + '/settings.json'
  P.try(function(){
    //load settings overrides
    if(!fs.existsSync(settingsFile)){
      return fs.writeFileAsync(settingsFile,JSON.stringify({}))
    }
  })
    .then(function(){
      let settings = new ObjectManage(require(settingsFile))
      //save for restart
      settings.$set(data.path,data.value)
      //update running config
      config.$set(data.path,data.value)
      //write changes
      return fs.writeFileAsync(settingsFile,JSON.stringify(settings.$strip()))
    })
    .then(function(){
      req.flash('success','Settings saved')
      res.redirect('/setting/edit?path=' + data.path)
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
