'use strict';
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

describe('Library',() => {
  const { expect } = require('chai')
  const Library = require('../lib/Library')
  let library = new Library()
  it('should construct',() => {
    let testLibrary = new Library()
    expect(testLibrary).to.be.an('object')
  })
  it('should be empty',() => {
    expect(Object.keys(library.paths).length).to.equal(0)
    expect(Object.keys(library.libraries).length).to.equal(0)
  })
  it('should add a search path',() => {
    expect(library.addPath('/test')).to.equal('/test')
  })
  it('should show a path exists',() => {
    expect(library.existsPath('/test')).to.equal('/test')
  })
  it('should remove a path',() => {
    expect(library.removePath('/test')).to.equal('/test')
  })
  it('should add a library',() => {
    expect(library.add('test','/test')).to.equal('/test')
  })
  it('should show the library exists',() => {
    expect(library.exists('test')).to.equal('/test')
  })
  it('should error when no library is found',() => {
    expect(library.exists('test2')).to.equal(false)
  })
  it('should search for a library',() => {
    expect(library.search('test')).to.equal('/test')
  })
  it('should remove a library',() => {
    expect(library.remove('test')).to.equal('test')
  })
  it('should not have the library',() => {
    expect(library.exists('test')).to.equal(false)
  })
})
