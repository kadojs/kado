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

module.exports = class Command {
  constructor(){
    this.name = 'command'
    this.log = null
    this.options = null
    this.parser = require('minimist')
    this.version = '0.0.0'
  }
  checkLog(){
    if(!this.log) throw new Error(`No logger defined for ${this.name}`)
  }
  checkOptions(){
    if(!this.options) throw new Error(`No options defined for ${this.name}`)
  }
  checkParser(){
    if(!this.parser) throw new Error(`No parser defined for ${this.name}`)
  }
  printVersion(){
    this.checkLog()
    this.log.info(`Version ${this.version}`)
  }
  generateHelp(){
    this.checkOptions()
    this.checkLog()
    let help = `Usage of ${this.name}: [options]\nOptions:\n`
    let opts = [...this.options]
    opts.unshift({definition: '-V, --version', description: 'output version'})
    opts.unshift({definition: '-h, --help', description: 'output help'})
    for(let opt of opts){
      let newLine = `  ${opt.definition}`
      while(newLine.length < 25){newLine = newLine + ' '}
      newLine = newLine + opt.description
      help = help + `${newLine}\n`
    }
    return help
  }
  printHelp(){
    console.log(this.generateHelp())
  }
  action(){
    this.checkLog()
    this.log.warn(`There is no action defined for this ${this.name}`)
  }
  parse(argv){
    this.checkParser()
    const opts = this.parser(argv)
    if(opts.h || opts.help){
      return this.printHelp()
    }
    if(opts.V || opts.version){
      return this.printVersion()
    }
    return Promise.resolve().then(()=>{ return this.action(opts) })
  }
}
