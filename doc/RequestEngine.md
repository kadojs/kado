# RequestEngine

*Introduced in 4.4.0*
> Stability: 2 - Stable

Request Engine provides an object-oriented interface that allows the programmer
to create instances that point to remote locations. These instances are already
preloaded with login parameters and can be used for iterating API services.

This example shows how to integrate an application with request engine. Often,
this is used to create an object that connects to the program being worked on.
Once done, self testing can be done in an end to end fashion.

The login and configuration depends on the remote and how it is configured.
Being that applications change access depending on deployment the configuration
is applied at run time.

```js
const Mapper = require('kado/lib/Mapper')
const RequestEngine = require('kado/lib/RequestEngine')
class MyApp extends RequestEngine {
  static register (app) {
    app.connect.addEngine('myapp', new MyApp(config.myapp))
  }

  static request (ctx, uri = '/', params = {}, options = {}) {
    // if (!options.method && !ctx.method) options.method = 'POST'
    options.login = MyApp.login
    return RequestEngine.request(ctx, uri, params, options)
  }

  static login (ctx, options) {
    const params = {
      email: ctx.email,
      password: ctx.password
    }
    return MyApp.request(ctx, '/login', params, options)
  }

  static getInstance (options) {
    const config = {}
    Object.assign(config, config.magic)
    Mapper.mergeObject(config, options)
    if (!instance) instance = new MyApp(config)
    return instance
  }

  constructor (options = {}) {
    super(options)
    this.enabled = !!options.enabled
    this.email = options.email
    this.host = options.host
    this.port = options.port
    this.ssl = options.ssl
    this.rejectUnauthorized = options.rejectUnauthorized
    this.maxAttempts = options.maxAttempts
    this.method = options.method
    this.password = options.password
    this.prefix = options.prefix
    this.token = options.token
  }

  byUri (uri, params = {}, options = {}) {
    return MyApp.request(this, uri, params, options)
  }

  start () {}
  stop () {}
}
```

## Class: RequestEngine

### static RequestEngine.request(ctx, uri, params, options, attempt)

* `ctx` {Object} `thisArg` to use when calling `method` to provide context
* `uri` {String} the uri to access at the end point such as /user
* `params` {Object} the parameters in this object are passed as input to the 
 request
* `options` {Object} this object contains per request configuration overrides
the available options are the same as the constructor.
* `attempt` {Number} the attempt used internally to track automatic retries.
* Return {Promise} that will resolve with the output data such as a JSON object
or text.
