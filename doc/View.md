# View
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const View = require('kado/lib/View')
```
This library provides the registration of both view engines for rendering with
various languages as well, as a view registry of actual fixtures to render from.

## Class: View
`View` extends `Connect` see [Connect](Connect.md) for more engine
management and more.

### static View.getInstance()
* Return {View} new instance of the View system

### View.constructor()
* Return {View} new instance of the View system

## Class: ViewEngine
`ViewEngine` extends `ConnectEngine` see
[ConnectEngine](Connect.md#class-connectengine) for more engine management and more.

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

### Middleware

The View Mustache engine also provides middleware that can be used to add global
post-processing actions to any render call. Below is an example of how to set
this up.

The view middleware process uses latent object modification to allow control
over the view. This means that rather than returning any value, each portion of
the object passed to the middleware can be updated to a new value.

Here is an example of the view passed to the middleare.

```js
const view = {
  body: body, // the current output body
  options: options, // options passed to the original render call
  params: params, // parameters passed to the render
  partials: partials, // partials that were looked up during render
  req: req, // the request
  res: res, // the response
  tags: tags, // mustache tag overrides
  template: template // template resolved during render
}
```

The return value does control the flow. When `true` is returned the middleware
processing stops and the view engine does not output anything. Any other value
will process all middleware and then output the view.

#### DISCLAIMER

This middleware should only be used for global uses. Using them will confuse the
flow of the controller code and add magic that has to be discovered by the next
coder. As such, the use is slightly discouraged while the functionality can be
helpful. If possible, please fix the problem or correct the output within the
controller.

#### Example

While in the process of setting up the application. Typically, within lib/App.js
the following portion will need adjusted.

```js
// add a view engine
const viewFolder = fs.path.join(__dirname, '..', 'view')
app.view.addEngine('mustache', new View.ViewMustache(viewFolder))
app.view.activateEngine('mustache')
```

Now with middleware

```js
// setup view engine
const viewFolder = fs.path.join(__dirname, '..', 'view')
const viewEngine = new View.ViewMustache(viewFolder)
// add middleware
viewEngine.use((view) => {
  if (view.body.match('stuff')) {
    res.statusCode = 404
    res.end('Not found')
    return true // halt middleware processing since the response was sent
  }
})
viewEngine.use((view) => {
  if (view.params.captchaEnabled) view.params.captchaKey = 'something'
})
viewEngine.use((view) => {
  if (!req.isJSON) return // continue through middleware
  res.json(view.params)
  return true // halt middleware processing since the response was sent
})
// add a view engine
app.view.addEngine('mustache', viewEngine)
app.view.activateEngine('mustache')
```
