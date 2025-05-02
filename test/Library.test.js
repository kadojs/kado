/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Library = require('../lib/Library')
runner.suite('Library', (it) => {
  const library = new Library()
  it('should construct', () => {
    Assert.isType('Library', new Library())
  })
  it('should be empty', () => {
    Assert.eq(Object.keys(library.paths).length, 0)
    Assert.eq(Object.keys(library.libraries).length, 0)
  })
  it('should add a search path', () => {
    Assert.eq(library.addPath('/test'), '/test')
  })
  it('should show a path exists', () => {
    Assert.eq(library.existsPath('/test'), '/test')
  })
  it('should remove a path', () => {
    Assert.eq(library.removePath('/test'), '/test')
  })
  it('should add a library', () => {
    Assert.eq(library.add('test', '/test'), '/test')
  })
  it('should show the library exists', () => {
    Assert.eq(library.exists('test'), '/test')
  })
  it('should error when no library is found', () => {
    Assert.eq(library.exists('test2'), false)
  })
  it('should search for a library', () => {
    Assert.eq(library.search('test'), '/test')
  })
  it('should remove a library', () => {
    Assert.eq(library.remove('test'), 'test')
  })
  it('should not have the library', () => {
    Assert.eq(library.exists('test'), false)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
