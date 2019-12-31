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

describe('Nav',()=> {
  const { expect } = require('../lib/Validate')
  const Nav = require('../lib/Navigation')
  let nav = new Nav()
  it('should construct',() => {
    expect.isType('Nav',new Nav())
  })
  it('should be empty',() => {
    expect.eq(nav.all().length,0)
    expect.eq(Object.keys(nav.allNav()).length,0)
  })
  it('should add a nav group',() => {
    expect.eq(nav.addGroup('/test','Test', 'fa fa-plus').uri,'/test')
  })
  it('should get nav entry by name', () => {
    expect.eq(Object.keys(nav.all()).length,1)
  })
  it('should add Nav Item', () => {
    expect.eq(nav.addItem('Test','/test', 'Test').uri,'/test')
  })
  it('should return built nav entries' , () => {
    expect.eq(Object.keys(nav.all()).length,1)
  })
})
