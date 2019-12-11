'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


class Logger {
  constructor(){
    this.handler = {}
    this.logger = null
  }
  addHandler(name,instance){
    this.handler[name] = instance
    return name
  }
  getHandler(name){
    return this.handler[name] || false
  }
  activateHandler(name){
    this.logger = this.handler[name]
    return name
  }
  allHandlers(){
    return this.handler
  }
  removeHandler(name){
    delete this.handler[name]
    return name
  }
  getLogger(){
    return this.logger
  }
  reset(){
    this.logger = null
    return true
  }
}

module.exports = Logger
