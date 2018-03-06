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
    config.db.sequelize.name,
    config.db.sequelize.user,
    config.db.sequelize.password,
    {
      host: config.db.sequelize.host,
      port: config.db.sequelize.port,
      dialect: config.db.sequelize.dialect || 'mysql',
      operatorsAliases: Sequelize.Op,
      logging: config.db.sequelize.logging || false
    }
  )
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
