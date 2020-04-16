# View
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const View = require('kado/lib/View')
```
This library provides the registration of both view engines for rendering with
various languages as well as a view registry of actual fixtures to render from.

## Class: View
`View` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static View.getInstance()
* Return {View} new instance of the View system

### View.constructor()
* Return {View} new instance of the View system

## Class: ViewEngine
`ViewEngine` extends `ConnectEngine` see
[ConnectEngine](ConnectEngine.md) for more engine management and more.

### ViewEngine.render()
Must be extended and used to render to the underlying system.

## Class: ViewMustache

An extension of `ViewEngine` made to work with the `Mustache` template system
and implements a partial loader for working with a folder of templates.

### Usage

```js
  // add a view engine
  const fs = require('kado/lib/FileSystem')
  const ViewMustache = require('kado/lib/View').ViewMustache
  const viewFolder = fs.path.join(__dirname, 'main/views')
  app.view.addEngine('mustache', new ViewMustache(viewFolder))
  app.view.activateEngine('mustache')
```
