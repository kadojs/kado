'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


class CommandLine {
  constructor(app){
    this.app = app
    this.version = app.config.version
    this.program = require('commander')
    this.commands = {}
  }
  getCommand(name){
    return this.commands[name]
  }
  removeCommand(name){
    delete this.commands[name]
    return name
  }
  all(){
    return this.commands
  }
  command(name,options){
    if(!options) options = {}
    options.name = name
    this.commands[name] = options
    return name
  }
  setupCommand(name,options){
    const that = this
    if(!options) options = {}
    this.program.command(name)
    if(options.description) this.program.description(options.description)
    if(options.options instanceof Array){
      Object.keys(options.options).forEach((optKey) => {
        let opt = options.options[optKey]
        if(!opt || !opt.definition || !opt.description) return
        this.program.option(opt.definition,opt.description)
      })
    }
    if(options.action && typeof options.action === 'function'){
      this.program.action((opts)=> {
        options.action(that.app,opts)
      })
    }
  }
  execute(argv){
    const that = this
    const commands = this.all()
    Object.keys(commands).forEach((comKey) => {
      const command = commands[comKey]
      that.setupCommand(comKey,command)
    })
    this.program.version(this.version)
    if(argv.length - 3 < 0){
      this.program.help()
    } else {
      this.program.parse(argv)
    }
    return this.program
  }
}

CommandLine.getInstance = (app)=>{
  return new CommandLine(app)
}

module.exports = CommandLine
