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

### Connect.each(fn)
* `fn` {Function} called fn(engine) where engine is used to do an action, and
 can return a promise.
* Return {Promise} each engine has the `fn(engine)` executed serially.

### Connect.connect(name, options)
* `name` {string} optional name of the engine to connect
* `options` {object} options to be passed to the engine
* Return {Promise} to be resolved when the engine connects

This relies on the connector implementing a `connect()` method that returns
a Promise.

When no `name` is provided all engines are connected.

### Connect.close(name)
* `name` {string} name of the engine to close
* Return {Promise} to be resolved when the engine closes.

### Connect.start(name, options)
* `name` {string} optional name of the engine to start
* `options` {object} options to be passed to the engine
* Return {Promise} to be resolved when the engine starts

This relies on the connector implementing a `start()` method that returns
a Promise.

When no `name` is provided all engines are started.

### Connect.close(name)
* `name` {string} optional name of the engine to close
* Return {Promise} to be resolved when the engine closes.

When no `name` is provided all engines are started.
