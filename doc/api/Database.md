# Database
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Database = require('kado/lib/Database')
```
This library manages Database connections that are stored through
instances registered to this library.

## Class: Database

### static Database.getInstance()
* Return {Database} new instance of the database system

### Database.constructor()
* Return {Database} new instance of the database system

### Database.addDatabase(name, instance)
* `name` {string} name of the database instance eg: `mysql`
* `instance` {object} actual database connection instance
* Return {object} instance of the new database connection

### Database.removeDatabase(name)
* `name` {string} name of the database connection to remove from management
Return {string} name of the database connection removed

### Database.queryOptions(config, profiler)
* `config` {object} current system configuration to check for `{dev: true}`
* `profiler` {Profiler} instance of the Profiler sub system
* Return {object} options to be sent to a database query

### Database.connect(name)
* `name` {string} name of the database connection to connect to using the
connections `connect()` method.
* Return {Promise} that is resolved when the connection completes.

Note: when no `name` is provided all connections will be executed.

### Database.close(name)
* `name` {string} of a connection to be closed.
* Return {boolean} `true` when the connection is closed.

Note: when no `name` is provided all connections will be closed.
