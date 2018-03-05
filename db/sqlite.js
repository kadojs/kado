'use strict';
var Database = require('better-sqlite3')
var path = require('path')

var K = require('../index')
var config = K.config.db

var dbfile
if(!config.sqlite.path){
  dbfile = K.path(config.sqlite.name + '.s3db')
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
  if(!dbfile.match(/^([/\\]+|[A-Z]:).*$/)) dbfile = K.path(dbfile)
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
  return open(K.path('plugins/' + plugin + '/' + plugin + '.s3db'))
}



/**
 * Export client
 * @return {object} client
 */
module.exports = function(){
  return client
}
