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

describe('Util',()=>{
  const { expect } = require('../lib/Validate')
  const Util = require('../lib/Util')
  const util = new Util()
  const render = (s)=>{return s}
  it('should construct',()=>{
    expect.isType('Util',new Util())
  })
  it('should have the short timezone',()=>{
    expect.isType('string',util.timezoneShort)
  })
  it('should capitalize a string',()=>{
    expect.eq(util.capitalize('test'),'Test')
  })
  it('should print a date',()=>{
    expect.isType('string',util.printDate(new Date()))
  })
  it('should escape and truncate a string',()=>{
    expect.eq(util.escapeAndTruncate()(
      '2,<span>fooo bar</span>',render),'fo')
  })
  it('should check for bool true',()=>{
    expect.eq(util.is()('true,1,2',render),'1')
    expect.eq(util.is()('false,1,2',render),'2')
  })
  it('should check for comparison',()=>{
    expect.eq(util.compare()('1,1,1,2',render),'1')
    expect.eq(util.compare()('1,2,1,2',render),'2')
  })
  it('should expose pretty bytes',()=>{
    expect.eq(util.prettyBytes(1000000),'1 MB')
  })
})
