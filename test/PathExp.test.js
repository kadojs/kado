/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
  it('should match against /c/package-label/some/file/somewhere/foo.js', () => {
    const path = new PathExp('/c/:package/:__all')
    const params = {}
    const url = new URL('http://localhost/c/package-label/some/file/somewhere/foo.js')
    Assert.eq(path.match(url.pathname, params), true)
    Assert.eq(params.package, 'package-label')
    Assert.eq(params.__all, 'some/file/somewhere/foo.js')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
