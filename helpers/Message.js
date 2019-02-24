'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
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
    if((!options || 'object' !== typeof options) && message){
      options = {text: message}
    }
    if(options.text && message) options.text = message
    //assign recipient
    options.to = to
    let K = this.K
    let mods = []
    //select messaging modules
    Object.keys(K.modules).forEach((key) => {
      let mod = K.modules[key]
      if(true !== mod.message) return
      mods.push(mod)
    })
    //sort messaging modules
    mods.sort((a,b)=>{return (a.message.priority||0) - (b.message.priority||0)})
    //ship message to accepting modules and await their promises
    return K.bluebird.try(()=>{return mods}).each((mod)=>{
      let modObj = require(mod.root + '/kado')
      if('function' !== typeof modObj.messaging) return
      //send message to module for processing
      return modObj.messaging(K,options)
    })
  }
}


/**
 * Export class
 * @type {Message}
 */
module.exports = Message
