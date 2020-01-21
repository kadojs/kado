# Lifecycle
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Lifecycle = require('kado/lib/Lifecycle')
```
The `Lifecycle` library provides an interface for registering call back
methods for starting and stopping systems.

## Class: Lifecycle extends EventEmitter

### Lifecycle.constructor()
* Return {Lifecycle} new instance of the Lifecyle system

### Lifecycle.nextIndex()
* Return {number} what would be the next used index when adding a new item

### Lifecycle.list()
* Return {Array} of currently registered indexes for items

### Lifecycle.get(title)
* `title` {string} title or index of the item to get
* Return {object} the selected item or `false`

### Lifecycle.add(title, start, stop)
* `title` {string} title of the new item
* `start` {function} to execute on start
* `stop` {function} to execute on stop
* Return {object} the newly added item

### Lifecycle.remove(title)
* `title` {string} title of the item to remove
* Return {object} the removed item or `false`

### Lifecycle.execute(keys, method)
* `keys` {Array} usually the result of `Lifecycle.list()`
* `method` {string} method to execute such as `start` or `stop`
* Return {Promise} that is resolved when all items have been called

### Lifecycle.start()
* Return {Promise} resolved when all items have been started

Note: each item will emit a `start` event.

### Lifecycle.stop()
* Return {Promise} resolved when all items have been stopped

Note: each item will emit a `stop` event.
