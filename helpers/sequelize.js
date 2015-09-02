'use strict';
var fs = require('fs')
var path = require('path')
var Sequelize = require('sequelize')

var config = require('../config')

var inst
var modelPath = __dirname + '/../models'


/**
 * Setup the database relationships
 * @param {Sequelize} s
 */
var keyMapping = function(s){
  //probably going to be some local key mappings here related to the permission
  //system
}


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
var createInst = function(){
  //load modules
  var modules = []
  if(fs.existsSync(process.env.KADO_MODULES)){
    modules = require(process.env.KADO_MODULES).modules
  }
  //configure the instance for connection
  var inst = new Sequelize(
    config.mysql.name,
    config.mysql.user,
    config.mysql.password,
    {
      host: config.mysql.host,
      port: config.mysql.port,
      logging: config.mysql.logging || false
    }
  )
  //load models automatically from the fs
  fs.readdirSync(modelPath).forEach(function(file){
    if('.' === file || '.' === file) return
    inst.import(modelPath + '/' + file)
  })
  //load modules and load their models
  modules.forEach(function(modInfo){
    if(modInfo.enabled){
      var module = require(path.join(process.env.KADO_ROOT,modInfo.path))
      if(module.model) module.model(inst)
    }
  })
  //now do key mappings
  //local first
  keyMapping(inst)
  //now for the modules
  //load modules and load their models
  modules.forEach(function(modInfo){
    if(modInfo.enabled){
      var module = require(path.join(process.env.KADO_ROOT,modInfo.path))
      if(module.modelKeyMapping) module.modelKeyMapping(inst)
    }
  })
  //finally connect to the database
  inst.doConnect = function(){
    var that = this
    return that.authenticate().then(function(){return that.sync()})
  }
  return inst
}


/**
 * Export the singleton
 * @return {Sequelize}
 */
module.exports = function(){
  if(inst) return inst
  inst = createInst()
  return inst
}
