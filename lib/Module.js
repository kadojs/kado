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
const { expect } = require('./Assert')

class Module {
  constructor () {
    this.name = 'module'
    this.title = 'Module'
    this.description = 'Some module'
    this.language = { packs: [] }
  }

  db (app) {
    expect.isType('Application', app)
  }

  search (app, keywords, start, limit) {
    expect.isType('Application', app)
    expect.isType('Array', keywords)
    expect.isType('number', start)
    expect.isType('number', limit)
    return {}
  }

  main (app) {
    expect.isType('Application', app)
  }

  cli (app) {
    expect.isType('Application', app)
  }
}
module.exports = Module
