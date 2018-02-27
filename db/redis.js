'use strict';
var P = require('bluebird')
var redis = require('redis')

var RedisSchema = require('../helpers/RedisSchema')

var config = require('../config')

//make some promises
P.promisifyAll(redis)

/*jshint bitwise: false*/
var cfg = config.redis
var client = redis.createClient(cfg.port,cfg.host,cfg.options)
//handle auth
if(cfg.auth) client.auth(cfg.auth)
//select db
client.select(cfg.db || 0)


/**
 * Return an Object sorted by it's Key
 * @param {object} obj
 * @return {object}
 */
var sortObjectByKey = function(obj){
  var keys = Object.keys(obj)
  var sorted = {}
  // sort keys
  keys.sort()
  // create new array based on Sorted Keys
  keys.forEach(function(key){
    sorted[key] = obj[key]
  })
  return sorted
}


/**
 * Get keys by a pattern
 * @param {string} pattern
 * @return {P}
 * @this {cradle}
 */
client.getKeysPattern = function(pattern){
  var that = this
  var keys = []
  return that.keysAsync(pattern)
    .then(function(result){
      keys = result
      var promises = []
      for(var i = 0; i < keys.length; i++){
        promises.push(
          that.getAsync(keys[i])
        )
      }
      return P.all(promises)
    })
    .then(function(results){
      var data = {}
      for(var i = 0; i < results.length; i++)
        data[keys[i]] = results[i]
      data = sortObjectByKey(data)
      return {success: 'ok', count: results.length, data: data}
    })
}


/**
 * Remove keys by a pattern
 * @param {string} pattern
 * @return {P}
 * @this {cradle}
 */
client.removeKeysPattern = function(pattern){
  var that = this
  var removed = 0
  return that.keysAsync(pattern)
    .then(function(keys){
      var promises = []
      for(var i = 0; i < keys.length; i++){
        promises.push(
          that.delAsync(keys[i])
        )
      }
      return P.all(promises)
    })
    .then(function(results){
      for(var i = 0; i < results.length; i++)
        removed += results[i]
      return removed
    })
}


/**
 * Add schema to helper
 * @type {RedisSchema}
 */
client.schema = new RedisSchema(config.redis.prefix)


/**
 * Export client
 * @return {object} client
 */
module.exports = function(){
  return client
}
