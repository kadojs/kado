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

module.exports = class HyperText {
  static getInstance () { return new HyperText() }
  constructor () {
    this.engine = null
    this.handlers = {}
    this.HyperTextEngine = require('./HyperTextEngine')
  }

  checkEngine () {
    if (!this.engine) throw new Error('No Hypertext engine active')
    if (!(this.engine instanceof this.HyperTextEngine)) {
      throw new Error('Invalid engine type')
    }
  }

  checkHandler (name) {
    if (!this.handlers[name]) throw new Error(`Handler ${name} does not exist`)
  }

  checkHandlerExists (name) {
    if (this.handlers[name]) throw new Error(`Handler ${name} already exists`)
  }

  addHandler (name, instance) {
    this.checkHandlerExists(name)
    this.handlers[name] = instance
    return name
  }

  getHandler (name) {
    this.checkHandler(name)
    return this.handlers[name]
  }

  allHandlers () {
    return this.handlers
  }

  removeHandler (name) {
    this.checkHandler(name)
    delete this.handlers[name]
    return name
  }

  activateHandler (name) {
    this.engine = this.getHandler(name)
    return name
  }

  start (port, host) {
    this.checkEngine()
    return this.engine.start(port, host)
  }

  stop () {
    this.checkEngine()
    return this.engine.stop()
  }
}
