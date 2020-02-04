# Profiler
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Router = require('kado/lib/Router')
```
The Router library provides assistance for matching paths or URIs to real locations within the system.
### static router.getInstance()
* Return {router} new instance of the router system

### Router.constructor()
* Return {router} new instance of the router system

### Router.use(fn)
* `fn` {function} function to be called as middleware and should return a
 Promise.
* Return {void}

Add middleware to the system to be executed before the route is called.

### Router.unuse(fn)
* `fn` {function} of middleware to be removed.
* Return {boolean} `true` when middleware is found and removed otherwise `false`

### Router.final(fn)
* `fn` {function} of final handler to be added.
* Return {void}

Replaces the final handler with this function. By default the final handler is a
noop function.

### Router.add(method, uri, fn)
* `method` {string} HTTP verb for the route to be invoked on
* `uri` {string} URI matching the route, special patterns are allowed.
* `fn` {function} A function to be called by the route which should return a
 Promise.
* Return {object} the newly added route

Adds a new route to the system with the specified handler.

### Router.update(method, uri, fn)
* `method` {string} the method of the route
* `uri` {string} the uri of the route to modify
* `name` {string} new name for pre-existing route
* Return {string} with the updated URI

### Router.remove(method, uri)
* `method` {string} the method of the route
* `uri` {string} the uri of the route to remove
* Return {boolean} `true` when a route is matched and deleted, otherwise `false`

### Router.get(method, uri, params)
* `method` {string} the method of the route
* `uri` {string} the uri of the route to get
* `params` {object} blank object to be populated by found path keys
* Return {object} when a route is found, otherwise {boolean} `false`

### Router.callMiddleware(req, res, middlewareKeys)
* `req` {Request} HTTP Request object
* `res` {Response} HTTP Response object
* `middlewareKeys` {Array} of middleware left to be called
* Return {Promise} resolved when all middlewareKeys are depleted

*Internal Use*

### Router.request(req, res)
* `req` {Request} HTTP Request object
* `res` {Response} HTTP Response object
* Return {Promise} resolved when all middleware, route, and optional final
handler have been executed.

This method is typically invoked by the `HyperTextServer.onRequest()` method.

### Router.all()
* Return {object} all routes

### Router.allForTemplate(replaceSplashes)
* `replaceSplashes` {boolean} changes the slashes to underscores
* Return {object} compilation of all registered routes
