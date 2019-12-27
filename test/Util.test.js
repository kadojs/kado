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
  const { expect } = require('chai')
  const Util = require('../lib/Util')
  const util = new Util()
  const render = (s)=>{return s}
  it('should construct',()=>{
    let testUtil = new Util()
    expect(testUtil).to.be.an('object')
  })
  it('should have the short timezone',()=>{
    expect(util.timezoneShort).to.be.a('string')
  })
  it('should capitalize a string',()=>{
    expect(util.capitalize('test')).to.equal('Test')
  })
  it('should print a date',()=>{
    expect(util.printDate(new Date())).to.be.a('string')
  })
  it('should escape and truncate a string',()=>{
    expect(util.escapeAndTruncate()(
      '2,<span>fooo bar</span>',render)).to.equal('fo')
  })
  it('should check for bool true',()=>{
    expect(util.is()('true,1,2',render)).to.equal('1')
    expect(util.is()('false,1,2',render)).to.equal('2')
  })
  it('should check for comparison',()=>{
    expect(util.compare()('1,1,1,2',render)).to.equal('1')
    expect(util.compare()('1,2,1,2',render)).to.equal('2')
  })
  it('should expose pretty bytes',()=>{
    expect(util.prettyBytes(1000000)).to.equal('1 MB')
  })
})
