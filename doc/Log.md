# Log
*Introduced in 1.0.0*
> Stability: 2 - Stable
```js
const Log = require('kado/lib/Log')
```
This library provides logging abstraction to use different log transports
for system level log messages.

## Class: Log
`Log` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.

This is the log multiplexer to hold engines such as the LogEngine.

It only exposes ConnectEngine methods.

## Class: LogEngine
`Log` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static LogEngine.appendFile(path, data)
* `path` {string} the path of the file to append text to
* `data` {string} the data to append to the file
* Return {string} the `data` appended to the file

### static LogEngine.tailFile(path, lineCount, options)
* `path` {string} the path to the file to tail
* `lineCount` {number} number of lines to take from the file.
* `options` {Object} options passed to FileByLine, see below.
* Return {string} last n lines from the specified file.

### static LogEngine.getInstance()
* Return {Log} new instance of the logger system

### LogEngine._read ()
Underlying stream read method for Stream.readable.

*Internal Use*

### LogEngine.getDate(now)
* `now` {Date} the current date.
* Return {String} date string to add to the log message

*Internal Use*

### LogEngine.message (level, msg, opts)
* `level` {Object} the level of severity for the message
* `msg` {String} the message to print
* `opts` {Object} options to control messaging
* Return {void}

Pushes the newly formed message into the stream.

*Internal Use*

### LogEngine.error (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### LogEngine.warning (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### LogEngine.info (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### LogEngine.verbose (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### LogEngine.debug (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### LogEngine.extra (msg, opts)
* `msg` {String} message to print
* `opts` {Object} options to control messaging
* Return {void}

Makes use of the `Log.message` method to send the log message.

### LogEngine.dump (msg)
* `msg` {Mixed} message to print
* Return {void}

Makes use of the `Log.message` method to send the log message.

This method does not wrap the message with any status information.

### LogEngine.constructor()
* Return {Log} new instance of the logger

## Class FileByLine

Based on: https://github.com/nacholibre/node-readlines

Read a file by lines.

### FileByLine.constructor(options)
* `options` {Object} options to control the file processing.
* Return {FileByLine} new instance

Available Options
* `readChunk` {number} size of the read buffer in bytes
* `newLineCharacter` {string} which type of newline to use, defaults to `\n`

### FileByLine.next()
* Return {string} next line of the file until EOF which returns null

Example Usage
```js
const fd = new FileByLine(path, options)
let line; const lines = []
while ((line = fd.next())) lines.push(line)
```
