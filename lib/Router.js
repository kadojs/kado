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
const ETag = require('./ETag')
const Format = require('./Format')
const fs = require('./FileSystem')
const http = require('http')
// const Mapper = require('./Mapper')
const Mime = require('./Mime')
const Parser = require('./Parser')
const PathExp = require('./PathExp')
class Route {
  constructor (method, uri, fn) {
    // setup properties
    this.fn = fn
    this.method = method
    this.uri = uri
    // turn on regex if needed
    this.regexp = this.uri.match(':') ? new PathExp(this.uri) : false
  }

  match (path, params) {
    if (this.regexp === false) return path === this.uri
    return this.regexp.match(path, params)
  }
}
class Router {
  static queryString (req) {
    const queryString = req.url.split('?').slice(1).join('?')
    const searchParams = Parser.queryString(queryString)
    if (searchParams.get) searchParams._get = searchParams.get
    searchParams.get = (key) => {
      return key === 'get' ? searchParams._get : searchParams[key]
    }
    return searchParams
  }

  static redirectRequest (res) {
    return (location, options = {}) => {
      res.statusCode = options.code || 302
      res.setHeader('Location', location)
      res.end()
    }
  }

  static renderJSON (res) {
    return (object = {}) => {
      const payload = JSON.stringify(object)
      res.setHeader('Content-Length', payload.length)
      res.setHeader('Content-Type', 'application/json')
      res.end(payload)
    }
  }

  static sendFile (req, res) {
    return (filepath) => {
      const filename = fs.path.resolve(filepath)
      if (!fs.exists(filename)) {
        res.statusCode = 404
        res.end('File not found')
        return false
      }
      const stat = fs.statSync(filename)
      if (stat.isDirectory()) {
        res.statusCode = 403
        res.end('Forbidden')
        return false
      }
      const tag = ETag.getTag(stat)
      const stream = fs.createReadStream(filename)
      const type = Mime.getType(filename)
      res.setHeader('Content-Length', stat.size)
      res.setHeader('Content-Type', type.type)
      res.setHeader('ETag', tag)
      if (req.headers['if-none-match'] === tag) {
        res.statusCode = 304
        res.end()
      } else {
        stream.on('error', (e) => {
          console.error(`Error reading ${filename}: ${e.message}`)
        })
        stream.pipe(res)
      }
      return true
    }
  }

  static render (app, req, res) {
    if (app.view) {
      const eng = app.view.getActiveEngine()
      if (!eng || typeof eng.render !== 'function') return false
      return function render (template, params = {}, options = {}) {
        // const templateParams = { ...req.locals }
        // Mapper.mergeObject(templateParams, params)
        try {
          params = JSON.parse(JSON.stringify(params))
          Object.keys(req.locals).map((key) => {
            if (!params[key]) params[key] = req.locals[key]
            return key
          })
        } catch (err) {
          throw new Error(
            'Failed to prepare template parameters: ' + err.message
          )
        }
        return eng.render(req, res, template, params, options)
      }
    }
    return false
  }

  static getRemoteIP (app, req) {
    let ip = req.socket.localAddress
    if (req.headers['x-forwarded-for'] && app.trustProxy === true) {
      ip = req.headers['x-forwarded-for']
    }
    return ip
  }

  static notify (req) {
    return (message, options = {}) => {
      if (req.session && typeof req.session.set === 'function') {
        const notify = req.session.get('_notify') || []
        let level = options.level || 'success'
        if (message.constructor.name === 'Error') {
          message = message.message
          level = 'error'
        } else if (message.constructor.name !== 'String') {
          message = `${message}`
          level = message.constructor.name
        }
        notify.push({ message: message, level: level })
        return req.session.set('_notify', notify)
      }
    }
  }

  static setPoweredBy (res) {
    res.setHeader('X-Powered-By', 'Kado <hello@kado.org> (https://kado.org)')
  }

  static standardPreparation (app) {
    if (!app || app.constructor.name !== 'Application') return false
    return function standardPreparation (req, res) {
      req.locals = {}
      req.cookie = Parser.cookie('' + req.headers.cookie)
      res.cookie = (name, value, options) => {
        const cookie = Format.cookie(name, value, options)
        res.setHeader('Set-cookie', cookie)
      }
      req.ip = Router.getRemoteIP(app, req)
      req.notify = Router.notify(req)
      res.json = Router.renderJSON(res)
      req.query = Router.queryString(req)
      res.redirect = Router.redirectRequest(res)
      res.render = Router.render(app, req, res)
      res.sendFile = Router.sendFile(req, res)
      Router.setPoweredBy(res)
      return Parser.requestBody(req)
    }
  }

