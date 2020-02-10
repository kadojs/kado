# Application
*Introduced 4.0.0*
> Stability: 2 - Stable
```js
const Application = require('kado/lib/Application')
```
The `Application` library provides an interface meant to make use of the Kado
libraries in a system form.

## Class: Application

### static Application.getInstance(name)
* `name` {string} name identifying the instance, defaults to `main`
* Return {Application} a new application instance for use.

### Application.constructor()
* Return {Application} a new application instance for use.

### Application.setConfig(cfg)
* `cfg` {object} new config, can be set multiple times and will merge into
existing.
* Return {Application} this instance

### Application.setName(name)
* `name` {object} update the instance name of the application
* Return {Application} this instance

### Application.setTrustProxy(trustProxy)
* `trustProxy` {boolean} Whether or not to use the X-Forwarded-For header when
setting `req.ip` on `HyperTextServer` connections.
* Return {Application} this instance

### Application.setVersion(version)
* `version` {string} the version of the current application
* Return {Application} this instance


### Application.addModules(mod)
* `mod` {Module} instance of the module to be added
* Return {Application} this instance

Adds a new module to the system.

### Application.getModule(name)
* `name` {string} name of the module to retrieve
* Return {Module} instance of the found module or `false` if not found.

Get a module by name if it exists.

### Application.removeModule(name)
* `name` {string} name of the module to remove.
* Return {Module} instance of removed module or `false` if not found.

Remove a module by name if it exists.

### Application.lib(name)
* `name` {string} name of the library to require.
* Return {Object} required contents of searched library by `name`

Note: this will require the library and fail if it doesnt exists. Use
`app.library.search(name)` to check for a libraries existence.

### Application.start(argv)
* Return {Promise} resolved when application is ready for use.

This will setup and connect sub systems, then check for a command to execute,
tests to run, or will default to starting any http servers.

### Application.listen()
* Return {Promise} resolved when all servers are listening.

Note: When the application is `started` only connectors are setup. This method
must be called to listen on ports. This is by design to support cleaner
initialization for scripting.

### Application.stop()
* Return {Promise} resolved when application is shutdown.

This will stop listening of any servers, disconnect sub systems and close
connections.

### Application.getDefaultConfig()
* Return {Object} default application configuration.

*Internal Use*

### Application.setupMode()
* Return {void}

*Internal Use*

### Application.setupPaths()
* Return {void}

*Internal Use*

### Application.setupLog()
* Return {void}

*Internal Use*

### Application.setupLibrary()
* Return {void}

*Internal Use*

### Application.setupConnect()
* Return {void}

*Internal Use*

### Application.setupDatabase()
* Return {void}

*Internal Use*

### Application.setupEmail()
* Return {void}

*Internal Use*

### Application.setupEvent()
* Return {void}

*Internal Use*

### Application.setupHyperText()
* Return {void}

*Internal Use*

### Application.setupLanguage()
* Return {void}

*Internal Use*

### Application.setupView()
* Return {void}

*Internal Use*

### Application.setup()
* Return {Application} this instance

Calls the above listed setup functions.

*Internal Use*

### Application.startConnect()
* Return {Promise} resolved when the Connect and Database systems have
connected.

*Internal Use*

### Application.stopConnect()
* Return {Promise} resolved when the Database and Connect system have
disconnected.

*Internal Use*

### Application.test(argv)
* `argv` {Array} arguments send to the system
* Return {Promise} resolved when testing is complete.

*Internal Use*

### Application.command(argv)
* `argv` {Array} arguments send to the system
* Return {Promise} resolved when command is complete or `false` if no command is
executed.

*Internal Use*

### Application.startServer()
* Return {Promise} resolved when all HTTP engines are listening.

*Internal Use*

### Application.stopServer()
* Return {Promise} resolved when all HTTP engines are closed.

*Internal Use*
