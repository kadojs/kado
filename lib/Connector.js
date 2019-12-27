'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Connector {
  static getInstance(){ return new Connector() }
  constructor(){
    this.connectors = []
  }
  addConnector(name,instance){
    this[name] = instance
    this.connectors.push(name)
    return instance
  }
  removeConnector(name){
    delete this[name]
    this.connectors = this.connectors.splice(this.connectors.indexOf(name),1)
    return name
  }
  connect(name){
    if(!name){
      let promises = []
      this.connectors.forEach((name)=>{
        promises.push(this[name].connect())
      })
      return Promise.all(promises)
    } else {
      return this[name].connect()
    }
  }
  close(name){
    if(!name){
      this.connectors.forEach((name)=>{this[name].close()})
    } else {
      this[name].close()
    }
    return true
  }
}
