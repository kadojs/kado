'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Email {
  static getInstance(){ return new Email() }
  constructor(){
    this.handlers = []
  }
  addHandler(name,instance){
    this[name] = instance
    this.handlers.push(name)
    return instance
  }
  removeHandler(name){
    delete this[name]
    this.handlers = this.handlers.splice(this.handlers.indexOf(name),1)
    return name
  }
  send(name,options){
    if(!name || name instanceof Object){
      if(name) options = name
      let promises = []
      this.handlers.forEach((name)=>{
        promises.push(this[name].send(options))
      })
      return Promise.all(promises)
    } else {
      return this[name].send(options)
    }
  }
  reset(name){
    if(!name){
      this.handlers.forEach((name)=>{this[name] = undefined})
    } else {
      this[name] = undefined
    }
    return true
  }
}
