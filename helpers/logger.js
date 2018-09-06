'use strict';
/**
 * Kado - Awesome module system for Enterprise Grade applications.
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
        format: moment().format(dateFormat)
      }),
      formatLog
    ),
    transports: [logTransport]
  })
}
