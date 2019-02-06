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
  let benchmark = config.db.sequelize.benchmark || false
  let slowQueryTime = config.db.sequelize.slowQueryTime || 10000
  let skipTable = config.db.sequelize.skipLoggingTable || []
  if(config.dev){
    benchmark = true
    slowQueryTime = 1000
  }
  let inst = new Sequelize(
    config.db.sequelize.name,
    config.db.sequelize.user,
    config.db.sequelize.password,
    {
      host: config.db.sequelize.host,
      port: config.db.sequelize.port,
      dialect: config.db.sequelize.dialect || 'mysql',
      operatorsAliases: Sequelize.Op,
      benchmark: benchmark,
      logging: (sql,time,info) => {
        //if the user setup their own function just use that
        if('function' === typeof config.db.sequelize.logging){
          config.db.sequelize.logging(sql,time)
        } else if(true === config.dev) {
          if(time instanceof Object){
            info = time
            time = 'n/a '
          }
          if(!info) info = {}
          //skip session queries
          let skip = false
          if(info.tableNames){
            info.tableNames.forEach((t)=>{
              if(-1 < skipTable.indexOf(t)) skip = true
            })
          }
          if(!info.tableNames && info.instance &&
            -1 < skipTable.indexOf(info.instance._modelOptions.name.plural)){
            skip = true
          }
          if(!info.tableNames && !info.instance && info.type === 'BULKDELETE'){
            skipTable.forEach((t)=>{
              if(-1 < sql.indexOf(t)) skip = true
            })
          }
          //dont show the test query
          if(sql === 'Executed (default): SELECT 1+1 AS result'){
            skip = true
          }
          //skip logging query if needed
          if(skip) return
          //log query
          K.log.debug('SQL Query took ' + time + 'ms: ' + sql)
        } else if(!(time instanceof Object) && slowQueryTime > time){
          K.log.warn('SLOW QUERY took ' + time + 'ms: ' + sql)
        }
      }
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
