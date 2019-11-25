'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')
const emailjs = require('emailjs')

class Email {
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
      return P.all(promises)
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

class EmailJs {
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
      if(options.hasOwnProperty(key)){
        this.options[key] = options[key]
      }
    }
  }
  connect(){
    this.server = emailjs.server.connect(this.options)
    return this.server
  }
  send(options){
    return new P((resolve,reject)=> {
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

Email.EmailJs = EmailJs

module.exports = Email
