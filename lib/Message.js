'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Message {
  static getInstance(){ return new Message() }
  constructor(){
    this.handlers = {}
  }
  allHandlers(){
    return this.handlers
  }
  addHandler(name,onMessage){
    this.handlers[name] = {
      name: name,
      message: true,
      onMessage: onMessage
    }
  }
  getHandler(name){
    return this.handlers[name]
  }
  removeHandler(name){
    delete this.handlers[name]
    return name
  }
  /**
   * Send a message
   * @param {string} to
   * @param {string} message
   * @param {object} options
   * return {Promise}
   */
  send(to,message,options){
    if(!to && !message && !options){
      throw new Error('No parameters sent to message send')
    }
    if(null !== options && 'object' !== typeof options && message){
      options = {text: message}
    } else if(options && !options.text && message) {
      options.text = message
    }
    //assign recipient
    if(options) options.to = to
    let handlers = this.handlers
    let mods = []
    //select messaging modules
    Object.keys(handlers).map((key) => {
      let mod = handlers[key]
      if(true === mod.message){
        mods.push(mod)
      }
    })
    //sort messaging modules
    mods.sort((a,b)=>{return (a.message.priority||0) - (b.message.priority||0)})
    //ship message to accepting modules and await their promises
    const promises = []
    for(let mod of mods){ promises.push(mod.onMessage(options)) }
    return Promise.all(promises)
  }
}
