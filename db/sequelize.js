'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
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
const K = require('../index')
const Sequelize = require('sequelize')

let config = K.config

let inst


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
let createInst = () => {
  //configure the instance for connection
  let inst = new Sequelize(
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
  inst.doConnect = function(opts){
    if(!opts) opts = {}
    if(!opts.sync) opts.sync = false
    let that = this
    return that.authenticate().then(() => {
      if(opts.sync) return that.sync()
    })
  }
  return inst
}


/**
 * Export the singleton
 * @return {Sequelize}
 */
module.exports = () => {
  if(inst) return inst
  inst = createInst()
  return inst
}
