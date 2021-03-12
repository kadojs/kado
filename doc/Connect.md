# Connect
*Introduced in 3.0.0 as Connector*
*Renamed to Connect in 4.0.0*
> Stability: 2 - Stable
```js
const Connect = require('kado/lib/Connect')
```
This library is the repository for registering external connectors
into a Kado System.

## Class: Connect

### static Connect.each(that, name, options, method)
* `that` {Connect} context to execute against should be instance of Connect
* `name` {string} filter engines by this name for action
* `options` {object} options object passed to engines for method
* `method` {string} name of the method that should exist on the Connect instance

Note: will throw an error when either the input is incomplete or the methods
cannot be called.

### static Connect.getInstance()
* Return {Connect} new instance of the connector

### Connect.constructor()
* Return {Connect} new instance of the Connect system

### Connect.addEngine(name, instance)
* `name` {string} name of the connector
* `instance` {object} instance of the new connector to access
* Return {object} the instance added to the system

### Connect.checkEngine(name)
* `name` {string} name of the engine
* Return {boolean} `true` when the engine is registered and available

### Connect.activateEngine(name)
* `name` {string} name of the engine
* Return {ConnectEngine} the new active engine

### Connect.deactivateEngine()
* Return {boolean} `true` and the `activeEngine` value is returned to `null`

### Connect.getActiveEngine()
* Return {ConnectEngine} the active engine for `null` when none

### Connect.getEngine(name)
* `name` {string} name of the engine
* Return {ConnectEngine} the requested engine or false when no engine exists

### Connect.removeEngine(name)
* `name` {string} name of the engine
* Return {boolean} `true` when the engine by `name` is removed

### Connect.allEngines()
* Return {object} registered engines

### Connect.listEngines()
* Return {Array} list of engine names registered

### Connect.eachEngine(fn)
* `fn` {Function} called fn(engine) where engine is used to do an action, and
 can return a promise.
* Return {Promise} each engine has the `fn(engine)` executed serially.

## Class: ConnectEngine

Used to manage multiple Connect engines.

### ConnectEngine.constructor()
* Return {ConnectEngine} new instance of the connect engine

### ConnectEngine.setEngine(instance)
* `instance` {Object} an instance to be used as the instance, possibly some
other library or a middle man to another library.
* Return {Object} the set engine.

### ConnectEngine.resetEngine()
* Return {boolean} `true` after the engine has been set to `null`

### ConnectEngine.checkEngine()

Throws an error when no engine is available.
Or no actionable method passed.

### ConnectEngine.getEngine()
* Return {Object} the currently active engine or `null`
