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

### static HyperText.getInstance()
* Return {HyperText} new web server abstraction instance

### HyperText.checkEngine()
* Return {undefined}

Throws an Error when there is no activated engine.

### HyperText.checkHandler()
* Return {undefined}

Throws an Error when the handler does not exist.

### HyperText.checkHandlerExists(name)
* `name` {string} name of the handler to check for existence
Return {undefined}

Throws and Error when the handler does not exist by name.

### HyperText.addHandler(name, instance)
* `name` {string} name of the handler to add
* `instance` {HyperTextEngine} instance to use for requests
* Return {string} name of the added handler

### HyperText.getHandler(name)
* `name` {string} name of the handler to get
* Return {HyperTextEngine} instance of the handler

### HyperText.removeHandler(name)
* `name` {string} name of the handler to remove
* Return {string} name of the handler removed

### HyperText.activateHandler(name)
* `name` {string} name of the handler to activate
* Return {string} name of the handler activated

### HyperText.start(port, host)
* `port` {number} Port from 1 - 65536 to start the server on.
* `host` {string} Hostname or IP address to listen on. {null} will listen on all
* Return {Promise} resolved when the active engine starts

### HyperText.stop()
* Return {Promise} resolved when the active engine stops
