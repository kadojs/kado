'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const View = require('../lib/View')
let view = new View()

describe('View',()=> {
  it('should construct',() => {
    let testView = new View()
    expect(testView).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(Object.keys(view.all()).length).to.equal(0)
  })
  it('should add a view',()=>{
    expect(view.add('home','home')).to.equal('home')
  })
  it('should get the view',()=>{
    expect(view.get('home')).to.equal('home')
  })
  it('should list the view',()=>{
    expect(Object.keys(view.all()).length).to.equal(1)
  })
  it('should remove the view',()=>{
    expect(view.remove('home')).to.equal('home')
  })
})
