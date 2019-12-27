'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class EmailConnector {
  constructor(options){
    this.server = null
    this.options = {
      user: 'root',
      password: '',
      host: 'localhost',
      port: 25,
      ssl: false,
      tls: false,
      timeout: 5000
    }
    for(let key in options){
      if(!options.hasOwnProperty(key)) continue;
      this.options[key] = options[key]
    }
  }
  checkServer(){
    if(!this.server) throw new Error('No Email server configured')
  }
  connect(){
    throw new Error('No connect method defined')
  }
  send(options){
    const that =this
    return Promise.resolve().then(()=> {
      that.checkServer()
      return new Promise((resolve,reject) => {
        that.server.send(options,(err,message) => {
          if(err) return reject(err)
          resolve(message)
        })
      })
    })
  }
  close(){
    this.server = null
    return true
  }
}
