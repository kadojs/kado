'use strict';
var winston = require('winston')
var moment = require('moment')

winston.remove(winston.transports.Console)


/**
 * Setup logger
 * @param {string} name
 * @param {string} dateFormat
 * @return {winston.Logger}
 */
exports.setupLogger = function(name,dateFormat){
  if(!name) name = 'kado'
  name = name.toUpperCase()
  if(!dateFormat) dateFormat = 'YYYY-MM-DD@HH:mm:ss.SSS'
  var logger = new winston.Logger({
    exitOnError: false,
    transports: [
      new winston.transports.Console({
        json: false,
        prettyPrint: true,
        timestamp: function(){
          return moment().format(dateFormat)
        },
        formatter: function(err){
          // Return string will be passed to logger.
          return '[' + err.timestamp() + ']' + ' ' + name +
            ' ' + err.level.toUpperCase() + ': ' + err.message + ' '
        }
      })
    ]
  })
  if('kado' === process.env.NODE_DEBUG){
    logger.transports.console.level = 'debug'
  }
  return logger
}
