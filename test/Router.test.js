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
const runner = require('../lib/TestRunner').getInstance('Kado')
const { expect } = require('../lib/Assert')
const Router = require('../lib/Router')
runner.suite('Router',(it)=>{
  let router = new Router()
  it('should construct',() => {
    expect.isType('Router',new Router())
  })
  it('should have no routes',()=>{
    expect.eq(Object.keys(router.all()).length,0)
  })
  it('should add a route',()=>{
    expect.eq(router.add('home','/'),'/')
  })
  it('should have a route',()=>{
    expect.eq(router.get('home'),'/')
  })
  it('should accept a route update',()=>{
    expect.eq(router.update('home','/home'),'/home')
  })
  it('should show the route update',()=>{
    expect.eq(router.get('home'),'/home')
  })
  it('should remove the route',()=>{
    expect.eq(router.remove('home'),'/home')
  })
  it('should not have the route',()=>{
    try {
      router.get('home')
    } catch(e){
      expect.eq(e.message,'Requested undefined URI: home')
    }
  })
  it('should add a route via passthrough',()=>{
    expect.eq(router.p('/home'),'/home')
  })
  it('should show the route in all',()=>{
    expect.eq(Object.keys(router.all()).length,1)
  })
  it('should export the routes for template usage',()=>{
    expect.eq(router.allForTemplate()._home,'/home')
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
