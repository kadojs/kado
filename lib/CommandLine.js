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
    return that.promise
      .catch((err) => {
        console.log(err)
        that.app.log.error('Command failed: ' + err.message)
        throw err
      })
  }
}

CommandLine.getInstance = (app)=>{
  return new CommandLine(app)
}

CommandLine.run = (command)=>{
  //so this is where we would basically parse and run a command artificially
  //but since we dont register all the commands yet like we should this
  //wont quite work right, but now this is becoming some sweet api, and i dont
  //think anyone has ever taken this time to really make the cli interface nice
  //thing to use, which in my opinion will help a lot with scripting
  //thought about it some more, so the command line system becomes core
  //sub system which requires all the modules to register their commands with
  //it and then we can introspect and run the commands when needed at which
  //point using this function will be trivial, hold on

}

module.exports = CommandLine
