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

module.exports = class Email {
  static getInstance () { return new Email() }
  constructor () {
    this.handlers = []
  }

  addHandler (name, instance) {
    this[name] = instance
    this.handlers.push(name)
    return instance
  }

  removeHandler (name) {
    delete this[name]
    this.handlers = this.handlers.splice(this.handlers.indexOf(name), 1)
    return name
  }

  send (name, options) {
    if (!name || name instanceof Object) {
      if (name) options = name
      const promises = []
      this.handlers.forEach((name) => {
        promises.push(this[name].send(options))
      })
      return Promise.all(promises)
    } else {
      return this[name].send(options)
    }
  }

  reset (name) {
    if (!name) {
      this.handlers.forEach((name) => { this[name] = undefined })
    } else {
      this[name] = undefined
    }
    return true
  }
}
