# Event
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Event = require('kado/lib/Event')
```
This library adds system level event support which is similar to logging
and follows the same logging levels. However, it is best to think of events as
news worthy, and serve a higher level of importance than logs. Events are also
used for tracking user behavior such as database changes etc.

Note: This is not to be confused with the core Node.JS `EventEmitter` which
serves a much different programmable purpose.

## Class: Event

### static Event.getInstance()
* Return {Event} new event system

### Event.constructor()
* Return {Event} new event system

### Event.allLevels()
* Return {object} containing available event levels.

### Event.getLevelInfo(level)
* `level` {string} key of the level name such as `error`
* Return {object} containing information about the said level or undefined if
the level does not exist.

### Event.addHandler(name, onEvent, opts)
* `name` {string} name of the handler
* `onEvent` {function} a function that possibly returns a {Promise}
* `opts` {object} options defining the promise
* Return {string} name of the newly added handler.

The `onEvent` function will be triggered on each new event.

### Event.getHandler(name)
* `name` {string} key of the handler
* Return {object} containing the handler

### Event.allHandlers()
* Return {object} containing all registered handlers.

### Event.removeHandler(name)
* `name` {string} name of the event handler to remove
* Return {string} name of the event handler removed.

### Event.create(options)
* `options` {object} containing the event definition.
* Return {Promise} that is resolved when all handlers are complete.

This event is mostly for internal purposes and is called by the shortcut methods
defined below.

Available options:
* `to` {string} Who to send the message to defaults to `all` can be a key that a
handler can read.
* `text` {string} The actual text for the event message.
* `module` {string} which module originated the event defaults to `global`

### Event.digest(level, to, text, options)
* `level` {string} key of the level for this event
* `to` {string} who is the event directed towards
* `text` {string} actual event message text
* `options` {object} containing additional message options
* Return {object} containing options safe to send to `Event.create()`

### Event.error(to, text, options)
* `to` {string} Who should receive the event notification
* `text` {string} The actual event message text.
* `options` {object} Additional event options for handlers
* Return {Promise} resolved after all handlers have finished `Event.create()`

### Event.warn(to, text, options)
* `to` {string} Who should receive the event notification
* `text` {string} The actual event message text.
* `options` {object} Additional event options for handlers
* Return {Promise} resolved after all handlers have finished `Event.create()`

### Event.info(to, text, options)
* `to` {string} Who should receive the event notification
* `text` {string} The actual event message text.
* `options` {object} Additional event options for handlers
* Return {Promise} resolved after all handlers have finished `Event.create()`

### Event.verbose(to, text, options)
* `to` {string} Who should receive the event notification
* `text` {string} The actual event message text.
* `options` {object} Additional event options for handlers
* Return {Promise} resolved after all handlers have finished `Event.create()`

### Event.debug(to, text, options)
* `to` {string} Who should receive the event notification
* `text` {string} The actual event message text.
* `options` {object} Additional event options for handlers
* Return {Promise} resolved after all handlers have finished `Event.create()`

### Event.silly(to, text, options)
* `to` {string} Who should receive the event notification
* `text` {string} The actual event message text.
* `options` {object} Additional event options for handlers
* Return {Promise} resolved after all handlers have finished `Event.create()`
