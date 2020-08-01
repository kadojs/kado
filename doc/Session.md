# Session
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Session = require('kado/lib/Session')
```
The `Session` library provides both the means for creating middleware to load
save and prune sessions. There is also a `SessionStoreMemory` for storing
sessions locally to memory within a single process. As well as a full suite
of `SessionStoreLocal` and `SessionStorage` for implementing a client to server
relationship for saving and restoring sessions.

## Class: Session

### static Session.getMiddleware(options)
* `options` {object} Settings for the session
* Return {function} to be used as middleware for incoming requests.

Available Settings:
* `name` {string} name of the session cookie, defaults to `session`
* `store` {SessionStore} instance of SessionStore used to save session data.

### static Session.generateId(ip, userAgent, secret)
* `ip` {string} The IP address to use for the session.
* `userAgent` {string} The user agent of the session.
* `secret` {string} A string secret to your application used to sign cookies.
* Return {string} sha1 hexadecimal digest of a random timestamp + ip + userAgent

*Internal Use*

### static Session.request(req, res, options)
* `req` {object} HTTP Request object.
* `res` {object} HTTP Response object.
* `options` {object} settings for the session instance see
`Session.getMiddleware()`
* Return {Promise} resolve when the session restore completes.

*Internal Use*

### Session.constructor(sid, ip, agent, uid, store)
* `sid` {string} Session ID string. Must be provided.
* `ip` {string} Remote IP address.
* `agent` {string} Remote User Agent.
* `uid` {string} System user id.
* `store` {SessionStore} Instance of SessionStore to use for saving session
data.
* Return {Session} new session instance

### Session.restore()
* Return {Promise} resolved when the backend storage have loaded the session.

### Session.set(key, value)
* `key` {string} name of the session value
* `value` {mixed} data to save to the session key
* Return {Session} the current instance.

### Session.get(key)
* `key` {string} name of the session value
* Return {mixed} the value of the key or `undefined`

### Session.save()
* Return {Promise} resolved when the backend storage has finished saving.

## Class: SessionStorage

This class provides a server that can be used to store sessions made by the
`SessionStoreLocal` instance.

#### Example Usage

```js
const fs = require('kado/lib/FileSystem')
const Session = require('kado/lib/Session')
const saveFile = fs.path.join(__dirname, '.session.json')
const storage = new Session.SessionStorage({ saveFile: saveFile })
storage.restoreFromDisk()
storage.listen()
```

### static SessionStorage.create(options)
* `options` {object} settings for the `SessionStorage` instance. See
`SessionStorage.constructor()` for more details.
* Return {SessionStorage} instance for use.

### SessionStorage.constructor(options)
* `options` {object} Settings for this instance.
* Return {SessionStorage} new session storage instance.

Available Settings:
* `host` {string} Host to listen on, defaults to `null`
* `port` {string} Port to listen on, defaults to `3001`
* `saveFile` {string} Absolute path to a file to save session data to. Required.
* `saveFrequency` {number} frequency to save to disk in milliseconds, default is
`15000`

### SessionStorage.handleSocket(socket)
* `socket` {net.Socket} a new socket to handle connection for.
* Return {void}

*Internal Use*

### SessionStorage.save(sid, ip, agent, uid, data)
* `sid` {string} session id to save
* `ip` {string} Remote IP address.
* `agent` {string} Remote User Agent.
* `uid` {string} System user id.
* `data` {object} session data to save to sid
* Return {SessionStorage} this instance

*Internal Use*

### SessionStorage.restore(sid)
* `sid` {string} session id to restore
* Return {object} either a blank one or the saved data.

*Internal Use*

### SessionStorage.saveToDisk()
* Return {Promise} resolved with session data disk write completes.

*Internal Use*

### SessionStorage.restoreFromDisk()
* Return {object} the restored session data

Loads the session file synchronously and sets the session data from it.

*Internal Use*

### SessionStorage.clearInterval()
* Return {void}

Stop the storage from saving to disk. Cannot be restarted in this instance.

### SessionStorage.listen(port, host)
* `port` {string} Port to listen on, overrides constructor setting, default
should be `undefined`
* `host` {string} Host to listen on, overrides constructor setting, default
should be `undefined`
* Return {Promise} resolved when the server is ready for connections.

## Class: SessionStore

### SessionStore.constructor()
* `options` {object} SessionStore settings
* Return {SessionStore} new instance

Available Settings:
* `duration` {number} How long should sessions last, default `21600000` or
6 hours.
* `pruneFrequency` {number} How often to prune sessions that are expired.
Default `60000` or 1 minute.

### SessionStore.save(sid, ip, agent, uid, data)
* `sid` {string} the id of the session to save
* `ip` {string} Remote IP address.
* `agent` {string} Remote User Agent.
* `uid` {string} System user id.
* `data` {object} the data of the session to save
* Return {void}

This method must be extended and will error otherwise.

### SessionStore.restore(sid)
* `sid` {string} the id of the session to restore
* Return {void}

This method must be extended and will error otherwise

### SessionStore.prune()
* Return {void}

This method must be extended and will error otherwise.
Also, it the storage mechanism must decide on a method for pruning.

## Class: SessionStoreLocal

### SessionStoreLocal.constructor(options)
* `options` {object} Settings for this store instance
* Return {SessionStoreLocal} new instance

Available Settings:
* `host` {string} Host to connect to, defaults to `localhost`
* `port` {string} Port to connect on, defaults to `3001`
* Settings from `SessionStore.constructor()`

### SessionStoreLocal.save(sid, ip, agent, uid, data)
* `sid` {string} the session id to save
* `ip` {string} Remote IP address.
* `agent` {string} Remote User Agent.
* `uid` {string} System user id.
* `data` {object} the session data to save
* Return {Promise} resolved when the `SessionStorage` server has completed the
request.

### SessionStoreLocal.restore(sid)
* `sid` {string} the session id to restore
* Return {Promise} resolved when the `SessionStorage` server responds to the
request. The promise will return an `{object}` with the session data.

### SessionStoreLocal.prune()
* Return {number} total number of pruned entries.

This method uses the duration and timestamps on the session data to prune the
records.

## Class: SessionStoreMemory

### SessionStoreMemory.constructor(options)
* `options` {object} Settings for this store instance
* Return {SessionStoreMemory} new instance

Available Settings:
* Settings from `SessionStore.constructor()`

### SessionStoreMemory.save(sid, ip, agent, uid, data)
* `sid` {string} the session id to save
* `ip` {string} Remote IP address.
* `agent` {string} Remote User Agent.
* `uid` {string} System user id.
* `data` {object} the session data to save
* Return {Promise} resolved when the session save completes.

### SessionStoreMemory.restore(sid)
* `sid` {string} the session id to restore
* Return {Promise} resolved when the session data has been restored. The promise
will be resolved with an {object} containing the session data.

### SessionStoreMemory.prune()
* Return {number} total number of pruned entries.

This method uses the duration and timestamps on the session data to prune the
records.

## Class: SessionStoreModel

### static SessionStoreModel.fieldList()
* Return {Object} field definitions for the model

### static SessionStoreModel.createTable()
* Return {Schema} used to create a table.

### static SessionStoreModel.insert(fields)
* `fields` {Array} of field names to insert
* Return {Query} insert query ready for values

### static SessionStoreModel.update(fields)
* `fields` {Array} of field names to insert
* Return {Query} update query ready for values

### static SessionStoreModel.byId(id)
* Return {Query} to find session by id

### static SessionStoreModel.bySid(sid)
* Return {Query} to find session by sid (session id)

### static SessionStoreModel.pruneSession(boundary)
* `boundary` {Date} entries updated prior to this are removed.
* Return {Query} used to delete old session

## Class: SessionStoreSQL

### SessionStoreSQL.constructor(options)
* `options` {object} Settings for this store instance
* Return {SessionStoreMemory} new instance

Available Settings:
* Includes the settings from `SessionStore.constructor()`
* `db` {DatabaseEngine} The underlying database engine to use such as mysql2
* `model` {Model} The session model used to build queries.

### SessionStoreSQL.save(sid, ip, agent, uid, data)
* `sid` {string} the session id to save
* `ip` {string} Remote IP address.
* `agent` {string} Remote User Agent.
* `uid` {string} System user id.
* `data` {object} the session data to save
* Return {Promise} resolved when the session save completes.

### SessionStoreSQL.restore(sid)
* `sid` {string} the session id to restore
* Return {Promise} resolved when the session data has been restored. The promise
will be resolved with an {object} containing the session data.

### SessionStoreSQL.prune()
* Return {number} total number of pruned entries.

This method uses the duration and timestamps on the session data to prune the
records.
