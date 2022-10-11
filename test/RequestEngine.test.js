'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2022 Bryan Tong, NULLIVEX LLC. All rights reserved.
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Application = require('../lib/Application')
const Assert = require('../lib/Assert')
const HyperText = require('../lib/HyperText')
const Mapper = require('../lib/Mapper')
const RequestEngine = require('../lib/RequestEngine')
let appInstance
const ourAppPort = 3010
function isClientJSON (req) {
  return (
    req.headers &&
    req.headers['content-type'] &&
    req.headers['content-type'].indexOf('json') >= 0
  ) || (
    req.headers &&
    req.headers.accept &&
    req.headers.accept.indexOf('json') >= 0
  )
}
class OurApp extends RequestEngine {
  static register (app) {
    app.connect.addEngine('myapp', new OurApp())
  }

  static request (ctx, uri = '/', params = {}, options = {}) {
    // if (!options.method && !ctx.method) options.method = 'POST'
    options.login = OurApp.login
    return RequestEngine.request(ctx, uri, params, options)
  }

  static login (ctx, options) {
    const params = {
      email: ctx.email,
      password: ctx.password
    }
    return OurApp.request(ctx, '/login', params, options)
  }

  static getInstance (options) {
    const config = {}
    Object.assign(config, config.magic)
    Mapper.mergeObject(config, options)
    if (!appInstance) appInstance = new OurApp(config)
    return appInstance
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
    return OurApp.request(this, uri, params, options)
  }

  start () {}
  stop () {}
}
runner.suite('RequestEngine', (it, suite) => {
  // we have to make a mini app in order to test request engine against it
  const app = Application.getInstance('ourapp')
  app.setName('ourapp')
  app.setVersion('1.0.0')
  // add an http server
  const http = new HyperText.HyperTextServer()
  http.setHost('localhost')
  http.setPort(ourAppPort)
  app.http.addEngine('http', http.createServer(app.router))
  app.httpServer = http
  // add request preparation
  app.use((req) => {
    // set a flag for json clients
    req.isJSON = isClientJSON(req)
  })
  app.get('/ping', (req, res) => { res.json({ pong: 'pong' }) })
  const ourAppConfig = {
    enabled: true,
    host: 'localhost',
    port: ourAppPort
  }
  const ourApp = OurApp.getInstance(ourAppConfig)
  suite.before(async () => {
    await app.start()
    await app.listen()
    await new Promise((resolve) => { setTimeout(resolve, 20) })
  })
  suite.after(async () => {
    await app.stop()
  })
  it('should construct', () => {
    Assert.isType('RequestEngine', new RequestEngine())
  })
  it('should have an instance', () => {
    Assert.isType('OurApp', ourApp)
  })
  it('should ping', async () => {
    const result = await ourApp.byUri('/ping')
    Assert.isType('string', result.pong)
    Assert.isOk(result.pong === 'pong', 'Invalid response')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
