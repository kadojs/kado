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
