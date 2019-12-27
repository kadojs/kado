'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class CommandServer {
  constructor(app){
    this.app = app
    this.version = app.config.version
    this.commands = {}
  }
  getCommand(module,name){
    if(!this.commands[module])
      throw new Error(`Module ${module} not found`)
    if(!this.commands[module][name])
      throw new Error(`Command ${name} not found in ${module}`)
    return this.commands[module][name]
  }
  removeCommand(module,name){
    if(!this.commands[module]) return false
    delete this.commands[module][name]
    return name
  }
  all(){
    return this.commands
  }
  command(module,name,options){
    if(!options) options = {}
    options.name = name
    if(!this.commands[module]) this.commands[module] = {}
    const that = this
    const CommandSuper = require('./Command')
    class Command extends CommandSuper {
      constructor(){
        super()
        this.name = name
        this.options = options
        this.version = that.version
        this.log = that.app.log
      }
      action(opts){
        return options.action.call(this,opts)
      }
    }
    this.commands[module][name] = new Command()
    return name
  }
  run(command){
    //so this is where we would basically parse and run a command artificially
    //but since we dont register all the commands yet like we should this
    //wont quite work right, but now this is becoming some sweet api, and i dont
    //think anyone has ever taken this time to really make the cli interface
    //nice thing to use, which in my opinion will help a lot with scripting
    //thought about it some more, so the command line system becomes core
    //sub system which requires all the modules to register their commands with
    //it and then we can introspect and run the commands when needed at which
    //point using this function will be trivial, hold on
    let argv = process.argv.slice(0,2).concat(command.split(' '))
    let [,,module,name] = argv
    return this.getCommand(module,name).parse(argv)
  }
}
