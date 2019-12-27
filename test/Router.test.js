'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('Route',()=> {
  const { expect } = require('chai')
  const Router = require('../lib/Router')
  let router = new Router()
  it('should construct',() => {
    let testRouter = new Router()
    expect(testRouter).to.be.an('object')
  })
  it('should have no routes',()=>{
    expect(Object.keys(router.all()).length).to.equal(0)
  })
  it('should add a route',()=>{
    expect(router.add('home','/')).to.equal('/')
  })
  it('should have a route',()=>{
    expect(router.get('home')).to.equal('/')
  })
  it('should accept a route update',()=>{
    expect(router.update('home','/home')).to.equal('/home')
  })
  it('should show the route update',()=>{
    expect(router.get('home')).to.equal('/home')
  })
  it('should remove the route',()=>{
    expect(router.remove('home')).to.equal('/home')
  })
  it('should not have the route',()=>{
    try {
      router.get('home')
    } catch(e){
      expect(e.message).to.equal('Requested undefined URI: home')
    }
  })
  it('should add a route via passthrough',()=>{
    expect(router.p('/home')).to.equal('/home')
  })
  it('should show the route in all',()=>{
    expect(Object.keys(router.all()).length).to.equal(1)
  })
  it('should export the routes for template usage',()=>{
    expect(router.allForTemplate()._home).to.equal('/home')
  })
})
