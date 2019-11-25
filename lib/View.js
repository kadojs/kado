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
   * @param {string} view string of the view
   * @return {string}
   */
  add(name,view){
    if(!view) view = name
    this.view[name] = view
    return view
  }
  /**
   * Update View
   * @param {string} name
   * @param {string} view
   * @return {string}
   */
  update(name,view){
    this.view[name] = view
    return view
  }
  /**
   * Remove View
   * @param {string} name
   * @return {string}
   */
  remove(name){
    let view = this.view[name]
    delete this.view[name]
    return view
  }
  /**
   * Get View
   * @param {string} name
   * @return {string}
   */
  get(name){
    return this.view[name]
  }
  all(){
    return this.view
  }
}


/**
 * Export class
 * @type {View}
 */
module.exports = View
