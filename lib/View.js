'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


/**
 * View constructor
 * @constructor
 */
class View {
  constructor(){
    this.view = {}
  }
  /**
   * Add View
   * @param {string} name
   * @param {string} file
   * @return {string}
   */
  add(name,file){
    if(!file) file = name
    this.view[name] = file
    return file
  }
  /**
   * Update View
   * @param {string} name
   * @param {string} file
   * @return {string}
   */
  update(name,file){
    this.view[name] = file
    return file
  }
  /**
   * Remove View
   * @param {string} name
   * @return {string}
   */
  remove(name){
    let file = this.view[name]
    delete this.view[name]
    return file
  }
  /**
   * Get View
   * @param {string} name
   * @return {string}
   */
  get(name){
    return this.view[name] || 'home'
  }
}


/**
 * Export class
 * @type {View}
 */
module.exports = View
