'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')

class Database {
  constructor(){
    this.databases = []
  }
  addDatabase(name,instance){
    this[name] = instance
    this.databases.push(name)
    return instance
  }
  removeDatabase(name){
    delete this[name]
    this.databases = this.databases.splice(this.databases.indexOf(name),1)
    return name
  }
  connect(name){
    if(!name){
      let promises = []
      this.databases.forEach((name)=>{
        promises.push(this[name].authenticate())
      })
      return P.all(promises)
    } else {
      return this[name].authenticate()
    }
  }
  close(name){
    if(!name){
      this.database.forEach((name)=>{this[name].close()})
    } else {
      this[name].close()
    }
    return true
  }
}

module.exports = Database
