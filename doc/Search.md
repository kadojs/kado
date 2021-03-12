# Search
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Search = require('kado/lib/Search')
```
This library provides engine driven search that can be implemented by modules
directly or by other providers.

## Class: Search
`Search` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static Search.getInstance()
* Return {Search} new instance of the Search system

### Search.constructor()
* Return {Search} new instance of the Search system

## Search.byPhrase(app, phrase, options)
* `app` {Object} current application such as a Kado system
* `phrase` {string} user input to search for
* `options` {object} containing the search parameters
Return {Promise} that resolves when the search is complete.

Note: when no `name` is provided all handlers are executed.

## Class: SearchEngine
`SearchEngine` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.

### SearchEngine.search()
Must be extended and used to send to underlying search system.
