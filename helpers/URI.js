'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


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
    if(!this.uri[name]) throw new Error('Requested undefined URI: ' + name)
    return this.uri[name]
  }

  /**
   * Pass through (this is the preferred usage)
   * @param {string} name
   * @param {string} uri
   */
  p(name,uri){
    if(!uri) uri = name
    if(!this.uri[name]) this.add(name,uri)
    return this.get(name)
  }
  /**
   * Get all URIs for template use mashed into an object
   * @param {boolean} replaceSlashes with underscores (default: true)
   * @return {object}
   */
  all(replaceSlashes){
    let that = this
    if(undefined === replaceSlashes) replaceSlashes = true
    if(replaceSlashes){
      let obj = {}
      for(let i in that.uri){
        if(this.uri.hasOwnProperty(i)){
          let e = i.replace(/[\/\\]+/g,'_')
          obj[e] = that.uri[i]
        }
      }
      return obj
    } else {
      return that.uri
    }
  }
}


/**
 * Export class
 * @type {URI}
 */
module.exports = URI
