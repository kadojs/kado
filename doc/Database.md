# Database
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Database = require('kado/lib/Database')
```
This library manages Database connections that are stored through
instances registered to this library.

## Class: Database
`Database` extends `Connect` see [Connect](Connect.md) for more engine
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

## Class: DatabaseEngine
`DatabaseEngine` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.

### DatabaseEngine.connect()
Must be extended and used to connect to underlying database.

### DatabaseEngine.close()
By default will try and call `engine.close()` and then call
`ConnectEngine.resetEngine()`. Which should be sufficient for most underlays.

## Class: DatabaseMySQL
`DatabaseMySQL` extends `DatabaseEngine` extends `ConnectEngine` and implements
a relationship with the JavaScript `mysql2` driver available on NPM and Github.

See the [mysql2 package](https://github.com/sidorares/node-mysql2)

To use this engine it should be required at application startup. Example:
```js
const app = require('kado').getInstance()
const MySQL = require('kado/lib/Database').MySQL
const mysqlConfig = { host: 'localhost', user: 'test', database: 'test' }
app.database.addEngine('mysql', new MySQL(mysqlConfig))
```

### DatabaseMySQL.constructor(options)
* `options` {Object} containing connection options.
* Return {DatabaseMySQL} new driver instance ready to be passed to the
`app.database.addEngine()` call.

The currently supported options are:

* `host` {string} hostname of the database server, default `localhost`
* `user` {string} the username used to identify the connection
* `password` {string} the password used to authenticate the connection
* `database` {string} the database desired to select after connecting
* `driver` {string} the driver to use available choices are: mysql2, mariadb

Timezone is forced to UTC because that's the only way DATE/DATETIME/TIMESTAMP
values can ever work correctly and predictably. Uses the connection option
`timezone: 'Etc/GMT0'` and one time on-connect query `SET time_zone='+00:00';`
per connection.
