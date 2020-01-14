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
`HyperText` extends `Connect` see [Connect.md](./Connect.md) for more engine
management and more.

### static HyperText.getInstance()
* Return {HyperText} new web server abstraction instance

### HyperText.start(port, host)
* `port` {number} Port from 1 - 65536 to start the server on.
* `host` {string} Hostname or IP address to listen on. {null} will listen on all
* Return {Promise} resolved when the active engine starts

### HyperText.stop()
* Return {Promise} resolved when the active engine stops

## Class: HyperTextEngine
`HyperTextEngine` extends `ConnectEngine` see
[ConnectEngine.md](./ConnectEngine.md) for more engine management and more.

### HyperTextEngine.start()
Must be extended and used to start the underlying server.

### HyperTextEngine.stop()
Must be extended and used to stop the underlying server.
