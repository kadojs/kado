'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
const Assert = require('./Assert')
const fs = require('./FileSystem')
const instance = {}

class Application {
  static getInstance (name) {
    if (!instance[name]) instance[name] = new Application()
    return instance[name]
  }

  constructor () {
    // setup default config
    this.config = new Application.Mapper(this.getDefaultConfig())
    // instances
    this.asset = new Application.Asset()
    this.cli = new Application.Command.CommandServer(this)
    this.connect = new Application.Connect()
    this.cron = new Application.Cron()
    this.database = new Application.Database()
    this.email = new Application.Email()
    this.event = new Application.Event()
    this.history = new Application.History()
    this.http = new Application.HyperText()
    this.lang = new Application.Language()
    this.library = new Application.Library()
    this.log = new Application.Log()
    this.message = new Application.Message()
    this.nav = new Application.Navigation()
    this.permission = new Application.Permission()
    this.router = new Application.Router()
    this.search = new Application.Search()
    this.util = new Application.Util()
    this.view = new Application.View()
    // variables
    this.db = {}
    this.dev = null
    this.isSetup = false
    this.listening = false
    this.modules = {}
    this.name = 'main'
    this.started = false
    this.trustProxy = false
    this.version = '0.0.0'
  }

  getDefaultConfig () { return {} }

  setConfig (cfg) {
    this.config.merge(cfg || {})
    return this
  }

  setName (name) {
    this.name = name
    return this
  }

  setTrustProxy (trustProxy = false) {
    Assert.isType('boolean', trustProxy)
    this.trustProxy = trustProxy
    return this
  }

  setVersion (version) {
    this.version = version
    return this
  }

  setupMode () {
    if (this.config.get('dev') !== undefined) {
      this.dev = this.config.get('dev')
    }
    // set dev mode if debug is turned on and the dev option is null
    if (this.dev === null &&
      (process.env.NODE_DEBUG === 'kado' || process.env.DEV === 'kado')
    ) {
      process.env.NODE_DEBUG = 'kado'
      this.dev = true
    }
  }

  setupPaths () {
    // paths
    this.KADO_ROOT = fs.path.dirname(__dirname)
    this.KADO_USER_ROOT = fs.path.dirname(fs.path.dirname(this.KADO_ROOT))
    const userPackageJson = fs.path.resolve(
      fs.path.join(this.KADO_USER_ROOT, 'package.json')
    )
    if (!fs.exists(userPackageJson)) this.KADO_USER_ROOT = this.KADO_ROOT
    this.INTERFACE_ROOT = fs.path.resolve(
      fs.path.join(this.KADO_USER_ROOT, this.name)
    )
  }

  setupLibrary () {
    this.library.addPath(fs.path.resolve(this.KADO_USER_ROOT + '/lib'))
    this.library.addPath(fs.path.resolve(this.KADO_ROOT + '/lib'))
  }

  setupRouter () {
    this.router.setPreparer(Application.Router.standardPreparation(this))
  }

  setup () {
    if (this.isSetup === true) return this
    this.setupMode()
    this.setupPaths()
    this.setupLibrary()
    this.setupRouter()
    this.isSetup = true
    return this
  }

  addModule (mod) {
    Assert.isType('Module', Object.getPrototypeOf(mod))
    if (!this.modules) this.modules = {}
    this.modules[mod.name] = mod
    return this
  }

  getModule (name) {
    if (!this.modules) return false
    return this.modules[name]
  }

  removeModule (name) {
    if (this.modules[name]) {
      const mod = this.modules[name]
      delete this.modules[name]
      return mod
    }
    return false
  }

  lib (name) {
    return require(this.library.search(name))
  }

  startConnect () {
    // connect all connector style instances
    //  Connect
    //  Database
    return Application.Connect.each(this.connect, null, {}, 'start')
      .then(() => {
        return Application.Connect.each(this.database, null, {}, 'start')
      })
  }

  stopConnect () {
    // disconnect all connector style instances
    //  Database
    //  Connect
    return Application.Connect.each(this.database, null, {}, 'stop')
      .then(() => {
        return Application.Connect.each(this.connect, null, {}, 'stop')
      })
  }

  isCommand (argv) {
    return argv instanceof Array && argv.length > 2
  }

  command (argv) {
    return Promise.resolve().then(() => {
      if (this.isCommand(argv) === false) return false
      return this.cli.run(argv)
    })
  }

