# Log
*Introduced in 1.0.0*
> Stability: 2 - Stable
```js
const Log = require('kado/lib/Log')
```
This library provides logging abstraction to use different log transports
for system level log messages.

## Class: Log
`Log` extends `Connect` see [Connect.md](./Connect.md) for more engine
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

### Log.constructor()
* Return {Log} new instance of the logger

## Class: LogEngine
`LogEngine` extends `ConnectEngine` see
[ConnectEngine.md](./ConnectEngine.md) for more engine management and more.
