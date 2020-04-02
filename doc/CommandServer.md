# CommandServer
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const CommandServer = require('kado/lib/CommandServer')
```
This library provides a run time for executing command line style
commands either via API or actual TTY. This makes testing and
programmable usage trivial.

## Class: CommandServer

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
