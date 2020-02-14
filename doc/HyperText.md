# HyperText
*Introduced in 4.0.0*
> Stability: 1 - Experimental
```js
const HyperText = require('kado/lib/HyperText')
```
This library provides an abstraction layer for use with Kado system that
provides the framework for multiple web servers to register for live I/O use
within the system.

There is a `HyperTextEngine` library that provides the needed implementation to
setup traditional web servers into this abstraction layer.

## Class: HyperText
`HyperText` extends `Connect` see [Connect.md](./Connect.md) for more engine
management and more.

### static HyperText.getInstance()
* Return {HyperText} new web server abstraction instance

### HyperText.start(port, host)
* `port` {number} Port from 1 - 65536 to start the server on.
* `host` {string} Hostname or IP address to listen on. {null} will listen on all
* Return {Promise} resolved when the active engine starts

### HyperText.stop()
* Return {Promise} resolved when the active engine stops

## Class: HyperTextEngine
`HyperTextEngine` extends `ConnectEngine` see
[ConnectEngine.md](./ConnectEngine.md) for more engine management and more.

### HyperTextEngine.start()
Must be extended and used to start the underlying server.

### HyperTextEngine.stop()
Must be extended and used to stop the underlying server.

## Class: HyperTextServer
`HyperTextServer` extends `HyperTextEngine` and provides a complete
HTTP web server for use with `Application`

### static HyperTextServer.finalHandler(req, res)
* `req` {Request} HTTP Request object
* `res` {Response} HTTP Response object
* Return {void}

Default finalHandler route.

*Internal Use*

### HyperTextServer.constructor()
* Return {HyperTextServer} instance for use.

### HyperTextServer.setHost(host)
* `host` {string} or `null`, host to listen on such as `localhost` or
`127.0.0.1`.
* Return {HyperTextServer} this instance

### HyperTextServer.setPort(port)
* `port` {number} the port for the server to listen on by default uses `3000`
* Return {HyperTextServer} this instance

### HyperTextServer.setSSL(ssl)
* `ssl` {object} containing properties `key` and `cert` which should be `Buffer`
objects read from sources. Otherwise, it takes `pfx` and `passphrase` to use a
secured certificate where `pfx` is a `Buffer` and `passphrase` is a `String`.
* Return {HyperTextServer} this instance

### HyperTextServer.createServer(router)
* `router` {Router} a Kad Router instance used to route requests.
* Return {HyperTextServer} this instance

Use to create the actual underlying HTTP server after all settings have been
applied.

Will then set the provided router using the `setRouter(router)` method below.

### HyperTextServer.setRouter(router)
* `router` {Router} a Kad Router instance used to route requests.
* Return {HyperTextServer} this instance

This is typically called by `Application` during `setupHyperText()`

*Internal Use*

### HyperTextServer.getRouter()
* Return {Router} the set router instance or throws an error.

### HyperTextServer.onRequest(req, res)
* `req` {Request} HTTP Request object
* `res` {Response} HTTP Response object
* Return {Promise} resolved when the request has been fully handled by the
router and its registered handlers.

This method is set to the `request` event the server generates.

*Internal Use*

## Class: StaticServer

Provides a basic static file server to be used as middleware.

### static StaticServer.getMiddleware (root, options)
* `root` {string} Root folder to serve paths from
* `options` {object} Containing optional settings.
* Return {function} that can be used as middleware that interacts with
an instance of `StaticServer` instantiated with `root` and `options`.

### StaticServer.constructor(root, options)
* `root` {string} Root folder to serve paths from
* `options` {object} Containing optional settings.
* Return {StaticServer} new instance

### StaticServer.resolve(url)
* `url` {string} url or `uri` to be appended to `root` to make a path.
* Return {string} the newly joined path.

### StaticServer.request(req, res)
* `req` {Request} An HTTP Request object.
* `res` {Response} An HTTP Response object.
* Return {Promise} resolved when either a file is found or the stack should
continue.