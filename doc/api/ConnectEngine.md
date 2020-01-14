# ConnectEngine
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const ConnectEngine = require('kado/lib/ConnectEngine')
```
This library is used to implement new engines to be used with the Connect
system.

## Class: ConnectEngine

### ConnectEngine.constructor()
* Return {ConnectEngine} new instance of the connect engine

### ConnectEngine.setEngine(instance)
* `instance` {Object} an instance to be used as the instance, possibly some
other library or a middle man to another library.
* Return {Object} the set engine.

### ConnectEngine.resetEngine()
* Return {boolean} `true` after the engine has been set to `null`

### ConnectEngine.checkEngine()

Throws an error when no engine is available and an actionable
method was called against it.

### ConnectEngine.getEngine()
* Return {Object} the currently active engine or `null`
