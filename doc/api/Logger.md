# Logger
*Introduced in 1.0.0*
> Stability: 2 - Stable
```js
const Logger = require('kado/lib/Logger')
```
This library provides logging abstraction to use different log transports
for system level log messages.

## Class: Logger

### static Logger.getInstance()
* Return {Logger} new instance of the logger system

### Logger.constructor()
* Return {Logger} new instance of the logger

### Logger.addHandler(name, instance)
* `name` {string} name of the log handler
* `instance` {object} instance of the log handler
* Return {string} name of the log handler added

### Logger.getHandler(name)
* `name` {string} name of the log handler to get
* Return {object} the actual log handler

### Logger.activateHandler(name)
* `name` {string} name of the handler to activate
* Return {string} name of the activated handler

### Logger.allHandlers()
* Return {object} of all the stored 