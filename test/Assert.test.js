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
const {Assert,expect,AssertionError} = require('../lib/Assert')
const runner = require('../lib/TestRunner').getInstance('Kado')
const assert = runner.suite('Assert',(it)=>{
  it('should construct',()=>{
    expect.isType('Assert',new Assert(5))
  })
  it('should return an instance',() => {
    expect.isType('Assert',Assert.getInstance())
  })
  it('should be false on true neq true',() => {
    expect.eq(Assert.neq.catch(true,true,AssertionError))
  })
})
assert.suite('assert',(it)=>{
  it('should assert an array',() => {
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
    expect.assert(new Date(),new Date())
  })
  it('should fail two new dates over time',async () => {
    function getDate(){
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Date())
        },2)
      })
    }
    expect.assert.catch(new Date(),await getDate(),AssertionError)
  })
  it('should assert an error',() => {
    expect.assert(Error,Error)
  })
  it('should assert a function',() => {
    expect.assert(() => {
    },() => {
    })
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
assert.suite('eq',(it)=>{
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
  it('should eq string',() => {
    expect.eq('','')
    expect.eq('foo','foo')
  })
})
assert.suite('eqDeep',(it)=>{
  it('should eq an array',() => {
    expect.eq(Assert.eqDeep([],[]))
    expect.eq(Assert.eqDeep.catch([],{},AssertionError))
  })
  it('should eq an object',() => {
    expect.eq(Assert.eqDeep({},{}))
    expect.eq(Assert.eqDeep.catch({},[],AssertionError))
  })
})
assert.suite('getType',(it)=>{
  it('should get a array',() => {
    expect.eq(Assert.getType([]),'Array')
  })
  it('should get a boolean',() => {
    expect.eq(Assert.getType(true),'boolean')
    expect.eq.catch(Assert.getType('false'),'boolean',
      'string(string) does not equal string(boolean)')
    expect.eq.catch(Assert.getType('+00000000'),'boolean',
      'string(string) does not equal string(boolean)')
  })
  it('should get a null',() => {
    expect.eq(Assert.getType(null),'null')
  })
  it('should get a number',() => {
    expect.eq(Assert.getType(1),'number')
  })
  it('should get a object',() => {
    expect.eq(Assert.getType({}),'Object')
  })
  it('should get a string',() => {
    expect.eq(Assert.getType(''),'string')
  })
  it('should get a undefined',() => {
    expect.eq(Assert.getType(),'undefined')
    expect.eq.catch(Assert.getType(''),'undefined',
      'string(string) does not equal string(undefined)')
  })
})
assert.suite('isType',(it)=>{
  it('should identify a array',() => {
    expect.eq(Assert.isType('Array',[]))
  })
  it('should identify a null',() => {
    expect.eq(Assert.isType('null',null))
  })
  it('should identify a number',() => {
    expect.eq(Assert.isType('number',1))
  })
  it('should identify a object',() => {
    expect.eq(Assert.isType('Object',{}))
  })
  it('should identify a string',() => {
    expect.eq(Assert.isType('string',''))
  })
  it('should identify an undefined',() => {
    expect.eq(Assert.isType('undefined',undefined))
  })
})
assert.suite('isAbove',(it)=>{
  it('should fail on invalid input',() => {
    expect.eq(Assert.isAbove.catch('foo',AssertionError))
  })
  it('should be true if a number is above base',() => {
    expect.eq(Assert.isAbove(3,10))
  })
  it('should be false if a number is below a base',() => {
    expect.eq(Assert.isAbove.catch(10,3,AssertionError))
  })
})
assert.suite('isBelow',(it)=>{
  it('should fail on invalid input',() => {
    expect.eq(Assert.isBelow.catch('foo', AssertionError))
  })
  it('should be true if a number is below a base',() => {
    expect.eq(Assert.isBelow(7,5))
  })
  it('should be false if a number is above a base',() => {
    expect.neq(Assert.isBelow(7,4))
  })
})
assert.suite('match',(it)=>{
  it('should match an array containing strings',() => {
    expect.eq(Assert.match(new RegExp('foo'),['foo']))
  })
  it('should match an array within array containing strings',() => {
    expect.eq(Assert.match(new RegExp('foo'),[[1,2],['foo','bar'],{foo: 'foo'}]))
  })
  it('should match an object containing strings',() => {
    expect.eq(Assert.match(new RegExp('foo'),[[1,2],['bar'],{foo: 'foo'}]))
  })
  it('should match a string',() => {
    expect.eq(Assert.match(/foo/,'somefoostring'))
    expect.eq(Assert.match(/bar/,'somefoostring'),false)
  })
})
assert.suite('maximum',(it)=>{
  it('should fail on invalid input',() => {
    expect.eq(Assert.maximum.catch('foo',AssertionError))
  })
  it('should be true if a number is below or equal to a base',() => {
    expect.eq(Assert.maximum(3,2))
    expect.eq(Assert.maximum(3,3))
  })
  it('should be false if a number is above a base',() => {
    expect.eq(Assert.maximum.catch(3,211,AssertionError))
  })
})
assert.suite('minimum',(it)=>{
  it('should fail on invalid input',() => {
    expect.eq(Assert.minimum.catch('foo',AssertionError))
  })
  it('should be true if a number is above or equal to a base',() => {
    expect.eq(Assert.minimum(3,3))
    expect.eq(Assert.minimum(3,5))
  })
  it('should be false if a number is below a base',() => {
    expect.eq(Assert.minimum.catch(10,9,AssertionError))
  })
})
assert.suite('types',(it)=>{
  it('should check for Array',() => {
    expect.eq(Assert.eqDeep.catch([],[],AssertionError))
    expect.eq(Assert.eqDeep.catch([],{},AssertionError))
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
    expect.assert(() => {
    },() => {
    })
  })
  //it('should check for Generator')
  //it('should check for GeneratorFunction')
  it('should check for Infinity',() => {
    expect.eq(Infinity,Infinity)
  })
  it('should check for Map',()=>{
    const map = new Map([[1,'one'],[2,'two']])
    expect.eq(map,map)
  })
  it('should check for NaN',() => {
    //Equality comparison with NaN always evaluates to false
    expect.isType('NaN',NaN)
  })
  it('should check for null',() => {
    expect.eqDeep(null,null)
    expect.eqDeep.catch(null,undefined,
      'null(null) does not deep equal undefined(undefined)')
  })
  it('should check for Number',() => {
    expect.eq(1,1)
    expect.eq.catch(1,'',AssertionError)
    expect.eq.catch(1,true,AssertionError)
  })
  it('should check for Promise',() => {
    const promise = new Promise(function(){
    })
    expect.eq(promise,promise)
  })
  it('should check for RangeError',() => {
    const rangeErr = new RangeError('')
    expect.eq(rangeErr,rangeErr)
  })
  it('should check for ReferenceError',() => {
    const refErr = new ReferenceError('')
    expect.eq(refErr,refErr)
  })
  it('should check for RegExp',() => {
    const regExp = new RegExp('foo','ig')
    expect.eq(regExp,regExp)
  })
  it('should check for String',() => {
    expect.eq('','')
    expect.eq('foo','foo')
    expect.eq.catch('foo','bar',AssertionError)
  })
  it('should check for Symbol',() => {
    expect.eq(Symbol,Symbol)
  })
  it('should check for SyntaxError',() => {
    const synErr = new SyntaxError('')
    expect.eq(synErr,synErr)
  })
  it('should check for TypedArray',() => {
    const tyArray = new Int8Array()
    expect.eq(tyArray,tyArray)
  })
  it('should check for TypeError',() => {
    const tyErr = new TypeError('')
    expect.eq(tyErr,tyErr)
  })
  it('should check for Undefined',() => {
    expect.eq(undefined,undefined)
    expect.eq.catch(undefined,null,AssertionError)
  })
})
assert.suite('withInstance',(it)=>{
  it('should check above',() => {
    try {
      expect.eq(new Assert(5).above(4))
    } catch(e) {
      expect.isType('AssertionError',e)
    }
  })
  it('should check below',() => {
    try{
      expect.eq(new Assert(5).below(6))
    } catch(e){
      expect.isType('AssertionError',e)
    }
  })
  it('should check equal',() => {
    expect.eq(new Assert(1).equal(1))
  })
  it('should check is type',()=>{
    expect.eq(new Assert('foo').is('string'))
  })
  it('should check min',()=>{
    const v = new Assert(3)
    expect.eq(v.min(3))
    try {
      expect.eq(v.min(5),false)
    } catch(e){
      expect.isType('AssertionError',e)
    }
  })
  it('should check max',()=>{
    const v = new Assert(7)
    expect.eq(v.max(7))
    try {
      expect.eq(v.max(5),false)
    } catch(e){
      expect.isType('AssertionError',e)
    }
  })
  it('should check not',()=>{
    const v = new Assert(8)
    expect.eq(v.not(7))
    try {
      expect.eq(v.not(8),false)
    } catch(e){
      expect.isType('AssertionError',e)
    }
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
