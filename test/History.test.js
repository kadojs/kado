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
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const History = require('../lib/History')
runner.suite('History', (it) => {
  const history = new History()
  it('should construct', () => {
    Assert.isType('History', new History())
  })
  it('should be empty', () => {
    Assert.eq(history.all().length, 0)
  })
  it('should add crumb entry', () => {
    Assert.eq(history.add('/test', 'Test', 'fa fa-plus').name, 'Test')
  })
  it('should save the entries', () => {
    const req = { session: {} }
    history.save(req)
    Assert.isType('Array', req.session.breadcrumb)
  })
  it('should restore the entries', () => {
    const req = { session: {} }
    req.session.breadcrumb = [{ uri: '/test', name: 'Test', icon: 'fa fa-plus' }]
    history.restore(req)
    Assert.eq(history.all().length, 1)
  })
  it('should accept middleware request', () => {
    const Nav = require('../lib/Navigation')
    const Util = require('../lib/Util')
    const app = { nav: new Nav(), util: new Util() }
    app.nav.addGroup('/test', 'Test', 'fa-fa-plus')
    const req = { session: {}, url: '/test', method: 'GET' }
    Assert.isType('Array', history.middleware(app, req))
    Assert.eq(history.all()[0].name, 'Test')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
