'use strict';
var fs = require('fs')
var Sequelize = require('sequelize')

var config = require('../config')

var inst
var modelPath = __dirname + '/../models'


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
var createInst = function(){
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
