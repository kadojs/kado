'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Logger {
  static getInstance(){ return new Logger() }
  constructor(){
    this.fs = require('fs')
    this.handler = {}
    this.LineByLine = require('n-readlines')
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
  /**
   * Sync tail file
   * @param {string} path
   * @return {string}
   */
  tailFile(path){
    let log = ''
    if(this.fs.existsSync(path)){
      let fd = new this.LineByLine(path)
      let line, lines = []
      while((line = fd.next())) lines.push(line)
      let start = lines.length - 20
      if(start < 0) start = 0
      log = lines.splice(start,lines.length-1).join('\n')
    }
    return log
  }
  /**
   * Append file with data
   * @param {string} path
   * @param {string} data
   * @return {string}
   */
  appendFile(path,data){
    this.fs.appendFileSync(path,data)
    return data
  }
}
