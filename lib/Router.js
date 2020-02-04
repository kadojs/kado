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
const http = require('http')
class Route {
  constructor (method, uri, fn) {
    this.method = method
    this.uri = uri
    this.fn = fn
    this.regexp = !!(this.uri.match(':'))
  }

  match (path) {
    if (this.regexp === false) return path === this.uri
    return false // no regexp support yet
  }
}
class Router {
  static getInstance () { return new Router() }
  constructor () {
    this.route = {}
    this.middleware = {}
    this.finalHandler = () => {}
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

  get (method, uri) {
    if (!this.route[method]) return false
    for (const key in this.route[method]) {
      if (!Object.prototype.hasOwnProperty.call(this.route[method], key)) {
        continue
      }
      if (this.route[method][key].match(uri)) return this.route[method][key]
    }
    return false
  }

  callMiddleware (req, res, middlewareKeys) {
    const key = middlewareKeys.shift()
    if (key && middlewareKeys.length === 0) {
      return Promise.resolve()
        .then(() => { return this.middleware[key].fn(req, res) })
    } else {
      if (Object.prototype.hasOwnProperty.call(this.middleware, key)) {
        return Promise.resolve()
          .then(() => { return this.middleware[key].fn(req, res) })
          .then(() => { return this.callMiddleware(req, res, middlewareKeys) })
      } else {
        return this.callMiddleware(req, res, middlewareKeys)
      }
    }
  }

  request (req, res) {
    return this.callMiddleware(req, res, Object.keys(this.middleware))
      .then(() => {
        const route = this.get(req.url)
        // fall back to final handler
        if (route === false) return route
        return route.fn(req, res)
      })
      .then((result) => {
        if (result === false) return this.finalHandler()
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
