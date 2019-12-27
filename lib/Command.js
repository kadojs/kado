'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
