'use strict';
const P = require('bluebird')
const redis = require('redis')

let RedisSchema = require('../helpers/RedisSchema')

let config = require('../config')

//make some promises
P.promisifyAll(redis)

/*jshint bitwise: false*/
let cfg = config.redis
let client = redis.createClient(cfg.port,cfg.host,cfg.options)
//handle auth
if(cfg.auth) client.auth(cfg.auth)
//select db
client.select(cfg.db || 0)


/**
 * Return an Object sorted by it's Key
 * @param {object} obj
 * @return {object}
 */
let sortObjectByKey = function(obj){
  let keys = Object.keys(obj)
  let sorted = {}
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
  let that = this
  let keys = []
  return that.keysAsync(pattern)
    .then(function(result){
      keys = result
      let promises = []
      for(let i = 0; i < keys.length; i++){
        promises.push(
          that.getAsync(keys[i])
        )
      }
      return P.all(promises)
    })
    .then(function(results){
      let data = {}
      for(let i = 0; i < results.length; i++)
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
  let that = this
  let removed = 0
  return that.keysAsync(pattern)
    .then(function(keys){
      let promises = []
      for(let i = 0; i < keys.length; i++){
        promises.push(
          that.delAsync(keys[i])
        )
      }
      return P.all(promises)
    })
    .then(function(results){
      for(let i = 0; i < results.length; i++)
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