  static getInstance () { return new Router() }
  constructor () {
    this.finalHandler = (req, res) => {
      res.statusCode = 404
      res.end(`Cannot ${req.method} ${req.url}`)
    }
    this.middleware = {}
    this.preparer = null
    this.route = {}
  }

  setPreparer (preparer) {
    Assert.isType('Function', preparer)
    this.preparer = preparer
    return this
  }

  getPreparer () {
    return this.preparer
  }

  use (fn) {
    Assert.isOk(typeof fn === 'function', `middleware ${fn} is not a function`)
    this.middleware[Object.keys(this.middleware).length] = { fn: fn }
  }

  unuse (fn) {
    Assert.isOk(typeof fn === 'function',
      `middleware ${fn} for removal is not a function`)
    let rv = false
    for (const key in this.middleware) {
      if (!Object.prototype.hasOwnProperty.call(this.middleware, key)) continue
      if (this.middleware[key].fn === fn) {
        delete this.middleware[key]
        rv = true
        break
      }
    }
    return rv
  }

  final (fn) {
    Assert.isOk(typeof fn === 'function',
      `finalHandler ${fn} is not a function`)
    this.finalHandler = fn
  }

  add (method, uri, fn) {
    Assert.isOk(typeof fn === 'function', `${uri} handler is not a function`)
    Assert.isOk(http.METHODS.indexOf(method) >= 0,
      `${method} is not a valid HTTP verb`)
    if (!this.route[method]) this.route[method] = {}
    this.route[method][uri] = new Route(method, uri, fn)
    return this.route[method][uri]
  }

  update (method, uri, fn) {
    Assert.isOk(typeof fn === 'function',
      `updated handler ${fn} is not a function`)
    Assert.isOk(this.route[method] && this.route[method][uri],
      `${method} ${uri} does not exist for update`)
    if (fn) this.route[method][uri].fn = fn
    return this.route[method][uri]
  }

  remove (method, uri) {
    if (this.route && this.route[method] && this.route[method][uri]) {
      delete this.route[method][uri]
      if (Object.keys(this.route[method]) === 0) delete this.route[method]
      return true
    }
    return false
  }

  get (httpMethod, uri, params) {
    let method = httpMethod
    // OPTIONS and HEAD requests are sent to the GET routes
    if (httpMethod === 'OPTIONS' || httpMethod === 'HEAD') method = 'GET'
    // confirm we have routes for the given method
    if (!this.route[method]) return false
    const url = new URL(`http://localhost${uri}`)
    for (const key in this.route[method]) {
      if (!Object.prototype.hasOwnProperty.call(this.route[method], key)) {
        continue
      }
      if (this.route[method][key].match(url.pathname, params)) {
        return this.route[method][key]
      }
    }
    return false
  }

  callPreparer (req, res) {
    return Promise.resolve()
      .then(() => {
        const preparer = this.getPreparer()
        if (typeof preparer !== 'function') return false
        return preparer(req, res)
      })
  }

  callMiddleware (req, res, middlewareKeys) {
    const key = middlewareKeys.shift()
    if (key === undefined) return Promise.resolve()
    if (key && middlewareKeys.length === 0) {
      return Promise.resolve()
        .then(() => { return this.middleware[key].fn(req, res) })
    } else {
      return Promise.resolve()
        .then(() => { return this.middleware[key].fn(req, res) })
        .then((result) => {
          if (result === true) return result
          return this.callMiddleware(req, res, middlewareKeys)
        })
    }
  }

  request (req, res) {
    if (!req.params) req.params = {}
    const route = this.get(req.method, req.url, req.params)
    return this.callPreparer(req, res)
      .then(() => {
        return this.callMiddleware(req, res, Object.keys(this.middleware))
      })
      .then((result) => {
        if (result === true) return result
        if (route === false) return route
        return route.fn(req, res)
      })
      .then((result) => {
        if (result === false) return this.finalHandler(req, res)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  all () {
    return this.route
  }

  allForTemplate (replaceSlashes) {
    if (replaceSlashes === undefined) replaceSlashes = true
    if (replaceSlashes) {
      const obj = {}
      for (const method in this.route) {
        if (!Object.prototype.hasOwnProperty.call(this.route, method)) continue
        for (const i in this.route[method]) {
          if (!Object.prototype.hasOwnProperty.call(this.route[method], i)) {
            continue
          }
          const e = i.replace(/[/\\]+/g, '_')
          obj[e] = this.route[method][i].uri
        }
      }
      return obj
    } else {
      return this.route
    }
  }
}
Router.Route = Route
module.exports = Router
