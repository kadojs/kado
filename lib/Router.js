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

module.exports = class Router {
  static getInstance () { return new Router() }
  constructor () {
    this.route = {}
  }

  add (name, uri) {
    if (!uri) uri = name
    this.route[name] = uri
    return uri
  }

  update (name, uri) {
    this.route[name] = uri
    return uri
  }

  remove (name) {
    const uri = this.route[name]
    delete this.route[name]
    return uri
  }

  get (name) {
    if (!this.route[name]) throw new Error('Requested undefined URI: ' + name)
    return this.route[name]
  }

  method (method, path) {
    const handlers = Array.prototype.slice.call(arguments, 2)
    console.log(method, path, handlers)
  }

  p (name, uri) {
    if (!uri) uri = name
    if (!this.route[name]) this.add(name, uri)
    return this.get(name)
  }

  all () {
    return this.route
  }

  allForTemplate (replaceSlashes) {
    const that = this
    if (undefined === replaceSlashes) replaceSlashes = true
    if (replaceSlashes) {
      const obj = {}
      for (const i in that.route) {
        if (Object.prototype.hasOwnProperty.call(that.route, i)) {
          const e = i.replace(/[/\\]+/g, '_')
          obj[e] = that.route[i]
        }
      }
      return obj
    } else {
      return that.route
    }
  }
}
