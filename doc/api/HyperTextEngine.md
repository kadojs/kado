# HyperTextEngine
*Introduced in 4.0.0*
> Stability: 1 - Experimental
```js
const HyperTextEngine = require('kado/lib/HyperTextEngine')
```
This library helps implement web servers for use with the HyperText abstraction
layer provided by Kado.

## Class: HyperTextEngine

### HyperTextEngine.constructor()
* Return {HyperTextEngine} new instance of the engine handler

### HyperTextEngine.checkPort()
* Return {undefined}

Throws an Error when the requested port is invalid

### HyperTextEngine.checkHost()
* Return {undefined}

Throws an Error when the requested host is invalid

### HyperTextEngine.checkHttp()
* Return {undefined}

Throws an Error when the HTTP instance is not defined.

### HyperTextEngine.start()
* Return {undefined}

Without extension only executes `checkHttp()`

### HyperTextEngine.stop()
* Return {undefined}

Without extension only execute `checkHttp()`
