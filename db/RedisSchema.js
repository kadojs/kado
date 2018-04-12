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
 * Prism list Key
 * @return {string}
 */
RedisSchema.prototype.prismList = function(){
  return this.applyPrefix('prismList')
}


/**
 * Store list Key
 * @return {string}
 */
RedisSchema.prototype.storeList = function(){
  return this.applyPrefix('storeList')
}


/**
 * Prism hits (for load balancing)
 * @param {string} token
 * @param {string} prism
 * @return {string}
 */
RedisSchema.prototype.prismHits = function(token,prism){
  return this.applyPrefix('prismHits:' + token + ':' + prism)
}


/**
 * Store hits (for load balancing)
 * @param {string} token
 * @param {string} store
 * @return {string}
 */
RedisSchema.prototype.storeHits = function(token,store){
  return this.applyPrefix('storeHits:' + token + ':' + store)
}


/**
 * Store entry
 * @param {string} store
 * @return {string}
 */
RedisSchema.prototype.storeEntry = function(store){
  return this.applyPrefix('storeEntry:' + store)
}


/**
 * Content existence cache
 * @param {string} hash
 * @return {string}
 */
RedisSchema.prototype.contentExists = function(hash){
  return this.applyPrefix('contentExists:' + hash)
}


/**
 * Check if the master is up
 * @return {string}
 */
RedisSchema.prototype.masterUp = function(){
  return this.applyPrefix('masterUp')
}


/**
 * Look up a user session by token
 * @param {string} username
 * @return {string}
 */
RedisSchema.prototype.user = function(username){
  return this.applyPrefix('user:' + username)
}


/**
 * Look up a user session by token
 * @param {string} token
 * @return {string}
 */
RedisSchema.prototype.userSession = function(token){
  return this.applyPrefix('userSession:' + token)
}


/**
 * Look up a purchase
 * @param {string} token
 * @return {string}
 */
RedisSchema.prototype.purchase = function(token){
  return this.applyPrefix('purchase:' + token)
}


/**
 * Purchase Cache by User Session
 * @param {string} token
 * @return {string}
 */
RedisSchema.prototype.purchaseCache = function(token){
  return this.applyPrefix('purchase:cache:' + token)
}


/**
 * Purchase Cache by User Session
 * @param {string} token
 * @return {string}
 */
RedisSchema.prototype.purchaseCacheInternal = function(token){
  return this.applyPrefix('purchase:cache:internal:' + token)
}


/**
 * Inventory
 * @param {string} hash
 * @return {string}
 */
RedisSchema.prototype.inventory = function(hash){
  return this.applyPrefix('inventory:' + hash)
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
