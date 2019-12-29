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

describe('Validate',()=>{
  const { expect } = require('chai')
  const Validate = require('../lib/Validate')
  const validate = new Validate([])
  it('should construct',() =>{
    let testValidate = new Validate()
    Validate.assert(Validate.getType(testValidate),'Validate')
  })
  it('should check for Array',() => {
    Validate.assert(Validate.eqDeep([],[]), true)
    Validate.assert(Validate.eqDeep([],{}),false)
  })
  it('should check for Boolean',() => {
    expect(Validate.eq(true,true)).to.equal(true)
    expect(Validate.eq(true,false)).to.equal(false)
  })
  it('should check for Date',() => {
    const date = new Date()
    expect(Validate.assert(date,date)).to.equal(true)
  })
  it('should check for Error',() => {
    expect(Validate.assert(new Error('foo'),new Error('foo'))).to.equal(true)
  })
  it('should check for Function',() => {
    expect(Validate.assert(() => {},() => {})).to.equal(true)
  })
  it('should check for Generator')
  it('should check for GeneratorFunction')
  it('should check for Infinity',() => {
    expect(Validate.assert(Infinity,Infinity)).to.equal(true)
  })
  it('should check for InternalError')
  it('should check for JSON')
  it('should check for Map')
  //Equality comparison with NaN always evaluates to false
  it('should check for NaN',() => {
    expect(Validate.eq(NaN,NaN)).to.equal(false)
  })
  it('should check for null', () => {
    expect(Validate.assert(null,null)).to.equal(true)
    expect(Validate.assert.bind(null,null,undefined)).to.throw('Assertion failed null does not equal undefined')
  })
  it('should check for Number', () => {
    expect(Validate.assert(1,1)).to.equal(true)
    expect(Validate.eq(1,'')).to.equal(false)
    expect(Validate.eq(1,true)).to.equal(false)
  })
  it('should check for Promise')
  it('should check for RangeError')
  it('should check for ReferenceError')
  it('should check for RegExp')
  it('should check for String',() => {
    expect(Validate.assert('','')).to.equal(true)
    expect(Validate.assert('foo','foo')).to.equal(true)
    expect(Validate.assert.bind(null,'foo','bar')).to.throw('Assertion failed foo does not equal bar')
  })
  it('should check for Symbol')
  it('should check for SyntaxError')
  it('should check for TypedArray')
  it('should check for TypeError')
  it('should check for Undefined', () => {
    expect(Validate.assert(undefined,undefined)).to.equal(true)
    expect(Validate.assert.bind(null,undefined,null)).to.throw('Assertion failed undefined does not equal null')
  })
})