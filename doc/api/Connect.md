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

### Connect.getEngine(name)
* `name` {string} name of the engine
* Return {ConnectEngine} the requested engine or false when no engine exists

### Connect.removeEngine(name)
* `name` {string} name of the engine
* Return {boolean} `true` when the engine by `name` is removed

### Connect.all()
* Return {object} registered engines

### Connect.list()
* Return {Array} list of engine names registered

### Connect.each(fn)
* `fn` {Function} called fn(engine) where engine is used to do an action, and
 can return a promise.
* Return {Promise} each engine has the `fn(engine)` executed serially.

### Connect.connect(name, options)
* `name` {string} name of the engine to connect
* `options` {object} options to be passed to the engine
* Return {Promise} to be resolved when the engine connects

This relies on the connector implementing a `connect()` method that returns
a Promise.

When no `name` is provided all connectors are connected.

### Connect.close(name)
* `name` {string} name of the engine to close
* Return {Promise} to be resolved when the engine closes.
