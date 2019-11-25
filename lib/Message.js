'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


/**
 * Message constructor
 * @constructor
 */
class Message {
  constructor(K){
    this.K = K
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
    options.to = to
    let K = this.K
    let mods = []
    //select messaging modules
    Object.keys(K.modules).map((key) => {
      let mod = K.modules[key]
      if(mod.message && true === mod.message.enabled){
        mods.push(mod)
      }
    })
    //sort messaging modules
    mods.sort((a,b)=>{return (a.message.priority||0) - (b.message.priority||0)})
    //ship message to accepting modules and await their promises
    return K.bluebird.try(()=>{return mods}).map((mod)=>{
      let modObj = require(mod.root + '/kado')
      if('function' !== typeof modObj.message) return
      //send message to module for processing
      return modObj.message(K,options)
    })
  }
}


/**
 * Export class
 * @type {Message}
 */
module.exports = Message
