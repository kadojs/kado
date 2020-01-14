# Database
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Database = require('kado/lib/Database')
```
This library manages Database connections that are stored through
instances registered to this library.

## Class: Database
`Database` extends `Connect` see [Connect.md](./Connect.md) for more engine
management and more.

### static Database.queryOptions(config, profiler)
* `config` {object} application config looking for `{dev: {boolean}}`
* `profiler` {Profiler} profiler instance to call against
* Return {object} options safe with use building queries

### static Database.getInstance()
* Return {Database} new instance of the database system

### Database.constructor()
* Return {Database} new instance of the database system

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

## Class DatabaseEngine
`DatabaseEngine` extends `ConnectEngine` see
[ConnectEngine.md](./ConnectEngine.md) for more engine management and more.

### DatabaseEngine.connect()
Must be extended and used to connect to underlying database.

### DatabaseEngine.close()
By default will try and call `engine.close()` and then call
`ConnectEngine.resetEngine()`. Which should be sufficient for most underlays.
