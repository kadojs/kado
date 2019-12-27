'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
