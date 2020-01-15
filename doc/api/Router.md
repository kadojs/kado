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

### Router.add(name, uri)
* `name` {string} name of the route
* Return {string} URI

### Router.update(name, uri)
* `name` {string} new name for pre-existing route
* Return {string} with the updated URI

### Router.remove(name)
* `name` {string} name of the route you want to remove
* Return the route name you removed when successful

### Router.get(name)
* `name` {string} name of the route you want to get
* Throws an ERROR if the route name you passed does't exist
* Return {string} route name


### Router.method(method, path)
* `method` {string} HTTP METHOD
* `path` {string} path URI of the route
* Return {string} the path that you passed it


### Router.p(name, uri)
* `name` {string} name of the route
* `uri` {string} uri path 
* Return {string} name of route

### Router.all()
* Return {object} all routes

### Router.allForTemplate(replaceSplashes)
* `replaceSplashes` {boolean} changes the slashes to underscores
* Return {object} compilation of all registered routes