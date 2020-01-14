# Log
*Introduced in 1.0.0*
> Stability: 2 - Stable
```js
const Log = require('kado/lib/Log')
```
This library provides logging abstraction to use different log transports
for system level log messages.

## Class: Log

### static Log.getInstance()
* Return {Log} new instance of the logger system

### Log.constructor()
* Return {Log} new instance of the logger

### Log.addHandler(name, instance)
* `name` {string} name of the log handler
* `instance` {object} instance of the log handler
* Return {string} name of the log handler added

### Log.getHandler(name)
* `name` {string} name of the log handler to get
* Return {object} the actual log handler

### Log.activateHandler(name)
* `name` {string} name of the handler to activate
* Return {string} name of the activated handler

### Log.allHandlers()
* Return {object} of all the stored 