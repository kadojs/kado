/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')

class Module {
  constructor () {
    this.name = 'module'
    this.title = 'Module'
    this.description = 'Some module'
    this.language = { packs: [] }
  }

  db (app) {
    Assert.isType('Application', app)
  }

  search (app, keywords, start, limit) {
    Assert.isType('Application', app)
    Assert.isType('Array', keywords)
    Assert.isType('number', start)
    Assert.isType('number', limit)
    return {}
  }

  main (app) {
    Assert.isType('Application', app)
  }

  cli (app) {
    Assert.isType('Application', app)
  }
}
module.exports = Module
