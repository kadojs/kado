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
class Connect {
  static each (that, name, options, method) {
    Assert.isOk(method, `Missing method ${method} for ${name} engine`)
    if (!name || name instanceof Object) {
      if (name instanceof Object) options = name
      return that.eachEngine((engine) => {
        Assert.isOk(engine[method] && typeof engine[method] === 'function',
          `Cannot call ${method} on ${name} engine`)
        return engine[method](options)
      })
    } else {
      const engine = that.getEngine(name)
      Assert.isOk(engine[method] && typeof engine[method] === 'function',
        `Cannot call ${method} on ${name} engine`)
      return engine[method](options)
    }
  }

  static getInstance () { return new Connect() }
  constructor () {
    this.engine = {}
    this.activeEngine = null
  }

  addEngine (name, instance) {
    Assert.isOk(typeof instance === 'object', 'Invalid Engine Type')
    this.engine[name] = instance
    return this.getEngine(name)
  }

  checkEngine (name) {
    return !!(
      this.engine &&
      this.engine[name] &&
      typeof this.engine[name] === 'object'
    )
  }

  activateEngine (name) {
    this.activeEngine = this.getEngine(name)
    return this.activeEngine
  }

  deactivateEngine () {
    this.activeEngine = null
    return true
  }

  getActiveEngine () {
    return this.activeEngine
  }

  getEngine (name) {
    return this.checkEngine(name) ? this.engine[name] : false
  }

  removeEngine (name) {
    if (!this.checkEngine(name)) return false
    if (this.activeEngine === this.engine[name]) this.deactivateEngine()
    delete this.engine[name]
    return true
  }

  allEngines () {
    return this.engine
  }

  listEngines () {
    return Object.keys(this.engine)
  }

  eachEngine (fn, engineKeys, engineResult) {
    if (engineKeys === undefined) return this.eachEngine(fn, this.listEngines())
    if (!engineResult) engineResult = {}
    const key = engineKeys.shift()
    if (key && engineKeys.length === 0) {
      return Promise.resolve().then(() => { return fn(this.engine[key]) })
        .then((result) => {
          engineResult[key] = result
          return engineResult
        })
    } else {
      if (!key) return Promise.resolve()
      return Promise.resolve().then(() => { return fn(this.engine[key]) })
        .then((result) => {
          engineResult[key] = result
          return this.eachEngine(fn, engineKeys, engineResult)
        })
    }
  }
}
class ConnectEngine {
  constructor () {
    this.engine = null
  }

  setEngine (instance) {
    Assert.isOk(instance instanceof Object,
      `Needed Object for engine and got ${instance}`)
    this.engine = instance
    return this.engine
  }

  resetEngine () {
    this.engine = null
    return true
  }

  checkEngine () {
    Assert.isOk(this.engine, 'No Connect Engine set')
  }

  getEngine () {
    this.checkEngine()
    return this.engine
  }

  start () {
    this.checkEngine()
    throw new Error('Connect.start() must be extended')
  }

  stop () {
    this.checkEngine()
    throw new Error('Connect.stop() must be extended')
  }
}
Connect.ConnectEngine = ConnectEngine
module.exports = Connect
