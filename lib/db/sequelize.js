'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const debug = require('debug')('kado-db-sequelize')
const fs = require('fs')
const ObjectManage = require('object-manage')
const path = require('path')
const Sequelize = require('sequelize')


class Database {
  constructor(config,dev){
    this.dev = dev || false
    this.config = new ObjectManage({
      host: 'localhost',
      port: 3306,
      dialect: 'mysql',
      logging: false,
      define: {
        paranoid: false,
        freezeTableName: false,
        underscored: false,
        charset: 'utf8',
        dialectOptions: {
          collate: 'utf8_general_ci'
        }
      }
    })
    this.config.$load(config)
    //configure the instance for connection
    this.benchmark = this.config.benchmark || false
    this.slowQueryTime = this.config.slowQueryTime || 10000
    this.skipTable = this.config.skipLoggingTable || []
    //apply development overrides
    if(this.dev){
      this.benchmark = true
      this.slowQueryTime = 1000
    }
    //insert query logging function if enabled
    if(this.logging === true){
      this.config.logging = this.logging.bind(this)
    }
    //setup sequelize instance
    this.instance = new Sequelize(
      this.config.name,
      this.config.user,
      this.config.password,
      this.config.$strip()
    )
    //add the operators for compat and as the manual says we were using a dropped
    //prototype though
    this.instance.Op = Sequelize.Op
    this.instance._loadedModels = []
    let that = this
    //import model
    this.instance.doImport = (modelFile) => {
      let modelName = path.basename(modelFile)
      modelName = modelName.replace(path.extname(modelName),'')
      if(-1 < that.instance._loadedModels.indexOf(modelName)){
        if(process.env.DEBUG && process.env.DEBUG.match(/sequelize/i)){
          console.trace('Duplicate model load attempted on ' + modelName)
        }
        return that.instance.models[modelName]
      }
      that.instance._loadedModels.push(modelName)
      that.instance.import(modelFile)
      if(!that.instance.models[modelName]){
        throw new Error(modelName + ' not found, loading failed')
      }
      return that.instance.models[modelName]
    }
    //model relationships
    this.instance._relate = {
      custom: (onDelete,onUpdate,opts)=>{
        let o = new ObjectManage({onDelete: onDelete, onUpdate: onUpdate})
        o.$load(opts)
        return o.$strip()
      },
      cascade: (opts)=>{return that.instance._relate.custom('CASCADE','CASCADE',opts)},
      setNull: (opts)=>{return that.instance._relate.custom('SET NULL','SET NULL',opts)},
      noAction: (opts)=>{return that.instance._relate.custom('NO ACTION','NO ACTION',opts)}
    }
  }
  /**
   * Kado Query Logging
   * @param {string} sql
   * @param {Number} time
   * @param {object} info
   */
  logging(sql,time,info){
    //if the user setup their own function just use that
    if('function' === typeof this.config.logging){
      this.config.logging(sql,time)
    } else if(true === this.dev) {
      if(time instanceof Object){
        info = time
        time = 'n/a '
      }
      if(!info) info = {}
      //skip session queries
      let skip = false
      if(info.tableNames){
        info.tableNames.forEach((t)=>{
          if(-1 < this.skipTable.indexOf(t)) skip = true
        })
      }
      if(!info.tableNames && info.instance &&
        -1 < this.skipTable.indexOf(info.instance._modelOptions.name.plural)){
        skip = true
      }
      if(!info.tableNames && !info.instance && info.type === 'BULKDELETE'){
        this.skipTable.forEach((t)=>{
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
      debug('SQL Query took ' + time + 'ms: ' + sql)
    } else if(!(time instanceof Object) && this.slowQueryTime > time){
      console.warn('SLOW QUERY took ' + time + 'ms: ' + sql)
    }
  }
  connect(opts){
    if(!opts) opts = {}
    if(!opts.sync) opts.sync = false
    if(!opts.syncForce) opts.syncForce = false
    if(this.config.skipConnect === true) return
    let that = this
    let init
    if(this.config.modelInit){
      init = path.resolve(this.config.modelInit)
    }
    if(init && fs.existsSync(init)){
      debug('Sequelize calling model initialization')
      require(init)(this,this.instance)
    }
    return this.instance.authenticate().then(() => {
      if(opts.sync) return that.instance.sync({force: opts.syncForce})
    })
  }
  get(){
    return this.instance
  }
  close(){
    return this.instance.close()
  }
}

module.exports = Database
