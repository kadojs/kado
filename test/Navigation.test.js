/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Navigation = require('../lib/Navigation')
runner.suite('Navigation', (it) => {
  const nav = new Navigation()
  it('should construct', () => {
    Assert.isType('Navigation', new Navigation())
  })
  it('should be empty', () => {
    Assert.eq(nav.all().length, 0)
    Assert.eq(Object.keys(nav.allNav()).length, 0)
  })
  it('should add a nav group', () => {
    Assert.eq(nav.addGroup('/test', 'Test', 'fa fa-plus').uri, '/test')
  })
  it('should get nav entry by name', () => {
    Assert.eq(Object.keys(nav.all()).length, 1)
  })
  it('should add Nav Item', () => {
    Assert.eq(nav.addItem('Test', '/test', 'Test').uri, '/test')
  })
  it('should return built nav entries', () => {
    Assert.eq(Object.keys(nav.all()).length, 1)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
