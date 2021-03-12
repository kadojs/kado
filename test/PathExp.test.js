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
const PathExp = require('../lib/PathExp')
runner.suite('PathExp', (it) => {
  it('should instantiate', () => {
    Assert.isType('PathExp', new PathExp('/'))
  })
  it('should match', () => {
    const path = new PathExp('/user/:user')
    const params = {}
    Assert.eq(path.match('/user/1', params), true)
    Assert.eq(params.user, '1')
  })
  it('should match against /user/:name/profile/:action', () => {
    const path = new PathExp('/user/:name/profile/:action')
    const params = {}
    Assert.eq(path.match('/user/foo/profile/settings', params), true)
    Assert.eq(params.name, 'foo')
    Assert.eq(params.action, 'settings')
  })
  it('should match against /user/:name/:action', () => {
    const path = new PathExp('/user/:name/:action')
    const params = {}
    Assert.eq(path.match('/user/foo/settings', params), true)
    Assert.eq(params.name, 'foo')
    Assert.eq(params.action, 'settings')
  })
  it('should not match against /user/list/:action?a=b&c=d', () => {
    const path = new PathExp('/user/list/:action?a=b&c=d')
    const params = {}
    Assert.eq(path.match('user/list/settings?a=bla&c=dah', params), false)
    Assert.eq(params.action, undefined)
  })
  it('should match against /user/list/:action?a=b&c=d after url.parse', () => {
    const path = new PathExp('/user/list/:action')
    const params = {}
    const url = new URL('http://localhost/user/list/settings?a=bah&c=dah')
    Assert.eq(path.match(url.pathname, params), true)
    Assert.eq(params.action, 'settings')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
