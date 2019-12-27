'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
