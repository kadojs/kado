'use strict';



/**
 * Couch  Key Schema
 * @param {string} prefix
 * @constructor
 */
var CouchSchema = function(prefix){
  if(!prefix) prefix = ''
  this.prefix = prefix
}


/**
 * Apply Key Prefix
 * @param {string} key
 * @return {string}
 */
CouchSchema.prototype.applyPrefix = function(key){
  if(!this.prefix) return '' + key
  return this.prefix + ':' + (key || '')
}


/**
 * Prism Key
 * @param {string} name
 * @return {string}
 */
CouchSchema.prototype.prism = function(name){
  return this.applyPrefix('prism:' + (name || ''))
}


/**
 * Store Key
 * @param {string} prism (optional)
 * @param {string} name
 * @return {string}
 */
CouchSchema.prototype.store = function(prism,name){
  return this.applyPrefix('store:' + (prism || '') + (name ? ':' + name : ''))
}


/**
 * DownVote Key
 * @param {string} castee
 * @param {string} caster
 * @return {string}
 */
CouchSchema.prototype.downVote = function(castee,caster){
  var ending = caster ? ':' + caster : ''
  return this.applyPrefix('down:' + (castee || '') + ending)
}


/**
 * Look up a purchase
 * @param {string} token
 * @return {string}
 */
CouchSchema.prototype.purchase = function(token){
  return this.applyPrefix(token || '')
}


/**
 * Inventory
 * @param {string} hash
 * @param {string} prism
 * @param {string} store
 * @return {string}
 */
CouchSchema.prototype.inventory = function(hash,prism,store){
  return this.applyPrefix(
    (hash || '') +
    (prism ? ':' + prism : '') +
    (store ? ':' + store : '')
  )
}


/**
 * Export Object
 * @type {CouchSchema}
 */
module.exports = CouchSchema
