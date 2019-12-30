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
  const Val = require('../lib/Validate')
  const Assert = Val.Assert
  const AssertionError = Val.AssertionError
  describe('assert',()=>{
    it('should assert an array', () => {
      Assert.eqDeep([],[])
      Assert.eqDeep.catch([],[1],'Array() does not deep equal Array(1)')
      Assert.eq.catch([],{},
        'Array() does not reference equal Object([object Object])')
    })
    it('should assert a boolean',() => {
      Assert.eq(true,true)
      Assert.eq.catch(true,false,'boolean(true) does not equal boolean(false)')
    })
    it('should assert a date',() => {
      Assert.assert(new Date(), new Date())
    })
    it('should fail two new dates over time',async ()=>{
      function getDate(){ return new Promise((resolve)=>{
        setTimeout(()=>{ resolve(new Date()) },2)
      }) }
      Assert.assert.catch(new Date(), await getDate(),AssertionError)
    })
    it('should assert an error', () => {
      Val.assert(Error, Error)
    })
    it('should assert a function',() => {
      Val.assert(() => {}, () => {})
    })
    it('should assert a null',() => {
      Val.assert(null,null)
      Val.catch(Val.assert.bind(null,null,undefined),
        'Assertion failed null does not equal undefined')
    })
    it('should assert a number',() => {
      Val.assert(1,1)
    })
    it('should assert an object',() => {
      Val.assert({},{})
    })
    it('should assert a string',() => {
      Val.assert('','')
      Val.assert('foo','foo')
    })
    it('should assert an undefined',() => {
      Val.assert(undefined,undefined)
      Val.catch(Val.assert.bind(null,undefined,null),
        'Assertion failed undefined does not equal null')
    })
  })
  describe('eq',()=>{
    it('should eq array',() => {
      const arr1 = []
      Assert.eq(arr1,arr1)
      Assert.eq.catch({},{},
        'Object([object Object]) does not ' +
        'reference equal Object([object Object])')
      Assert.eq.catch([],[],'Array() does not reference equal Array()')
      Assert.eq.catch([],{},
        'Array() does not reference equal Object([object Object])')
    })
    it('should eq boolean',() => {
      Val.eq(true,true)
      Val.catch(Val.eq.bind(null,true,false),
        'Assertion failed true does not equal false')
    })
    it('should eq null',() => {
      Val.eq(null,null)
      Val.catch(Val.eq.bind(null,null,undefined),
        'Assertion failed null does not equal undefined')
    })
    it('should eq object',() => {
      Val.eq({},{})
      Val.catch(Val.eq.bind(null,{},[]),
        'Assertion failed {} does not equal []')
    })
    it('should eq string',() =>{
    Val.eq('','')
    Val.eq('foo','foo')
    })
  })
  describe('eqDeep',()=>{
    it('should eq an object',() => {
      Assert.eq(Val.eqDeep({},{}))
      Assert.eq(Val.eqDeep({},[]),false)
    })
    it('should eq an array',()=>{
      Assert.eq(Val.eqDeep([],[]))
      Assert.eq(Val.eqDeep([],{}),false)
    })
  })
  describe('getType',()=>{
    it('should get a string',()=>{
      Assert.eq(Val.getType(''),'string')
    })
    it('should get a number',()=>{
      Assert.eq(Val.getType(1),'number')
    })
    it('should get a array',()=>{
      Assert.eq(Val.getType([]),'Array')
    })
    it('should get a object',()=>{
      Assert.eq(Val.getType({}),'Object')
    })
    it('should get a null',()=>{
      Assert.eq(Val.getType(null),'null')
    })
    it('should get a undefined',()=>{
      Assert.eq(Val.getType(),'undefined')
      Assert.eq.catch(Val.getType(''),'undefined',
        'string(string) does not equal string(undefined)')
    })
    it('should get a boolean',()=>{
      Assert.eq(Val.getType(true),'boolean')
      Assert.eq.catch(Val.getType('false'),'boolean',
        'string(string) does not equal string(boolean)')
      Assert.eq.catch(Val.getType('+00000000'),'boolean',
        'string(string) does not equal string(boolean)')
    })
  })
  describe('isType',()=>{
    it('should identify a string',()=>{
      Assert.eq(Val.isType('string',''))
    })
    it('should identify a number',()=>{
      Assert.eq(Val.isType('number',1))
    })
    it('should identify a array',()=>{
      Assert.eq(Val.isType('Array',[]))
    })
    it('should identify a object',()=>{
      Assert.eq(Val.isType('Object',{}))
    })
    it('should identify a null',()=>{
      Assert.eq(Val.isType('null',null))
    })
    it('should identify an undefined',()=>{
      Assert.eq(Val.isType('undefined',undefined))
    })
  })
  describe('isAbove',()=>{
    it('should fail on invalid input')
    it('should be true if a number is above base')
    it('should be false if a number is below a base')
  })
  describe('isBelow',()=>{
    it('should fail on invalid input')
    it('should be true if a number is below a base')
    it('should be false if a number is above a base')
  })
  describe('minimum',()=>{
    it('should fail on invalid input')
    it('should be true if a number is above or equal to a base')
    it('should be false if a number is below a base')
  })
  describe('maximum',()=>{
    it('should fail on invalid input')
    it('should be true if a number is below or equal to a base')
    it('should be false if a number is above a base')
  })
  describe('neq',()=>{
    it('should be false on true neq true')
  })
  describe('getInstance',()=>{
    it('should return an instance',()=>{
      Assert.isType('Validate',Val.getInstance())
    })
  })
  describe('with instance',()=>{
    it('should check above',()=>{
      Assert.eq(new Val(5).above(4))
    })
    it('should check below',()=>{
      Assert.eq(new Val(5).below(6))
    })
    it('should check equal',()=>{
      Assert.eq(new Val(1).equal(1))
    })
    it('should check is type')
    it('should check min')
    it('should check max')
    it('should check not')
  })
  it('should construct',() =>{
    let testValidate = new Val()
    Val.assert(Val.getType(testValidate),'Validate')
  })
  it('should check for Array',() => {
    Val.assert(Val.eqDeep([],[]), true)
    Val.assert(Val.eqDeep([],{}),false)
  })
  it('should check for Boolean',() => {
    Val.eq(Val.eqDeep(true,true),true)
    Val.eq(Val.eqDeep(true,false),false)
  })
  it('should check for Date',() => {
    const date = new Date()
    Val.assert(Val.eqDeep(date,date),true)
  })
  it('should check for Error',() => {
    Val.assert(Val.eqDeep(new Error('foo'),new Error('foo')),true)
  })
  it('should check for Function',() => {
    //Line 47 fails with validation.assert // passes w/ validate.eq
    expect(Val.assert(() => {},() => {})).to.equal(true)
  })
  it('should check for Generator')
  it('should check for GeneratorFunction')
  it('should check for Infinity',() => {
    Val.assert(Val.eqDeep(Infinity,Infinity),true)
  })
  it('should check for InternalError')
  it('should check for JSON')
  it('should check for Map')
  //Equality comparison with NaN always evaluates to false
  it('should check for NaN',() => {
    Val.eq(Val.eqDeep(NaN,NaN),false)
  })
  it('should check for null', () => {
    Val.assert(Val.eqDeep(null,null),true)
    // ***ASK BRYAN ABOUT LINE 63***
    Val.assert.bind(Val.eqDeep(null,null,undefined),'Assertion failed null does not equal undefined')
  })
  it('should check for Number', () => {
    Val.assert(Val.eqDeep(1,1),true)
    Val.eq(Val.eqDeep(1,''),false)
    Val.eq(Val.eqDeep(1,true),false)
  })
  it('should check for Promise')
  it('should check for RangeError')
  it('should check for ReferenceError')
  it('should check for RegExp')
  it('should check for String',() => {
    Val.assert(Val.eqDeep('',''),true)
    Val.assert(Val.eqDeep('foo','foo'),true)
    // ***Have Bryan check line 78 syntax***
    Val.assert.bind(Val.eqDeep(null,'foo','bar'),
      'Assertion failed foo does not equal bar')
  })
  it('should check for Symbol')
  it('should check for SyntaxError')
  it('should check for TypedArray')
  it('should check for TypeError')
  it('should check for Undefined', () => {
    Val.assert(Val.eqDeep(undefined,undefined),true)
    // ***Have Bryan check line 87 syntax***
    Val.assert.bind(Val.eqDeep(null,undefined,null),
      'Assertion failed undefined does not equal null')
  })
})