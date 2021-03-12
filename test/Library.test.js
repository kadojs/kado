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
