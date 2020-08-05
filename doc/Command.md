# Command
*Introduced in 4.0.0*
> Stability: 2 - Stable

The `Command` library provides a set of methods for building
and executing a basic CLI utility. Which can be ran programatically
through the `parse()` method.

```js
const { Command } = require('kado')
```

## Class Command

This class is a super class that is extended by the command section
within the `Application` core object. Let us take a look at that usage snippet.

```js
const CommandSuper = require('./Command')
class Command extends CommandSuper {
  constructor () {
    super()
    this.name = name
    this.options = options
    this.version = that.version
  }
  action (opts) {
    return options.action.call(this,opts)
  }
}
this.commands[module][name] = new Command()
```

When the child Command class is setup it presets the options and version
which could be defined in a number of ways.

* `options` {object} containing command flags and other options
* `version` {string} Semver style string to denote version eg `1.0.0`

Now take a look at an actual options object.

```js
const options = {
  description: 'Some command description',
  options: [
    { definition: '-s, --something <s>', description: 'Some thing' }
  ],
  action: (opts) => {
    return Promise.resolve(opts)
  }
}
```

* `description` is used to print the help.
* `options` contains the actual flags.
  * `{definition: 'cli flags', description: 'flag description'}` used to print
  help and parse entries.
* `action` {Function} taking `opts` being parsed CLI arguments and their values
  and returning an optional {Promise} that resolves when the command action is
  complete.

### Command.constructor()
* Return {Command} Construct a new instance of the Command library.

### Command.checkLog()
* Return {undefined}

Throws an error when the logger has not been defined.

### Command.checkOptions()
* Return {undefined}

Throws an error when the options have not been defined.

### Command.checkParser()
* Return {undefined}

Throws an error when the parser has not been defined.

### Command.printVersion()
* Return {undefined}

Prints the current version of the program through the `log.info()` method.

### Command.generateHelp()
* Return {string} ready to print help menu

### Command.printHelp()
* Return {undefined}

Uses `console.log()` to display the output of `generateHelp()`

### Command.action()
* Return {undefined}

Skeleton function meant to be overridden by the actual command and will throw
an error if it still exists.

### Command.parse(argv)
* `argv` {Array} command line arguments one per array entry
* Return {Promise} the promise will complete when the `action()` call completes.

## Class: CommandServer

CommandServer provides a run time for executing command line style
commands either via API or actual TTY. This makes testing and
programmable usage trivial.

### static CommandServer.getInstance()
* Return {CommandServer} new instance of the server

### CommandServer.constructor()
* Return {CommandServer} new instance of the server

### CommandServer.setVersion(version)
* `version` {string} set the version of the server.
* Return {string} the `version` passed

### CommandServer.addCommand(module, name, command)
* `module` {string} name of the module
* `name` {string} name of the command
* `command` {Command} instance of `Command` to be used.
* Return {string} name of the command added.

### CommandServer.getCommand(module, name)
* `module` {string} name of the module
* `name` {string} name of the command
* Return {object} when command is found
Throws an Error when no command or module are found.

### CommandServer.removeCommand(module, name)
* `module` {string} name of the module
* `name` {string} name of the command
Return {string} name of the command requested for removal.

### CommandServer.all()
* Return {object} list of registered commands.

### CommandServer.command(module, name, options)
* `module` {string} name of the module
* `name` {string} name of the command
* `options` {object} description, flags and action for the command
* Return {string} name of the command added.

This actually uses the `Command` library to setup the new command
based on the options and is a shortcut for.

```js
CommandSerer.addCommand('someModule','someCommand',new Command())
```

### CommandServer.run(command)
* `command` {string|array} String containing command or Array of argv.
* Return {Promise} that will be resolved when the action command completes.
