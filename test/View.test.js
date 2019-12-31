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

describe('View',()=> {
  const { expect } = require('../lib/Validate')
  const View = require('../lib/View')
  //const ViewHelper = require('../lib/view/mustache.js')
  const ViewHelper = class {}
  const handlerName = 'mustache'
  let view = new View()
  it('should construct',() => {
    expect.isType('View',new View())
  })
  it('should be empty',()=>{
    expect.eq(Object.keys(view.all()).length,0)
  })
  it('should error getting an engine with no active handler',()=>{
    try {
      view.getEngine()
    } catch(e){
      expect.match(/no rendering handlers/,e.message)
    }
  })
  it('should add a handler',()=>{
    let instance = new ViewHelper()
    expect.eq(view.addHandler(handlerName,instance),handlerName)
  })
  it('should get a handler',()=>{
    expect.isType('ViewHelper',view.getHandler(handlerName))
  })
  it('should activate a handler',()=>{
    expect.eq(view.activateHandler(handlerName),handlerName)
  })
  it('should provide an engine now',()=>{
    expect.isType('ViewHelper',view.getEngine())
  })
  it('should show in all handlers',()=>{
    expect.eq(Object.keys(view.allHandlers()).length,1)
  })
  it('should remove a handler',()=>{
    expect.eq(view.removeHandler(handlerName),handlerName)
  })
  it('should add a view',()=>{
    expect.eq(view.add('home','home'),'home')
  })
  it('should get the view',()=>{
    expect.eq(view.get('home'),'home')
  })
  it('should list the view',()=>{
    expect.eq(Object.keys(view.all()).length,1)
  })
  it('should remove the view',()=>{
    expect.eq(view.remove('home'),'home')
  })
})
