'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Route = require('../lib/Route')
let route = new Route()

describe('Route',()=> {
  it('should construct',() => {
    let testRoute = new Route()
    expect(testRoute).to.be.an('object')
  })
  it('should have no routes',()=>{
    expect(Object.keys(route.all()).length).to.equal(0)
  })
  it('should add a route',()=>{
    expect(route.add('home','/')).to.equal('/')
  })
  it('should have a route',()=>{
    expect(route.get('home')).to.equal('/')
  })
  it('should accept a route update',()=>{
    expect(route.update('home','/home')).to.equal('/home')
  })
  it('should show the route update',()=>{
    expect(route.get('home')).to.equal('/home')
  })
  it('should remove the route',()=>{
    expect(route.remove('home')).to.equal('/home')
  })
  it('should not have the route',()=>{
    try {
      route.get('home')
    } catch(e){
      expect(e.message).to.equal('Requested undefined URI: home')
    }
  })
  it('should add a route via passthrough',()=>{
    expect(route.p('/home')).to.equal('/home')
  })
  it('should show the route in all',()=>{
    expect(Object.keys(route.all()).length).to.equal(1)
  })
  it('should export the routes for template usage',()=>{
    expect(route.allForTemplate()._home).to.equal('/home')
  })
})
