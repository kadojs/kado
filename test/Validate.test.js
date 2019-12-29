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
  describe('assert',()=>{
    it('should assert an array')
    it('should assert an object')
    it('should assert an date')
    it('should assert an error')
    it('should assert an function')
    it('should assert an string')
    it('should assert an number')
    it('should assert an null')
    it('should assert an undefined')
    it('should assert an boolean')
  })
  describe('eq',()=>{
    it('should eq string')
    it('should eq null')
    it('should eq boolean')
    it('should eq array')
    it('should eq object')
  })
  describe('eqDeep',()=>{
    it('should eq an object')
    it('should eq an array')
  })
  describe('getType',()=>{
    it('should get a string')
    it('should get a number')
    it('should get a array')
    it('should get a object')
    it('should get a null')
    it('should get a undefined')
    it('should get a boolean')
  })
  describe('isType',()=>{
    it('should identify a string')
    it('should identify a number')
    it('should identify a array')
    it('should identify a object')
    it('should identify a null')
    it('should identify a undefined')
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
    it('should return an instance')
  })
  describe('with instance',()=>{
    it('should check above',()=>{
      Val.assert(new Val(5).above(4),true)
    })
    it('should check below',()=>{
      Val.assert(new Val(5).below(6),true)
    })
    it('should check equal')
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
    Val.assert.bind(Val.eqDeep(null,'foo','bar'),'Assertion failed foo does not equal bar')
  })
  it('should check for Symbol')
  it('should check for SyntaxError')
  it('should check for TypedArray')
  it('should check for TypeError')
  it('should check for Undefined', () => {
    Val.assert(Val.eqDeep(undefined,undefined),true)
    // ***Have Bryan check line 87 syntax***
    Val.assert.bind(Val.eqDeep(null,undefined,null),'Assertion failed undefined does not equal null')
  })
})