'use strict';
var K = require('../index')
var Sequelize = require('sequelize')

var config = K.config

var inst


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
var createInst = function(){
  //configure the instance for connection
  var inst = new Sequelize(
    config.db.mysql.name,
    config.db.mysql.user,
    config.db.mysql.password,
    {
      host: config.db.mysql.host,
      port: config.db.mysql.port,
      dialect: config.db.mysql.dialect || 'mysql',
      logging: config.db.mysql.logging || false
    }
  )
  //load modules and load their models
  K.modules.forEach(function(mod){
    if(mod.enabled){
      var module = require(mod.root)
      if(module.model) module.model(inst)
    }
  })
  //now for the modules
  //load modules and load their models
  K.modules.forEach(function(mod){
    if(mod.enabled){
      var module = require(mod.root)
      if('function' === typeof module.modelKeyMapping){
        module.modelKeyMapping(inst)
      }
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
