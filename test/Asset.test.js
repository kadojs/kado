/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Asset = require('../lib/Asset')
runner.suite('Asset', (it) => {
  const asset = new Asset()
  it('should construct', () => {
    Assert.isType('Asset', new Asset())
  })
  it('should be empty', () => {
    Assert.eq(asset.get().length, 0)
    Assert.eq(asset.getOnce().length, 0)
  })
  it('should add an asset', () => {
    Assert.eq(asset.add('/test', 'text/javascript'), '/test')
  })
  it('should add a second asset', () => {
    Assert.eq(asset.add('/test2', 'text/css'), '/test2')
  })
  it('should show both assets exists', () => {
    Assert.eq(asset.exists('/test').uri, '/test')
    Assert.eq(asset.exists('/test2').uri, '/test2')
    // remove the 2nd asset
    Assert.eq(asset.remove('/test2').uri, '/test2')
  })
  it('should add an asset once', () => {
    Assert.eq(asset.addOnce('/test-once', 'image/png'), '/test-once')
  })
  it('should show an asset exists once', () => {
    Assert.eq(asset.existsOnce('/test-once').uri, '/test-once')
  })
  it('should show all', () => {
    Assert.eq(asset.all().length, 2)
  })
  it('should work with filter on all', () => {
    Assert.eq(asset.all('text/plain').length, 0)
  })
  it('should have emptied one time assets', () => {
    Assert.eq(asset.getOnce().length, 0)
  })
  it('should add another one off asset', () => {
    Assert.eq(asset.addOnce('/test-once'), '/test-once')
  })
  it('should remove asset', () => {
    Assert.eq(asset.remove('/test').uri, '/test')
  })
  it('should have no assets', () => {
    Assert.eq(asset.get().length, 0)
  })
  it('should remove one time asset', () => {
    Assert.eq(asset.removeOnce('/test-once').uri, '/test-once')
  })
  it('should have no assets', () => {
    Assert.eq(asset.get().length, 0)
    Assert.eq(asset.getOnce().length, 0)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
