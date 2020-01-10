# Connector
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Connector = require('kado/lib/Connector')
```
This library is the repository for registering external connectors
into a Kado System.

## Class: Connector

### static Connector.getInstance()
* Return {Connector} new instance of the connector

### Connector.constructor()
* Return {Connector} new instance of the connector

### Connector.addConnector(name, instance)
* `name` {string} name of the connector
* `instance` {object} instance of the new connector to access
* Return {object} the instance added to the system

### Connector.removeConnector(name)
* `name` {string} name of the connector
* Return {string} name of the connector removed.

### Connector.connect(name)
* `name` {string} name of the connector to connect
* Return {Promise} to be resolved when the connector connects

This relies on the connector implementing a `connect()` method that returns
a Promise.

When no `name` is provided all connectors are connected.

### Connector.close(name)
* `name` {string} name of the connector to close
* Return {boolean} `true` when the connector is closed.
