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

module.exports = class Connector {
  static getInstance () { return new Connector() }
  constructor () {
    this.connectors = []
  }

  addConnector (name, instance) {
    this[name] = instance
    this.connectors.push(name)
    return instance
  }

  removeConnector (name) {
    delete this[name]
    this.connectors = this.connectors.splice(this.connectors.indexOf(name), 1)
    return name
  }

  connect (name) {
    if (!name) {
      const promises = []
      this.connectors.forEach((name) => {
        promises.push(this[name].connect())
      })
      return Promise.all(promises)
    } else {
      return this[name].connect()
    }
  }

  close (name) {
    if (!name) {
      this.connectors.forEach((name) => { this[name].close() })
    } else {
      this[name].close()
    }
    return true
  }
}
