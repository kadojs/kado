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
