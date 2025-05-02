/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Permission = require('../lib/Permission')
runner.suite('Permission', (it) => {
  const permission = new Permission()
  it('should construct', () => {
    Assert.isType('Permission', new Permission())
  })
  it('should be empty', () => {
    Assert.eq(permission.all().length, 0)
  })
  it('should add a permission', () => {
    Assert.eqDeep(
      permission.add('foo', 'foo'),
      { name: 'foo', description: 'foo' }
    )
  })
  it('should show the permission exists', () => {
    Assert.eq(permission.exists('foo'), true)
  })
  it('should get the permission', () => {
    Assert.eq(permission.get('foo').name, 'foo')
  })
  it('should be allowed', () => {
    Assert.eq(permission.allowed('foo'), true)
  })
  it('should not be allowed against a set', () => {
    Assert.eq(permission.allowed('foo', []), false)
  })
  it('should digest keys from per set', () => {
    Assert.eq(permission.digest().length, 1)
  })
  it('should return all permissions', () => {
    Assert.eq(permission.all().length, 1)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
