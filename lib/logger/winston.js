'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const fs = require('fs')
const moment = require('moment')
const winston = require('winston')

class LogHelper {
  constructor(name,options){
    this.log = null
    if(!name) name = 'kado'
    if(!options) options = {}
    this.setup(name,options)
  }
  setup(name,options){
    let dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS'
    const transports = []
    name = name.toUpperCase()
    if(options.dateFormat) dateFormat = options.dateFormat
    let formatLog = winston.format.printf(info => {
      info.level = info.level.toUpperCase()
      return `[${info.timestamp} ${info.label}] ${info.level}: ${info.message}`
    })
    let printLevel = 'kado' === process.env.NODE_DEBUG ? 'debug' : 'info'
    if(
      options && options.transport && options.transport.console &&
      options.transport.console.enabled === true
    ){
      transports.push(new winston.transports.Console({
        level: options.transport.console.level || printLevel
      }))
    }
    if(
      options && options.transport && options.transport.file &&
      options.transport.file.filename &&
      fs.existsSync(options.transport.file.filename) &&
      options.transport.file.enabled === true
    ){
      transports.push(new winston.transports.File({
        filename: options.transport.file.filename,
        level: options.transport.file.level || printLevel
      }))
    }
    this.log = winston.createLogger({
      exitOnError: false,
      format: winston.format.combine(
        winston.format.label({ label: name }),
        winston.format.timestamp({
          format: ()=>{moment().format(dateFormat)}
        }),
        formatLog
      ),
      transports: transports
    })
  }
  getLog(){
    return this.log
  }
  reset(){
    this.log = null
  }
}

module.exports = LogHelper
