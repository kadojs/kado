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
const fs = require('fs')
const instance = {}
const path = require('path')

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
    this.cli = new Application.CommandServer(this)
    this.connect = new Application.Connect()
    this.cron = new Application.Cron()
    this.database = new Application.Database()
    this.email = new Application.Email()
    this.event = new Application.Event()
    this.history = new Application.History()
    this.http = new Application.HyperText()
    this.lang = new Application.Language()
    this.library = new Application.Library()
    this.logging = new Application.Log()
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
    this.version = '0.0.0'
  }

  getDefaultConfig () {
    return {
      baseUrl: '',
      connect: { engine: {} },
      css: { add: [], remove: [] },
      database: { engine: {} },
      dev: null,
      email: { engine: {} },
      event: { engine: {} },
      http: { engine: {} },
      instance: { name: null },
      language: { packs: [] },
      library: { lib: [], paths: [] },
      log: { dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS', engine: {} },
      module: {},
      name: 'kado',
      override: {
        language: { packs: [] },
        library: { lib: [], paths: [] },
        nav: {},
        permission: { allowed: {}, available: [] },
        uir: {},
        view: {}
      },
      page: { title: 'kado' },
      script: { server: [], add: [], remove: [] },
      search: { enabled: false },
      static: { root: [] },
      title: 'Kado',
      view: { file: {}, render: { enabled: false, cache: true, engine: {} } }
    }
  }

  setConfig (cfg) {
    this.config.merge(cfg || {})
    return this
  }

  setName (name) {
    this.name = name
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
    this.KADO_ROOT = path.dirname(__dirname)
    this.KADO_USER_ROOT = path.dirname(path.dirname(this.KADO_ROOT))
    const userPackageJson = path.resolve(
      path.join(this.KADO_USER_ROOT, 'package.json')
    )
    if (!fs.existsSync(userPackageJson)) this.KADO_USER_ROOT = this.KADO_ROOT
    this.INTERFACE_ROOT = path.resolve(
      path.join(this.KADO_USER_ROOT, this.name)
    )
  }

  setupLog () {
    if (!this.config.get('log.engine')) this.config.set('log.engine', [])
    const engines = this.config.log.engine
    for (const i in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid engine key ${i}`)
      const Log = require(engines[i].lib)
      this.logging.addEngine(i, new Log(engines[i].options))
      if (engines[i].default === true) this.logging.activateEngine(i)
    }
    this.log = this.logging.getActiveEngine()
  }

  setupLibrary () {
    this.library.addPath(path.resolve(this.KADO_USER_ROOT + '/lib'))
    this.library.addPath(path.resolve(this.KADO_ROOT + '/lib'))
    if (!this.config.get('library.paths')) this.config.set('library.paths', [])
    for (const p of this.config.library.paths || []) this.library.add(p)
    if (!this.config.get('library.lib')) this.config.set('library.lib', [])
    for (const p of this.config.library.lib || []) {
      this.library.add(p.name, p.file)
    }
    if (!this.config.get('override.library.path')) {
      this.config.set('override.library.path', [])
    }
    for (const p of this.config.override.library.path || []) this.library.add(p)
    if (!this.config.get('override.library.lib')) {
      this.config.set('override.library.lib', [])
    }
    for (const p of this.config.override.library.lib || []) {
      this.library.add(p.name, p.file)
    }
  }

  setupConnect () {
    if (!this.config.get('connect.engine')) {
      this.config.set('connect.engine', [])
    }
    const engines = this.config.connect.engine
    for (const i in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid engine key ${i}`)
      const Connect = require(engines[i].lib)
      this.connect.addEngine(i, new Connect(engines[i].options))
      if (engines[i].default === true) this.connect.activateEngine(i)
    }
  }

  setupDatabase () {
    if (!this.config.get('database.engine')) {
      this.config.set('database.engine', [])
    }
    const engines = this.config.database.engine
    for (const i in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid engine key ${i}`)
      const Database = require(engines[i].lib)
      this.db[i] = new Database(engines[i].options)
      this.database.addEngine(i, this.db[i])
      if (engines[i].default === true) this.database.activateEngine(i)
    }
  }

  setupEmail () {
    if (!this.config.get('email.engine')) this.config.set('email.engine', {})
    const engines = this.config.email.engine
    for (const i in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid engine key ${i}`)
      const Email = require(engines[i].lib)
      this.email.addEngine(i, new Email(engines[i].options))
      if (engines[i].default === true) this.email.activateEngine(i)
    }
  }

  setupEvent () {
    if (!this.config.get('event.engine')) this.config.set('event.engine', {})
    const engines = this.config.event.engine
    for (const i in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid engine key ${i}`)
      const Event = require(engines[i].lib)
      this.event.addEngine(i, new Event(engines[i].options))
      if (engines[i].default === true) this.event.activateEngine(i)
    }
  }

  setupHyperText () {
    if (!this.config.get('http.engine')) this.config.set('http.engine', {})
    const engines = this.config.http.engine
    for (const key in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, key)) continue
      Assert.isOk(key.indexOf('.') === -1, `Invalid engine key ${key}`)
      const HyperText = require(engines[key].lib)
      const http = new HyperText(engines[key].options)
      http.setRouter(this.router)
      this.http.addEngine(key, http)
      if (engines[key].default === true) this.http.activateEngine(key)
    }
  }

  setupLanguage () {
    if (!this.config.get('language.packs')) {
      this.config.set('language.packs', {})
    }
    const packs = this.config.language.packs
    for (const i in packs) {
      if (!Object.prototype.hasOwnProperty.call(packs, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid language key ${i}`)
      const pack = require(packs[i])
      this.lang.addPack(pack._pack_code, pack)
    }
    if (!this.config.get('override.language.packs')) {
      this.config.set('override.language.packs', {})
    }
    const override = this.config.override.language.packs
    for (const i in override) {
      if (!Object.prototype.hasOwnProperty.call(override, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid language key ${i}`)
      const pack = require(override[i])
      this.lang.addPack(pack._pack_code, pack)
    }
  }

  setupView () {
    if (!this.config.get('view.file')) this.config.set('view.file', {})
    const views = this.config.view.file
    for (const i in views) {
      if (!Object.prototype.hasOwnProperty.call(views, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid view key ${i}`)
      this.view.add(i, views[i])
    }
    if (!this.config.get('override.view.file')) {
      this.config.set('override.view.file', {})
    }
    const override = this.config.override.view.file
    for (const i in override) {
      if (!Object.prototype.hasOwnProperty.call(override, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid view key ${i}`)
      this.view.add(i, override[i])
    }
    if (!this.config.view.render.enabled) return
    const engines = this.config.view.render.engine
    for (const i in engines) {
      if (!Object.prototype.hasOwnProperty.call(engines, i)) continue
      Assert.isOk(i.indexOf('.') === -1, `Invalid engine key ${i}`)
      const Render = require(engines[i].lib)
      this.view.addEngine(i, new Render(engines[i].options))
      if (engines[i].default === true) this.view.activateEngine(i)
    }
  }

  setup () {
    if (this.isSetup === true) return this
    this.setupMode()
    this.setupPaths()
    this.setupLog()
    this.setupLibrary()
    this.setupConnect()
    this.setupDatabase()
    this.setupEmail()
    this.setupEvent()
    this.setupHyperText()
    this.setupLanguage()
    this.setupView()
    this.isSetup = true
    return this
  }

  addModule (mod) {
    this.modules[mod.name] = mod
    return this
  }

  getModule (name) {
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
        Application.Connect.each(this.database, null, {}, 'start')
      })
  }

  stopConnect () {
    // disconnect all connector style instances
    //  Database
    //  Connect
    return Application.Connect.each(this.database, null, {}, 'stop')
      .then(() => {
        Application.Connect.each(this.connect, null, {}, 'stop')
      })
  }

  isCommand (argv) {
    return argv instanceof Array && argv.length > 3
  }

  test (argv) {
    console.log(argv)
    // TODO: implement TestRunner
  }

  command (argv) {
    return Promise.resolve().then(() => {
      if (this.isCommand(argv) === false) return false
      return argv[2] === 'test' ? this.test(argv) : this.cli.run(argv)
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
      .then(() => {
        return this.command(argv)
          .then((code) => {
            if (code === false) return
            Assert.isOk(code >= 0, `Invalid command return code: ${code}`)
            return this.stop().then(() => { process.exit(code || 0) })
          })
      })
      .then(() => {
        this.started = true
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
Application.CommandServer = require('./CommandServer')
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
