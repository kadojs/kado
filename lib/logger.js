'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const winston = require('winston')
const moment = require('moment')


/**
 * Setup logger
 * @param {string} name
 * @param {string} dateFormat
 * @return {winston.Logger}
 */
exports.setupLogger = (name,dateFormat) => {
  if(!name) name = 'kado'
  name = name.toUpperCase()
  if(!dateFormat) dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS'
  let formatLog = winston.format.printf(info => {
    info.level = info.level.toUpperCase()
    return `[${info.timestamp} ${info.label}] ${info.level}: ${info.message}`
  })
  let printLevel = 'kado' === process.env.NODE_DEBUG ? 'debug' : 'info'
  let logTransport = new winston.transports.Console({level: printLevel})
  return winston.createLogger({
    exitOnError: false,
    format: winston.format.combine(
      winston.format.label({ label: name }),
      winston.format.timestamp({
        format: ()=>{moment().format(dateFormat)}
      }),
      formatLog
    ),
    transports: [logTransport]
  })
}
