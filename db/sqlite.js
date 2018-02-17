'use strict';
var Database = require('better-sqlite3')
var path = require('path')

var nouter = require('./nouter')
var config = require('../config')

var dbfile
if(!config.sqlite.path){
  dbfile = nouter.path(config.sqlite.name + '.s3db')
} else {
  dbfile = path.resolve(config.sqlite.path + '/' + config.sqlite.name + '.s3db')
}

/**
 * Open database connection
 * @param dbfile
 * @returns {*|Database}
 */
var open = function(dbfile){
  //if the path is relative run nouter.path on it
  if(!dbfile.match(/^([/\\]+|[A-Z]:).*$/)) dbfile = nouter.path(dbfile)
  dbfile = path.resolve(dbfile)
  return new Database(dbfile)
}

var client = open(dbfile)


/**
 * Open a new database and return that client
 * @param {string} dbfile
 * @return {*|Database}
 */
client.open = function(dbfile){
  return open(dbfile)
}


/**
 * Open a new database for a plugin easily
 * @param {string} plugin
 * @return {*|Database}
 */
client.plugin = function(plugin){
  return open(nouter.path('plugins/' + plugin + '/' + plugin + '.s3db'))
}



/**
 * Export client
 * @return {object} client
 */
module.exports = client
