'use strict';


/**
 * URI constructor
 * @constructor
 */
class URI {
  constructor(){
    this.uri = {}
  }
  /**
   * Add URI
   * @param {string} name
   * @param {string} uri
   * @return {string}
   */
  add(name,uri){
    if(!uri) uri = name
    this.uri[name] = uri
    return uri
  }
  /**
   * Update URI
   * @param {string} name
   * @param {string} uri
   * @return {string}
   */
  update(name,uri){
    this.uri[name] = uri
    return uri
  }
  /**
   * Remove URI
   * @param {string} name
   */
  remove(name){
    let uri = this.uri[name]
    delete this.uri[name]
    return uri
  }
  /**
   * Get URI
   * @param {string} name
   * @return {string}
   */
  get(name){
    return this.uri[name] || '/'
  }
}


/**
 * Export class
 * @type {Nav}
 */
module.exports = URI
