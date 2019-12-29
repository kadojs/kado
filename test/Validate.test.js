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
    Validate.eq(Validate.eqDeep(true,true),true)
    Validate.eq(Validate.eqDeep(true,false),false)
  })
  it('should check for Date',() => {
    const date = new Date()
    Validate.assert(Validate.eqDeep(date,date),true)
  })
  it('should check for Error',() => {
    Validate.assert(Validate.eqDeep(new Error('foo'),new Error('foo')),true)
  })
  it('should check for Function',() => {
    //Line 47 fails with validation.assert // passes w/ validate.eq
    expect(Validate.assert(() => {},() => {})).to.equal(true)
  })
  it('should check for Generator')
  it('should check for GeneratorFunction')
  it('should check for Infinity',() => {
    Validate.assert(Validate.eqDeep(Infinity,Infinity),true)
  })
  it('should check for InternalError')
  it('should check for JSON')
  it('should check for Map')
  //Equality comparison with NaN always evaluates to false
  it('should check for NaN',() => {
    Validate.eq(Validate.eqDeep(NaN,NaN),false)
  })
  it('should check for null', () => {
    Validate.assert(Validate.eqDeep(null,null),true)
    // ***ASK BRYAN ABOUT LINE 63***
    Validate.assert.bind(Validate.eqDeep(null,null,undefined),'Assertion failed null does not equal undefined')
  })
  it('should check for Number', () => {
    Validate.assert(Validate.eqDeep(1,1),true)
    Validate.eq(Validate.eqDeep(1,''),false)
    Validate.eq(Validate.eqDeep(1,true),false)
  })
  it('should check for Promise')
  it('should check for RangeError')
  it('should check for ReferenceError')
  it('should check for RegExp')
  it('should check for String',() => {
    Validate.assert(Validate.eqDeep('',''),true)
    Validate.assert(Validate.eqDeep('foo','foo'),true)
    // ***Have Bryan check line 78 syntax***
    Validate.assert.bind(Validate.eqDeep(null,'foo','bar'),'Assertion failed foo does not equal bar')
  })
  it('should check for Symbol')
  it('should check for SyntaxError')
  it('should check for TypedArray')
  it('should check for TypeError')
  it('should check for Undefined', () => {
    Validate.assert(Validate.eqDeep(undefined,undefined),true)
    // ***Have Bryan check line 87 syntax***
    Validate.assert.bind(Validate.eqDeep(null,undefined,null),'Assertion failed undefined does not equal null')
  })
})