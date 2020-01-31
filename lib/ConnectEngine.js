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

module.exports = class ConnectEngine {
  constructor () {
    this.engine = null
  }

  setEngine (instance) {
    if (!(instance instanceof Object)) {
      throw new Error(`Needed Object for engine and got ${instance}`)
    }
    this.engine = instance
    return this.engine
  }

  resetEngine () {
    this.engine = null
    return true
  }

  checkEngine () {
    if (!this.engine) throw new Error('No Connect Engine set')
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
