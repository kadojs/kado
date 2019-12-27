'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

class EmailJs {
  static getInstance(){ return new EmailJs() }
  constructor(options){
    this.emailjs = require('emailjs')
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
      if(options.hasOwnProperty(key)){
        this.options[key] = options[key]
      }
    }
  }
  connect(){
    this.server = this.emailjs.server.connect(this.options)
    return this.server
  }
  send(options){
    return new Promise((resolve,reject)=> {
      this.server.send(options,(err,message) => {
        if(err) return reject(err)
        resolve(message)
      })
    })
  }
  close(){
    this.server = undefined
    return true
  }
}

module.exports = class Email {
  static getInstance(){ return new Email() }
  constructor(){
    this.handlers = []
    this.EmailJs = EmailJs
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
