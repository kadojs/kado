'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Event = require('../lib/Event')
let event = new Event()
event.addHandler('test',(options)=>{
  expect(options).to.be.an('object')
  expect(options.to).to.be.a('string')
  expect(options.text).to.be.a('string')
  expect(options.level).to.be.a('string')
  expect(options.levelInfo).to.be.an('object')
})

describe('Event',()=>{
  it('should construct',()=>{
    let testEvent = new Event()
    expect(testEvent).to.be.an('object')
  })
  it('should have no handlers',()=>{
    expect(event.allHandlers().length).to.equal(0)
  })
  it('should add a handler',()=>{
    expect(event.addHandler('test2',()=>{})).to.equal('test2')
  })
  it('should show a handler exists',()=>{
    expect(event.getHandler('test2').name).to.equal('test2')
  })
  it('should show the handler exists in the list',()=>{
    expect(Object.keys(event.allHandlers()).length).to.equal(1)
  })
  it('should remove a handler',()=>{
    expect(event.removeHandler('test2')).to.equal('test2')
  })
  it('should show all',()=>{
    expect(event.all().length).to.equal(2)
  })
  it('should work with filter on all',()=>{
    expect(event.all('text/plain').length).to.equal(0)
  })
  it('should have emptied one time assets',()=>{
    expect(event.getOnce().length).to.equal(0)
  })
  it('should add another one off asset',()=>{
    expect(event.addOnce('/test-once')).to.equal('/test-once')
  })
  it('should remove asset',()=>{
    expect(event.remove('/test')).to.equal(true)
  })
  it('should have no assets',()=>{
    expect(event.get().length).to.equal(0)
  })
  it('should remove one time asset',()=>{
    expect(event.removeOnce('/test-once')).to.equal(true)
  })
  it('should have no assets',()=>{
    expect(event.get().length).to.equal(0)
    expect(event.getOnce().length).to.equal(0)
  })
})
