'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class View {
  static getInstance(){ return new View() }
  constructor(){
    this.engine = null
    this.handler = {}
    this.view = {}
  }
  /**
   * Add a view rendering handler
   * @param {string} name
   * @param {object} instance Instance of ViewHelper
   * @return {string}
   */
  addHandler(name,instance){
    this.handler[name] = instance
    return name
  }
  /**
   * Get the currently activated view engine
   *  or if no view engine is activated, activate the first one and return that
   * @return {null|object}
   */
  getEngine(){
    if(!this.engine){
      let handlerKeys = Object.keys(this.handler)
      if(handlerKeys.length === 0){
        throw new Error('getEngine() called while no rendering ' +
          'handlers are registered')
      }
      //activate the first available handler
      this.activateHandler(handlerKeys[0])
    }
    return this.engine
  }
  /**
   * Get a handler by name
   * @param {string} name
   * @returns {object|boolean}
   */
  getHandler(name){
    return this.handler[name] || false
  }
  /**
   * Activate a view handler in order to make it the engine
   * @param {string} name
   * @return {string}
   */
  activateHandler(name){
    this.engine = this.handler[name]
    return name
  }
  /**
   * Remove handler
   * @param {string} name
   * @return {string}
   */
  removeHandler(name){
    delete this.handler[name]
    return name
  }
  /**
   * All registered view handlers
   * @returns {{}}
   */
  allHandlers(){
    return this.handler
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
