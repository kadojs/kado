'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class HyperText {
  static getInstance(){ return new HyperText() }
  constructor(){
    this.engine = null
    this.handlers = {}
    this.HyperTextEngine = require('./HyperTextEngine')
  }
  checkEngine(){
    if(!this.engine) throw new Error('No Hypertext engine active')
    if(!(this.engine instanceof this.HyperTextEngine)){
      throw new Error('Invalid engine type')
    }
  }
  checkHandler(name){
    if(!this.handlers[name]) throw new Error(`Handler ${name} does not exist`)
  }
  checkHandlerExists(name){
    if(this.handlers[name]) throw new Error(`Handler ${name} already exists`)
  }
  addHandler(name,instance){
    this.checkHandlerExists(name)
    this.handlers[name] = instance
    return name
  }
  getHandler(name){
    this.checkHandler(name)
    return this.handlers[name]
  }
  allHandlers(){
    return this.handlers
  }
  removeHandler(name){
    this.checkHandler(name)
    delete this.handlers[name]
    return name
  }
  activateHandler(name){
    this.engine = this.getHandler(name)
    return name
  }
  start(port,host){
    this.checkEngine()
    return this.engine.start(port,host)
  }
  stop(){
    this.checkEngine()
    return this.engine.stop()
  }
}
