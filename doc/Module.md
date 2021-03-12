# Module
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Module = require('kado/lib/Module')
```
This `Module` library is a super class for creating modules for use
with Kado systems.

## Class: Module

### Module.constructor()
* Return {Module} new instance of a module

### Module.db(app)
* `app` {Application} instance of Application
* Return {void}

This function is called by Application on startup to register models or structures.

### Module.search(app, keywords, start, limit)
* `app` {Application} instance of Application
* `keywords` {Array} array of keywords that are searched
* `start` {number} offset to display results from
* `limit` {number} of results to display
* Return {Promise} resolved with results

This function is called by Application when a search is queried.

### Module.main(app)
* `app` {Application} instance of Application
* Return {void}

This function is called by Application before starting the main interface.

### Module.cli(app)
* `app` {Application} instance of Application
* Return {void}

This function is called by Application when setting up cli modules.
