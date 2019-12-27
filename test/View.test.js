'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('View',()=> {
  const { expect } = require('chai')
  const View = require('../lib/View')
  //const ViewHelper = require('../lib/view/mustache.js')
  const ViewHelper = class {}
  const handlerName = 'mustache'
  let view = new View()
  it('should construct',() => {
    let testView = new View()
    expect(testView).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(Object.keys(view.all()).length).to.equal(0)
  })
  it('should error getting an engine with no active handler',()=>{
    expect(view.getEngine).to.throw(Error)
  })
  it('should add a handler',()=>{
    let instance = new ViewHelper()
    expect(view.addHandler(handlerName,instance)).to.equal(handlerName)
  })
  it('should get a handler',()=>{
    expect(view.getHandler(handlerName)).to.be.an('object')
  })
  it('should activate a handler',()=>{
    expect(view.activateHandler(handlerName)).to.equal(handlerName)
  })
  it('should provide an engine now',()=>{
    expect(view.getEngine()).to.be.an('object')
  })
  it('should show in all handlers',()=>{
    expect(Object.keys(view.allHandlers()).length).to.equal(1)
  })
  it('should remove a handler',()=>{
    expect(view.removeHandler(handlerName)).to.equal(handlerName)
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
