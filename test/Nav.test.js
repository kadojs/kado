'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Nav = require('../lib/Nav')
let nav = new Nav()

describe('Nav',()=> {
  it('should construct',() => {
    let testAsset = new Nav()
    expect(testAsset).to.be.an('object')
  })
  it('should be empty',() => {
    expect(nav.all().length).to.equal(0)
    expect(Object.keys(nav.allNav()).length).to.equal(0)
  })
  it('should add a nav group',() => {
    expect(nav.addGroup('/test','Test', 'fa fa-plus').uri).to.equal('/test')

  })
  it('should get nav entry by name', () => {
    expect(Object.keys(nav.all()).length).to.equal(1)
  })
  it('should add Nav Item', () => {
    expect(nav.addItem('Test','/test', 'Test').uri).to.equal('/test')
  })
  it('should return built nav entries' , () => {
    expect(Object.keys(nav.all()).length).to.equal(1)
  })
})

