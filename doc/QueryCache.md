# QueryCache
*Introduced in 4.2.0*
> Stability: 2 - Stable
```js
const QueryCache = require('kado/lib/QueryCache')
```
The Kado Query Cache system is for use with SQL based systems and will
generate unique keys against queries and store them for quick reads over a
chosen period.

This method of caching greatly reduces load on frequently used queries where the
output does not change. Expensive display queries should always look at this as
an option. The nature of this caching system is much more predictable than the
built into MySQL and deprecated query_cache there.

## Class: QueryCache

### static QueryCache.generateKey(sql, values, options)
* `sql`
* `values`
* `options`
* Return {string} hexadecimal SHA1 hash of the input

### static QueryCache.getInstance(options)
* `options`
* Return {QueryCache} instance

### QueryCache.constructor(options)
* `options`
* Return {QueryCache} instance

### QueryCache.getModel()
* Return {Model} the provided QueryCache model.

### QueryCache.read(key)
* `key`
* Return {Promise} resolve when cache read is complete

### QueryCache.write(key, value, ttl)
* `key`
* `value`
* `ttl`
* Return {Promise} resolved when cache read is complete

### QueryCache.execute(sql, values, options)
* `sql`
* `values`
* `options`
* Return {Promise} resolved when database query and cache write or cache read is
complete.

### QueryCache.prune()
* Return {Promise} resolved when cache prune completes.

### QueryCache.flush()
* Return {Promise} resolved when query cache flush finishes.
