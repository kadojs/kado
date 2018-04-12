'use strict';



/**
 * Redis Key Schema
 * @param {string} prefix
 * @constructor
 */
let RedisSchema = function(prefix){
  if(!prefix) prefix = 'oose'
  this.prefix = prefix
}


/**
 * Apply Key Prefix
 * @param {string} key
 * @return {string}
 */
RedisSchema.prototype.applyPrefix = function(key){
  return this.prefix + ':' + key
}


/**
 * Key used to flush db on prism start
 * @return {string}
 */
RedisSchema.prototype.flushKeys = function(){
  return this.applyPrefix('*')
}


/**
 * Key used to print stats
 * @return {string}
 */
RedisSchema.prototype.statKeys = function(){
  return this.applyPrefix('counter:*')
}


/**
 * Counter stat
 * @param {string} system
 * @param {string} key
 * @return {string}
 */
RedisSchema.prototype.counter = function(system,key){
  return this.applyPrefix('counter:stat:' + system + ':' + key)
}


/**
 * Counter error
 * @param {string} system
 * @param {string} key
 * @return {string}
 */
RedisSchema.prototype.counterError = function(system,key){
  return this.applyPrefix('counter:error:' + system + ':' + key)
}


/**
 * Export Object
 * @type {RedisSchema}
 */
module.exports = RedisSchema
