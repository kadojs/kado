'use strict';
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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

module.exports = class Logger {
  static getInstance(){ return new Logger() }
  constructor(){
    this.handler = {}
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
    const fs = require('fs')
    const LineByLine = require('n-readlines')
    let log = ''
    if(fs.existsSync(path)){
      let fd = new LineByLine(path)
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
    const fs = require('fs')
    fs.appendFileSync(path,data)
    return data
  }
}