  startServer () {
    // make servers listen
    //  HyperText
    return Application.Connect.each(this.http, null, {}, 'start')
      .then((rv) => { this.listening = true; return rv })
  }

  stopServer () {
    // stop listening on all servers
    //  HyperText
    return Application.Connect.each(this.http, null, {}, 'stop')
      .then((rv) => { this.listening = false; return rv })
  }

  start (argv) {
    this.setup()
    return this.startConnect()
      .then(() => { this.started = true })
      .then(() => {
        if (!argv) return
        return this.command(argv)
          .then((code) => {
            if (code === undefined) code = 0
            Assert.isOk(code >= 0, `Invalid command return code: ${code}`)
            return this.stop().then(() => { process.exit(code || 0) })
          })
      })
  }

  listen () {
    return this.startServer()
  }

  stop () {
    return Promise.resolve()
      .then(() => {
        Assert.isOk(this.started, 'Cannot stop already idle')
      })
      .then(() => { return this.stopConnect() })
      .then(() => { if (this.listening) return this.stopServer() })
  }

  // router methods
  use (fn) { return this.router.use(fn) }
  final (fn) { return this.router.final(fn) }
  // http methods
  acl (uri, fn) { return this.router.add('ACL', uri, fn) }
  bind (uri, fn) { return this.router.add('BIND', uri, fn) }
  checkout (uri, fn) { return this.router.add('CHECKOUT', uri, fn) }
  copy (uri, fn) { return this.router.add('COPY', uri, fn) }
  delete (uri, fn) { return this.router.add('DELETE', uri, fn) }
  get (uri, fn) { return this.router.add('GET', uri, fn) }
  head (uri, fn) { return this.router.add('HEAD', uri, fn) }
  link (uri, fn) { return this.router.add('LINK', uri, fn) }
  lock (uri, fn) { return this.router.add('LOCK', uri, fn) }
  msearch (uri, fn) { return this.router.add('M-SEARCH', uri, fn) }
  merge (uri, fn) { return this.router.add('MERGE', uri, fn) }
  mkactivity (uri, fn) { return this.router.add('MKACTIVITY', uri, fn) }
  mkcalendar (uri, fn) { return this.router.add('MKCALENDAR', uri, fn) }
  mkcol (uri, fn) { return this.router.add('MKCOL', uri, fn) }
  move (uri, fn) { return this.router.add('MOVE', uri, fn) }
  notify (uri, fn) { return this.router.add('NOTIFY', uri, fn) }
  options (uri, fn) { return this.router.add('OPTIONS', uri, fn) }
  patch (uri, fn) { return this.router.add('PATCH', uri, fn) }
  post (uri, fn) { return this.router.add('POST', uri, fn) }
  propfind (uri, fn) { return this.router.add('PROPFIND', uri, fn) }
  proppatch (uri, fn) { return this.router.add('PROPPATCH', uri, fn) }
  purge (uri, fn) { return this.router.add('PURGE', uri, fn) }
  put (uri, fn) { return this.router.add('PUT', uri, fn) }
  rebind (uri, fn) { return this.router.add('REBIND', uri, fn) }
  report (uri, fn) { return this.router.add('REPORT', uri, fn) }
  source (uri, fn) { return this.router.add('SOURCE', uri, fn) }
  subscribe (uri, fn) { return this.router.add('SUBSCRIBE', uri, fn) }
  trace (uri, fn) { return this.router.add('TRACE', uri, fn) }
  unbind (uri, fn) { return this.router.add('UNBIND', uri, fn) }
  unlink (uri, fn) { return this.router.add('UNLINK', uri, fn) }
  unlock (uri, fn) { return this.router.add('UNLOCK', uri, fn) }
  unsubscribe (uri, fn) { return this.router.add('UNSUBSCRIBE', uri, fn) }
}
Application.Asset = require('./Asset')
Application.Command = require('./Command')
Application.Connect = require('./Connect')
Application.Cron = require('./Cron')
Application.Database = require('./Database')
Application.Email = require('./Email')
Application.Event = require('./Event')
Application.History = require('./History')
Application.HyperText = require('./HyperText')
Application.Language = require('./Language')
Application.Library = require('./Library')
Application.Log = require('./Log')
Application.Message = require('./Message')
Application.Mapper = require('./Mapper')
Application.Navigation = require('./Navigation')
Application.Permission = require('./Permission')
Application.Profiler = require('./Profiler')
Application.Router = require('./Router')
Application.Search = require('./Search')
Application.Util = require('./Util')
Application.View = require('./View')
module.exports = Application
