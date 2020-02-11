# History
*Introduced in 3.0.0 as Breadcrumb*
*Renamed to History in 4.0.0*
> Stability: 2 - Stable
```js
const History = require('kado/lib/History')
```
This library provides user location tracking as they navigate the application
and is useful for building breadcrumb services for preloading the browser
local storage.

NOTE: This class requires session storage to be provided by the HyperTextEngine
for use in the web server.

## Class: History

### static History.getInstance()
* Return {History} new instance of the history system

### History.constructor()
* Return {History} new instance of the history system

### History.all()
* Return {Array} containing the last history

### History.add(uri, name, icon)
* `uri` {string} URI or path of the location
* `name` {string} name of the location
* `icon` {string} option name of the icon to be displayed for use in the browser
* Return {object} new object containing the added history

### History.save(req)
* `req` {Request} object from the HyperTextEngine
* Return {undefined}

Saves the current history to the session is available through {req.session}

### History.restore(req)
* `req` {Request} object from the HyperTextEngine
* Return {undefined}

Restores the saves history from the session

### History.middleware(app, req)
* `app` {Kado} Instance of the kado system
* `req` {Request} object from the HyperTextEngine
Return {Array} current history list

This middleware helper automatically reads incoming URIs and checks them against
registered navigation entries to create a fancy history. Ignores non user
friendly urls.

It also helps with the save and restoration through the session.
