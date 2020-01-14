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
const ConnectEngine = require('./ConnectEngine')
module.exports = class Connect {
  static getInstance () { return new Connect() }
  constructor () {
    this.engine = {}
    this.activeEngine = null
  }

  addEngine (name, instance) {
    if (!(instance instanceof ConnectEngine)) {
      throw new Error('Invalid Engine type')
    }
    this.engine[name] = instance
    return this.getEngine(name)
  }

  checkEngine (name) {
    return !!(
      this.engine &&
      this.engine[name] &&
      this.engine[name] instanceof ConnectEngine
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

  each (fn, engineKeys, engineResult) {
    if (engineKeys === undefined) return this.each(fn, this.listEngines())
    if (!engineResult) engineResult = {}
    const key = engineKeys.shift()
    if (key && engineKeys.length === 0) {
      return Promise.resolve().then(() => { return fn(this.engine[key]) })
        .then((result) => {
          engineResult[key] = result
          return engineResult
        })
    } else {
      return Promise.resolve().then(() => { return fn(this.engine[key]) })
        .then((result) => {
          engineResult[key] = result
          return this.each(fn, engineKeys, engineResult)
        })
    }
  }

  event (name, options) {
    if (!name || (name instanceof Object)) {
      if (name instanceof Object) options = name
      return this.each((engine) => { return engine.event(options) })
    } else {
      return this.getEngine(name).event(options)
    }
  }

  send (name, options) {
    if (!name || name instanceof Object) {
      if (name instanceof Object) options = name
      return this.each((engine) => { return engine.send(options) })
    } else {
      return this.getEngine(name).send(options)
    }
  }

  connect (name, options) {
    if (!name || name instanceof Object) {
      if (name instanceof Object) options = name
      return this.each((engine) => { return engine.connect(options) })
    } else {
      return this.getEngine(name).connect(options)
    }
  }

  close (name) {
    if (!name) {
      return this.each((engine) => { return engine.close() })
    } else {
      return this.getEngine(name).close()
    }
  }

  start (name, options) {
    if (!name || name instanceof Object) {
      if (name instanceof Object) options = name
      return this.each((engine) => { return engine.start(options) })
    } else {
      return this.getEngine(name).start(options)
    }
  }

  stop (name) {
    if (!name) {
      return this.each((engine) => { return engine.stop() })
    } else {
      return this.getEngine(name).stop()
    }
  }
}
