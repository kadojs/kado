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
  const Val = require('../lib/Validate')
  const expect = Val.Assert
  const AssertionError = Val.AssertionError
  describe('assert',()=>{
    it('should assert an array', () => {
      expect.assert([],[])
      expect.assert.catch([],[1],'Array() does not equal Array(1)')
      expect.assert.catch([],{},
        'Array() does not equal Object([object Object])')
    })
    it('should assert a boolean',() => {
      expect.assert(true,true)
      expect.assert.catch(true,false,
        'boolean(true) does not equal boolean(false)')
    })
    it('should assert a date',() => {
      expect.assert(new Date(), new Date())
    })
    it('should fail two new dates over time',async ()=>{
      function getDate(){ return new Promise((resolve)=>{
        setTimeout(()=>{ resolve(new Date()) },2)
      }) }
      expect.assert.catch(new Date(), await getDate(),AssertionError)
    })
    it('should assert an error', () => {
      expect.assert(Error,Error)
    })
    it('should assert a function',() => {
      expect.assert(() => {}, () => {})
    })
    it('should assert a null',() => {
      expect.assert(null,null)
      expect.assert.catch(null,undefined,
        'null(null) does not equal undefined(undefined)')
    })
    it('should assert a number',() => {
      expect.assert(1,1)
    })
    it('should assert an object',() => {
      expect.assert({},{})
    })
    it('should assert a string',() => {
      expect.assert('','')
      expect.assert('foo','foo')
    })
    it('should assert an undefined',() => {
      expect.assert(undefined,undefined)
      expect.assert.catch(undefined,null,
        'undefined(undefined) does not equal null(null)')
    })
  })
  describe('eq',()=>{
    it('should eq array',() => {
      const arr1 = []
      expect.eq(arr1,arr1)
      expect.eq.catch({},{},
        'Object([object Object]) does not ' +
        'reference equal Object([object Object])')
      expect.eq.catch([],[],'Array() does not reference equal Array()')
      expect.eq.catch([],{},
        'Array() does not reference equal Object([object Object])')
    })
    it('should eq boolean',() => {
      expect.eq(true,true)
      expect.eq.catch(true,false,'boolean(true) does not equal boolean(false)')
    })
    it('should eq null',() => {
      expect.eq(null,null)
      expect.eq.catch(null,undefined,'null(null) does not equal boolean(true)')
    })
    it('should eq object',() => {
      const obj1 = {}
      expect.eq(obj1,obj1)
      expect.eq.catch(obj1,[],
        'Object([object Object]) does not reference equal Array()')
    })
    it('should eq string',() =>{
      expect.eq('','')
      expect.eq('foo','foo')
    })
  })
  describe('eqDeep',()=>{
    it('should eq an object',() => {
      expect.eq(Val.eqDeep({},{}))
      expect.eq(Val.eqDeep({},[]),false)
    })
    it('should eq an array',()=>{
      expect.eq(Val.eqDeep([],[]))
      expect.eq(Val.eqDeep([],{}),false)
    })
  })
  describe('getType',()=>{
    it('should get a string',()=>{
      expect.eq(Val.getType(''),'string')
    })
    it('should get a number',()=>{
      expect.eq(Val.getType(1),'number')
    })
    it('should get a array',()=>{
      expect.eq(Val.getType([]),'Array')
    })
    it('should get a object',()=>{
      expect.eq(Val.getType({}),'Object')
    })
    it('should get a null',()=>{
      expect.eq(Val.getType(null),'null')
    })
    it('should get a undefined',()=>{
      expect.eq(Val.getType(),'undefined')
      expect.eq.catch(Val.getType(''),'undefined',
        'string(string) does not equal string(undefined)')
    })
    it('should get a boolean',()=>{
      expect.eq(Val.getType(true),'boolean')
      expect.eq.catch(Val.getType('false'),'boolean',
        'string(string) does not equal string(boolean)')
      expect.eq.catch(Val.getType('+00000000'),'boolean',
        'string(string) does not equal string(boolean)')
    })
  })
  describe('isType',()=>{
    it('should identify a string',()=>{
      expect.eq(Val.isType('string',''))
    })
    it('should identify a number',()=>{
      expect.eq(Val.isType('number',1))
    })
    it('should identify a array',()=>{
      expect.eq(Val.isType('Array',[]))
    })
    it('should identify a object',()=>{
      expect.eq(Val.isType('Object',{}))
    })
    it('should identify a null',()=>{
      expect.eq(Val.isType('null',null))
    })
    it('should identify an undefined',()=>{
      expect.eq(Val.isType('undefined',undefined))
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
      expect.isType('Validate',Val.getInstance())
    })
  })
  describe('with instance',()=>{
    it('should check above',()=>{
      expect.eq(new Val(5).above(4))
    })
    it('should check below',()=>{
      expect.eq(new Val(5).below(6))
    })
    it('should check equal',()=>{
      expect.eq(new Val(1).equal(1))
    })
    it('should check is type')
    it('should check min')
    it('should check max')
    it('should check not')
  })
  it('should construct',() =>{
    let testValidate = new Val()
    expect.eq(Val.getType(testValidate),'Validate')
  })
  it('should check for Array',() => {
    expect.eq(Val.eqDeep([],[]), true)
    expect.eq(Val.eqDeep([],{}),false)
  })
  it('should check for Boolean',() => {
    expect.eq(true)
    expect.eq.catch(true,false,'boolean(true) does not equal boolean(false)')
  })
  it('should check for Date',() => {
    const date = new Date()
    expect.assert(date,date)
  })
  it('should check for Error',() => {
    expect.eqDeep(new Error('foo'),new Error('foo'))
  })
  it('should check for Function',() => {
    expect.assert(() => {},() => {})
  })
  it('should check for Generator')
  it('should check for GeneratorFunction')
  it('should check for Infinity',() => {
    expect.eq(Infinity,Infinity)
  })
  it('should check for InternalError')
  it('should check for JSON')
  it('should check for Map')
  //Equality comparison with NaN always evaluates to false
  it('should check for NaN',() => {
    expect.eqDeep(NaN,NaN)
  })
  it('should check for null', () => {
    expect.eqDeep(null,null)
    expect.eqDeep.catch(null,undefined,
      'null(null) does not deep equal undefined(undefined)')
  })
  it('should check for Number', () => {
    expect.eq(1,1)
    expect.eq.catch(1,'',AssertionError)
    expect.eq.catch(1,true,AssertionError)
  })
  it('should check for Promise')
  it('should check for RangeError')
  it('should check for ReferenceError')
  it('should check for RegExp')
  it('should check for String',() => {
    expect.eq('','')
    expect.eq('foo','foo')
    expect.eq.catch('foo','bar',AssertionError)
  })
  it('should check for Symbol')
  it('should check for SyntaxError')
  it('should check for TypedArray')
  it('should check for TypeError')
  it('should check for Undefined', () => {
    expect.eq(undefined,undefined)
    expect.eq.catch(undefined,null,AssertionError)
  })
})