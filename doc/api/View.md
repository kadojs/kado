# View
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const View = require('kado/lib/View')
```
This library provides the registration of both view engines for rendering with
various languages as well as a view registry of actual fixtures to render from.

## Class: View
`View` extends `Connect` see [Connect.md](./Connect.md) for more engine
management and more.

### static View.getInstance()
* Return {View} new instance of the View system

### View.constructor()
* Return {View} new instance of the View system

## Class: ViewEngine
`ViewEngine` extends `ConnectEngine` see
[ConnectEngine.md](./ConnectEngine.md) for more engine management and more.

### ViewEngine.render()
Must be extended and used to render to the underlying system.
