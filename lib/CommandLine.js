'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')


class CommandLine {
  constructor(app){
    this.app = app
    this.version = app.config.version
    this.program = require('commander')
    this.promise = null
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
    let action = null
    if(!options) options = {}
    if(options.action) action = options.action
    const cmd = this.program.command(name)
    if(options.description) cmd.description(options.description)
    if(options.options instanceof Array){
      Object.keys(options.options).forEach((optKey) => {
        let opt = options.options[optKey]
        if(!opt || !opt.definition || !opt.description) return
        cmd.option(opt.definition,opt.description)
      })
    }
    if(action && typeof action === 'function'){
      cmd.action((opts)=> {
        that.promise = P.try(()=>{ return action(that.app,opts) })
      })
    }
  }
  execute(argv,exitOnFinish){
    const that = this
    const commands = this.all()
    if(exitOnFinish === undefined) exitOnFinish = true
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
    return that.promise
      .then(() => {
        that.app.log.debug('Command complete shutting down')
        if(exitOnFinish) process.exit(0)
      })
      .catch((err) => {
        console.log(err)
        that.app.log.error('Command failed: ' + err.message)
        if(exitOnFinish) process.exit(1)
      })
  }
}

CommandLine.getInstance = (app)=>{
  return new CommandLine(app)
}

module.exports = CommandLine
