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
class Router {
  constructor(){
    this.route = {}
  }
  /**
   * Add URI
   * @param {string} name
   * @param {string} uri
   * @return {string}
   */
  add(name,uri){
    if(!uri) uri = name
    this.route[name] = uri
    return uri
  }
  /**
   * Update URI
   * @param {string} name
   * @param {string} uri
   * @return {string}
   */
  update(name,uri){
    this.route[name] = uri
    return uri
  }
  /**
   * Remove URI
   * @param {string} name
   */
  remove(name){
    let uri = this.route[name]
    delete this.route[name]
    return uri
  }
  /**
   * Get URI
   * @param {string} name
   * @return {string}
   */
  get(name){
    if(!this.route[name]) throw new Error('Requested undefined URI: ' + name)
    return this.route[name]
  }

  /**
   * Accept route method assignments with a handler
   * @param {string} method HTTP METHOD
   * @param {string} path URI of the route
   */
  method(method,path){
    let handlers = Array.prototype.slice.call(arguments,2)
    console.log(method,path,handlers)
  }
  /**
   * Pass through (this is the preferred usage)
   * @param {string} name
   * @param {string} uri
   */
  p(name,uri){
    if(!uri) uri = name
    if(!this.route[name]) this.add(name,uri)
    return this.get(name)
  }
  all(){
    return this.route
  }
  /**
   * Get all URIs for template use mashed into an object
   * @param {boolean} replaceSlashes with underscores (default: true)
   * @return {object}
   */
  allForTemplate(replaceSlashes){
    let that = this
    if(undefined === replaceSlashes) replaceSlashes = true
    if(replaceSlashes){
      let obj = {}
      for(let i in that.route){
        if(that.route.hasOwnProperty(i)){
          let e = i.replace(/[\/\\]+/g,'_')
          obj[e] = that.route[i]
        }
      }
      return obj
    } else {
      return that.route
    }
  }
}


/**
 * Export class
 * @type {Router}
 */
module.exports = Router
