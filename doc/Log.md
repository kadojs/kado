# Log
*Introduced in 1.0.0*
> Stability: 2 - Stable
```js
const Log = require('kado/lib/Log')
```
This library provides logging abstraction to use different log transports
for system level log messages.

## Class: Log
`Log` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static Log.appendFile(path, data)
* `path` {string} the path of the file to append text to
* `data` {string} the data to append to the file
* Return {string} the `data` appended to the file

### static Log.tailFile(path)
* `path` {string} the path to the file to tail
* `lineCount` {number} number of lines to take from the file.
* Return {string} last n lines from the specified file.

### static Log.getInstance()
* Return {Log} new instance of the logger system

### Log._read ()
Underlying stream read method for Stream.readable.

*Internal Use*

### Log.getDate(now)
* `now` {Date} the current date.
* Return {String} date string to add to the log message

*Internal Use*

### Log.message (level, msg, opts)
* `level` {Object} the level of severity for the message
* `msg` {String} the message to print
* `opts` {Object} options to control messaging
* Return {void}

Pushes the newly formed message into the stream.

*Internal Use*

### Log.error (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### Log.warning (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### Log.info (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### Log.verbose (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### Log.debug (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### Log.extra (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### Log.dump (msg)
* `msg` {Mixed} message to print
* Return {void}

Makes use of the `Log.message` method to send the log message.

This method does not wrap the message with any status information.

### Log.constructor()
* Return {Log} new instance of the logger

## Class: LogEngine
`LogEngine` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.
