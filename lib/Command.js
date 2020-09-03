'use strict'
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
const Assert = require('./Assert')
class Command {
  constructor () {
    this.name = 'command'
    this.log = null
    this.options = null
    this.parser = require('./GetOpt').getInstance
    this.version = '0.0.0'
  }

  checkLog () {
    Assert.isOk(this.log, `No logger defined for ${this.name}`)
  }

  checkOptions () {
    Assert.isOk(this.options, `No options defined for ${this.name}`)
  }

  checkParser () {
    Assert.isOk(this.parser, `No parser defined for ${this.name}`)
  }

  printVersion () {
    this.checkLog()
    this.log.info(`Version ${this.version}`)
  }

  generateHelp () {
    this.checkOptions()
    this.checkLog()
    let help = `Usage of ${this.name}: [options]\nOptions:\n`
    const opts = [...this.options]
    opts.unshift({ definition: '-V, --version', description: 'output version' })
    opts.unshift({ definition: '-h, --help', description: 'output help' })
    for (const opt of opts) {
      let newLine = `  ${opt.definition}`
      while (newLine.length < 25) { newLine = newLine + ' ' }
      newLine = newLine + opt.description
      help = help + `${newLine}\n`
    }
    return help
  }

  printHelp () {
    console.log(this.generateHelp())
  }

  action () {
    this.checkLog()
    this.log.warn(`There is no action defined for this ${this.name}`)
  }

  parse (argv) {
    this.checkParser()
    const opts = (this.parser(argv)).opts()
    if (opts.h || opts.help) {
      return this.printHelp()
    }
    if (opts.V || opts.version) {
      return this.printVersion()
    }
    return Promise.resolve().then(() => { return this.action(opts) })
  }
}
class CommandServer {
  static getInstance () { return new CommandServer() }
  constructor () {
    this.version = '0.0.0'
    this.commands = {}
  }

  setVersion (version) {
    this.version = version
    return version
  }

  addCommand (module, name, command) {
    if (!this.commands[module]) this.commands[module] = {}
    this.commands[module][name] = command
    return name
  }

  getCommand (module, name) {
    Assert.isOk(this.commands[module], `Module ${module} not found`)
    Assert.isOk(this.commands[module][name],
      `Command ${name} not found in ${module}`)
    return this.commands[module][name]
  }

  removeCommand (module, name) {
    if (!this.commands[module]) return false
    delete this.commands[module][name]
    return name
  }

  all () {
    return this.commands
  }

  command (module, name, action, options) {
    if (typeof action === 'object') options = action
    if (!options) options = {}
    options.name = name
    if (!options.action) options.action = action
    const that = this
    const CommandSuper = require('./Command')
    class Command extends CommandSuper {
      constructor () {
        super()
        this.name = name
        this.options = options
        this.version = that.version
      }

      action (opts) {
        return options.action.call(this, opts)
      }
    }
    this.addCommand(module, name, new Command())
    return name
  }

  run (command) {
    // so this is where we would basically parse and run a command artificially
    // but since we dont register all the commands yet like we should this
    // wont quite work right, now this is becoming some sweet api, and i dont
    // think anyone has ever taken this time to really make the cli interface
    // nice thing to use, which in my opinion will help a lot with scripting
    // thought about it some more, so the command line system becomes core
    // sub system which requires all the modules to register their commands with
    // it and then we can introspect and run the commands when needed at which
    // point using this function will be trivial, hold on
    let argv = []
    if (typeof command === 'string') {
      argv = process.argv.slice(0, 2).concat(command.split(' '))
    } else if (command instanceof Array) {
      argv = command
    }
    Assert.isOk(argv instanceof Array && argv.length >= 4,
      `Invalid command ${argv.join(' ')}`)
    return this.getCommand(argv[2], argv[3]).parse(argv)
  }
}
Command.CommandServer = CommandServer
module.exports = Command
