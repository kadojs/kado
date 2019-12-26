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
  static getInstance(app){
    return new CommandLine(app)
  }
  constructor(app){
    this.app = app
    this.version = app.config.version
    this.program = require('commander')
    this.commands = {}
    this.commandProgram = {}
    this.registeredModules = {}
  }
  getCommand(module,name){
    if(!this.commands[module]) return false
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
    this.commands[module][name] = options
    return name
  }
  addProgram(module,command,program){
    if(!this.commandProgram[module]) this.commandProgram[module] = {}
    this.commandProgram[module][command] = program
    return program
  }
  runProgram(module,command,argv){
    const that = this
    return new P((resolve,reject)=>{
      if(!that.commandProgram[module]){
        return reject(new Error(`Missing program ${module} ${command}`))
      }
      //if there is an action handler for the command go ahead and execute it
      if(
        that.commandProgram[module][command] &&
        typeof that.commandProgram[module][command].action === 'function'
      ){
        that.commandProgram[module][command].action((opts)=>{
          P.try(()=>{
            return that.commands[module][command].action(that.app,opts)
          }).then(resolve).catch(reject)
        })
      }
      argv.splice(2,1) //remove the module before parsing argv
      that.program.parse(argv)
    })
  }
  setupCommand(module,name){
    if(this.commandProgram[module] && this.commandProgram[module][name]){
      return this.commandProgram[module][name]
    }
    const options = this.commands[module][name]
    const cmd = this.program.command(name)
    if(options.description) cmd.description(options.description)
    if(options.options instanceof Array){
      options.options.forEach((opt) => {
        if(!opt || !opt.definition || !opt.description) return
        cmd.option(opt.definition,opt.description)
      })
    }
    return this.addProgram(module,name,cmd)
  }
  registerModule(module){
    const that = this
    if(
      !this.registeredModules[module] &&
      this.app.modules[module] &&
      typeof this.app.modules[module].cli === 'function'
    ){
      this.app.modules[module].cli(this.app)
      this.registeredModules[module] = true
      Object.keys(this.all()).forEach((modKey) => {
        if(modKey !== module) return
        Object.keys(that.commands[modKey]).forEach((comKey) => {
          that.setupCommand(modKey,comKey)
        })
      })
    }
  }
  run(command){
    //so this is where we would basically parse and run a command artificially
    //but since we dont register all the commands yet like we should this
    //wont quite work right, but now this is becoming some sweet api, and i dont
    //think anyone has ever taken this time to really make the cli interface nice
    //thing to use, which in my opinion will help a lot with scripting
    //thought about it some more, so the command line system becomes core
    //sub system which requires all the modules to register their commands with
    //it and then we can introspect and run the commands when needed at which
    //point using this function will be trivial, hold on
    let argv = [process.argv[0],process.argv[1]].concat(command.split(' '))
    return this.execute(argv)
  }
  execute(argv){
    const that = this
    let module = null
    let command = null
    if(argv.length >= 4){
      module = argv[2]
      command = argv[3]
    }
    if(!module) throw new Error('Missing module for command')
    if(!command) throw new Error(`Missing command for module ${module}`)
    this.registerModule(module)
    this.program.version(this.version)
    if(argv.length - 3 < 0){
      return this.program.help()
    }
    return this.runProgram(module,command,argv)
      .catch((err) => {
        that.app.log.debug('Command failed: ' + err.message)
        throw err
      })
  }
}

module.exports = CommandLine
