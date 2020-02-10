# Mapper

> Stability: 2 - Stable
```js
const Mapper = require('kado/lib/Mapper')
```
The `Mapper` library provides a functional interface for Object handling.

## Class: Mapper
Mapper is a general-purpose Object handling toolkit.  Some functions are
[static](#static-stateless-functions) and may be used as shortcuts rather than
creating a full instance.

### `static Mapper.getInstance (data)`
* _Options same as [main constructor, below](#mapperconstructordata)_
* Returns: {Mapper} new instance of `Mapper`

### `Mapper.constructor (data)`
* `data` {Object} optional data to populate
* Returns: {Mapper} new instance of `Mapper`

Instantiates a new empty `Mapper` instance, optionally populated with `data`

### `Mapper.merge (data)`
* `data` {Object} optional data to populate
* Returns: {Mapper} the same as the called `Mapper`, for chaining

### `Mapper.get (key)`
* `key` {mixed} path to requested data (see
  [parseKey](#static-mapperparsekey-key) for valid types)
* Returns: {mixed} data from key location

### `Mapper.set (key, value)`
* `key` {mixed} path to target (see
  [parseKey](#static-mapperparsekey-key) for valid types)
* `value` {mixed} data to place at key location
* Returns: {mixed} the same `value`

### `Mapper.delete (key)`
* `key` {mixed} path to delete (see [parseKey](#static-mapperparsekey-key) for
  valid types)
* Returns: {string} deleted item name

### `Mapper.all ()`
* Returns: {Object} all data contained within instance

---
## Static (stateless) functions

### `static Mapper.mergeObject (base, overlay, depth, maxDepth)`
* `base` {Object} target Object
* `overlay` {Object} source Object
* `depth` {number} (Default: 0) traversal control for nested items
* `maxDepth` {number} (Default: 50) traversal control for nested items
* Returns {Object} the `base` with `overlay` content merged as directed

### `static Mapper.getFromObject (base, keyArray)`
* `base` {Object} target Object
* Returns: {mixed} data from key location

### `static Mapper.setToObject (base, keyArray, value)`
* `base` {Object} target Object
* Returns {Object} the `base` with `value` set at path indicated by `keyArray`

### `static Mapper.deleteFromObject (base, keyArray, ctx = null)`
* `base` {Object} target Object
* Returns {Object} the `base` with path indicated by `keyArray` deleted

### `static Mapper.parseKey (key)`
* `key` {mixed} any form of locator, per type:
  * {Array} already in key-array form; pass-through
  * {string} path in dotted notation; will be split
  * {function} function to call to obtain key
* Returns {Array} from least to most specific, used to traverse an Object
