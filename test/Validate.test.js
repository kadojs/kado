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
const {Val,expect,AssertionError} = require('../lib/Validate')
const runner = require('../lib/TestRunner').getInstance('Kado')
const validate = runner.suite('Validate')
const assert = validate.suite('assert')
const eq = validate.suite('eq')
const eqDeep = validate.suite('eqDeep')
const getInstance = validate.suite('getInstance')
const getType = validate.suite('getType')
const isType = validate.suite('isType')
const isAbove = validate.suite('isAbove')
const isBelow = validate.suite('isBelow')
const match = validate.suite('match')
const maximum = validate.suite('maximum')
const minimum = validate.suite('minimum')
const neq = validate.suite('neq')
const Types = validate.suite('Types')
const withInstance = validate.suite('withInstance')

assert.it('should assert an array',() => {
  expect.assert([],[])
  expect.assert.catch([],[1],'Array() does not equal Array(1)')
  expect.assert.catch([],{},
    'Array() does not equal Object([object Object])')
})
assert.it('should assert a boolean',() => {
  expect.assert(true,true)
  expect.assert.catch(true,false,
    'boolean(true) does not equal boolean(false)')
})
assert.it('should assert a date',() => {
  expect.assert(new Date(),new Date())
})
assert.it('should fail two new dates over time',async () => {
  function getDate(){
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Date())
      },2)
    })
  }
  expect.assert.catch(new Date(),await getDate(),AssertionError)
})
assert.it('should assert an error',() => {
  expect.assert(Error,Error)
})
assert.it('should assert a function',() => {
  expect.assert(() => {
  },() => {
  })
})
assert.it('should assert a null',() => {
  expect.assert(null,null)
  expect.assert.catch(null,undefined,
    'null(null) does not equal undefined(undefined)')
})
assert.it('should assert a number',() => {
  expect.assert(1,1)
})
assert.it('should assert an object',() => {
  expect.assert({},{})
})
assert.it('should assert a string',() => {
  expect.assert('','')
  expect.assert('foo','foo')
})
assert.it('should assert an undefined',() => {
  expect.assert(undefined,undefined)
  expect.assert.catch(undefined,null,
    'undefined(undefined) does not equal null(null)')
})

eq.it('should eq array',() => {
  const arr1 = []
  expect.eq(arr1,arr1)
  expect.eq.catch({},{},
    'Object([object Object]) does not ' +
    'reference equal Object([object Object])')
  expect.eq.catch([],[],'Array() does not reference equal Array()')
  expect.eq.catch([],{},
    'Array() does not reference equal Object([object Object])')
})
eq.it('should eq boolean',() => {
  expect.eq(true,true)
  expect.eq.catch(true,false,'boolean(true) does not equal boolean(false)')
})
eq.it('should eq null',() => {
  expect.eq(null,null)
  expect.eq.catch(null,undefined,'null(null) does not equal boolean(true)')
})
eq.it('should eq object',() => {
  const obj1 = {}
  expect.eq(obj1,obj1)
  expect.eq.catch(obj1,[],
    'Object([object Object]) does not reference equal Array()')
})
eq.it('should eq string',() => {
  expect.eq('','')
  expect.eq('foo','foo')
})

eqDeep.it('should eq an array',() => {
  expect.eq(Val.eqDeep([],[]))
  expect.eq(Val.eqDeep([],{}),false)
})
eqDeep.it('should eq an object',() => {
  expect.eq(Val.eqDeep({},{}))
  expect.eq(Val.eqDeep({},[]),false)
})

getInstance.it('should return an instance',() => {
  expect.isType('Validate',Val.getInstance())
})

getType.it('should get a array',() => {
  expect.eq(Val.getType([]),'Array')
})
getType.it('should get a boolean',() => {
  expect.eq(Val.getType(true),'boolean')
  expect.eq.catch(Val.getType('false'),'boolean',
    'string(string) does not equal string(boolean)')
  expect.eq.catch(Val.getType('+00000000'),'boolean',
    'string(string) does not equal string(boolean)')
})
getType.it('should get a null',() => {
  expect.eq(Val.getType(null),'null')
})
getType.it('should get a number',() => {
  expect.eq(Val.getType(1),'number')
})
getType.it('should get a object',() => {
  expect.eq(Val.getType({}),'Object')
})
getType.it('should get a string',() => {
  expect.eq(Val.getType(''),'string')
})
getType.it('should get a undefined',() => {
  expect.eq(Val.getType(),'undefined')
  expect.eq.catch(Val.getType(''),'undefined',
    'string(string) does not equal string(undefined)')
})

isType.it('should identify a array',() => {
  expect.eq(Val.isType('Array',[]))
})
isType.it('should identify a null',() => {
  expect.eq(Val.isType('null',null))
})
isType.it('should identify a number',() => {
  expect.eq(Val.isType('number',1))
})
isType.it('should identify a object',() => {
  expect.eq(Val.isType('Object',{}))
})
isType.it('should identify a string',() => {
  expect.eq(Val.isType('string',''))
})
isType.it('should identify an undefined',() => {
  expect.eq(Val.isType('undefined',undefined))
})

isAbove.it('should fail on invalid input',() => {
  expect.eq.catch(Val.isAbove(3),'foo',
    'boolean(false) does not equal string(foo)')
})
isAbove.it('should be true if a number is above base',() => {
  expect.eq(Val.isAbove(3,10))
})
isAbove.it('should be false if a number is below a base',() => {
  expect.eq(Val.isAbove(10,3),false)
})

isBelow.it('should fail on invalid input',() => {
  expect.eq.catch(Val.isBelow(3),'foo',
    'boolean(false) does not equal string(foo)')
})
isBelow.it('should be true if a number is below a base',() => {
  expect.eq(Val.isBelow(7,5))
})
isBelow.it('should be false if a number is above a base',() => {
  expect.neq(Val.isBelow(7,4))
})

match.it('should match an array containing strings',() => {
  expect.eq(Val.match(new RegExp('foo'),['foo']))
})
match.it('should match an array within array containing strings',() => {
  expect.eq(Val.match(new RegExp('foo'),[[1,2],['foo','bar'],{foo: 'foo'}]))
})
match.it('should match an object containing strings',() => {
  expect.eq(Val.match(new RegExp('foo'),[[1,2],['bar'],{foo: 'foo'}]))
})
match.it('should match a string',() => {
  expect.eq(Val.match(/foo/,'somefoostring'))
  expect.eq(Val.match(/bar/,'somefoostring'),false)
})

maximum.it('should fail on invalid input',() => {
  expect.eq.catch(Val.maximum(3),'foo',
    'boolean(false) does not equal string(foo)')
})
maximum.it('should be true if a number is below or equal to a base',() => {
  expect.eq(Val.maximum(3,2))
  expect.eq(Val.maximum(3,3))
})
maximum.it('should be false if a number is above a base',() => {
  expect.eq(Val.maximum(3,211),false)
})

minimum.it('should fail on invalid input',() => {
  expect.eq.catch(Val.minimum(3),'foo',
    'boolean(false) does not equal string(foo)')
})
minimum.it('should be true if a number is above or equal to a base',() => {
  expect.eq(Val.minimum(3,3))
  expect.eq(Val.minimum(3,5))
})
minimum.it('should be false if a number is below a base',() => {
  expect.eq(Val.minimum(10,9),false)
})

neq.it('should be false on true neq true',() => {
  expect.eq(Val.neq(true,true),false)
})

validate.it('should construct',() => {
  let testValidate = new Val()
  expect.isType('Validate',testValidate)
})

Types.it('should check for Array',() => {
  expect.eq(Val.eqDeep([],[]),true)
  expect.eq(Val.eqDeep([],{}),false)
})
Types.it('should check for Boolean',() => {
  expect.eq(true)
  expect.eq.catch(true,false,'boolean(true) does not equal boolean(false)')
})
Types.it('should check for Date',() => {
  const date = new Date()
  expect.assert(date,date)
})
Types.it('should check for Error',() => {
  expect.eqDeep(new Error('foo'),new Error('foo'))
})
Types.it('should check for Function',() => {
  expect.assert(() => {
  },() => {
  })
})
//it('should check for Generator')
//it('should check for GeneratorFunction')
Types.it('should check for Infinity',() => {
  expect.eq(Infinity,Infinity)
})
Types.it('should check for Map',()=>{
  const map = new Map([[1,'one'],[2,'two']])
  expect.eq(map,map)
})
//Equality comparison with NaN always evaluates to false
Types.it('should check for NaN',() => {
  expect.isType('NaN',NaN)
})
Types.it('should check for null',() => {
  expect.eqDeep(null,null)
  expect.eqDeep.catch(null,undefined,
    'null(null) does not deep equal undefined(undefined)')
})
Types.it('should check for Number',() => {
  expect.eq(1,1)
  expect.eq.catch(1,'',AssertionError)
  expect.eq.catch(1,true,AssertionError)
})
Types.it('should check for Promise',() => {
  const promise = new Promise(function(){
  })
  expect.eq(promise,promise)
})
Types.it('should check for RangeError',() => {
  const rangeErr = new RangeError('')
  expect.eq(rangeErr,rangeErr)
})
Types.it('should check for ReferenceError',() => {
  const refErr = new ReferenceError('')
  expect.eq(refErr,refErr)
})
Types.it('should check for RegExp',() => {
  const regExp = new RegExp('foo','ig')
  expect.eq(regExp,regExp)
})
Types.it('should check for String',() => {
  expect.eq('','')
  expect.eq('foo','foo')
  expect.eq.catch('foo','bar',AssertionError)
})
Types.it('should check for Symbol',() => {
  expect.eq(Symbol,Symbol)
})
Types.it('should check for SyntaxError',() => {
  const synErr = new SyntaxError('')
  expect.eq(synErr,synErr)
})
Types.it('should check for TypedArray',() => {
  const tyArray = new Int8Array()
  expect.eq(tyArray,tyArray)
})
Types.it('should check for TypeError',() => {
  const tyErr = new TypeError('')
  expect.eq(tyErr,tyErr)
})
Types.it('should check for Undefined',() => {
  expect.eq(undefined,undefined)
  expect.eq.catch(undefined,null,AssertionError)
})

withInstance.it('should check above',() => {
  expect.eq(new Val(5).above(4))
})
withInstance.it('should check below',() => {
  expect.eq(new Val(5).below(6))
})
withInstance.it('should check equal',() => {
  expect.eq(new Val(1).equal(1))
})
withInstance.it('should check is type',()=>{
  expect.eq(new Val('foo').is('string'))
})
withInstance.it('should check min',()=>{
  const v = new Val(3)
  expect.eq(v.min(3))
  expect.eq(v.min(5),false)
})
withInstance.it('should check max',()=>{
  const v = new Val(7)
  expect.eq(v.max(7))
  expect.eq(v.max(5),false)
})
withInstance.it('should check not',()=>{
  const v = new Val(8)
  expect.eq(v.not(7))
  expect.eq(v.not(8),false)
})
runner.execute()
  .then(code => {
    process.exit(code)
  })
/*
describe('Validate',()=> {
  const {Val,expect,AssertionError} = require('../lib/Validate')
  describe('assert',() => {
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
  describe('eq',() => {
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
  describe('eqDeep',() => {
    it('should eq an array',() => {
      expect.eq(Val.eqDeep([],[]))
      expect.eq(Val.eqDeep([],{}),false)
    })
    it('should eq an object',() => {
      expect.eq(Val.eqDeep({},{}))
      expect.eq(Val.eqDeep({},[]),false)
    })
  })
  describe('match',() => {
    it('should match a string',() => {
      expect.eq(Val.match(/foo/,'somefoostring'))
      expect.eq(Val.match(/bar/,'somefoostring'),false)
    })
    it('should match an array containing strings',() => {
      expect.eq(Val.match(new RegExp('foo'),['foo']))
    })
    it('should match an array within array containing strings',() => {
      expect.eq(Val.match(new RegExp('foo'),[[1,2],['foo','bar'],{foo: 'foo'}]))
    })
    it('should match an object containing strings',() => {
      expect.eq(Val.match(new RegExp('foo'),[[1,2],['bar'],{foo: 'foo'}]))
    })
  })
  describe('getInstance',() => {
    it('should return an instance',() => {
      expect.isType('Validate',Val.getInstance())
    })
  })
  describe('getType',() => {
    it('should get a array',() => {
      expect.eq(Val.getType([]),'Array')
    })
    it('should get a boolean',() => {
      expect.eq(Val.getType(true),'boolean')
      expect.eq.catch(Val.getType('false'),'boolean',
        'string(string) does not equal string(boolean)')
      expect.eq.catch(Val.getType('+00000000'),'boolean',
        'string(string) does not equal string(boolean)')
    })
    it('should get a null',() => {
      expect.eq(Val.getType(null),'null')
    })
    it('should get a number',() => {
      expect.eq(Val.getType(1),'number')
    })
    it('should get a object',() => {
      expect.eq(Val.getType({}),'Object')
    })
    it('should get a string',() => {
      expect.eq(Val.getType(''),'string')
    })
    it('should get a undefined',() => {
      expect.eq(Val.getType(),'undefined')
      expect.eq.catch(Val.getType(''),'undefined',
        'string(string) does not equal string(undefined)')
    })
  })
  describe('isType',() => {
    it('should identify a array',() => {
      expect.eq(Val.isType('Array',[]))
    })
    it('should identify a null',() => {
      expect.eq(Val.isType('null',null))
    })
    it('should identify a number',() => {
      expect.eq(Val.isType('number',1))
    })
    it('should identify a object',() => {
      expect.eq(Val.isType('Object',{}))
    })
    it('should identify a string',() => {
      expect.eq(Val.isType('string',''))
    })
    it('should identify an undefined',() => {
      expect.eq(Val.isType('undefined',undefined))
    })
  })
  describe('isAbove',() => {
    it('should fail on invalid input',() => {
      expect.eq.catch(Val.isAbove(3),'foo',
        'boolean(false) does not equal string(foo)')
    })
    it('should be true if a number is above base',() => {
      expect.eq(Val.isAbove(3,10))
    })
    it('should be false if a number is below a base',() => {
      expect.eq(Val.isAbove(10,3),false)
    })
  })
  describe('isBelow',() => {
    it('should fail on invalid input',() => {
      expect.eq.catch(Val.isBelow(3),'foo',
        'boolean(false) does not equal string(foo)')
    })
    it('should be true if a number is below a base',() => {
      expect.eq(Val.isBelow(7,5))
    })
    it('should be false if a number is above a base',() => {
      expect.neq(Val.isBelow(7,4))
    })
  })
  describe('maximum',() => {
    it('should fail on invalid input',() => {
      expect.eq.catch(Val.maximum(3),'foo',
        'boolean(false) does not equal string(foo)')
    })
    it('should be true if a number is below or equal to a base',() => {
      expect.eq(Val.maximum(3,2))
      expect.eq(Val.maximum(3,3))
    })
    it('should be false if a number is above a base',() => {
      expect.eq(Val.maximum(3,211),false)
    })
  })
  describe('minimum',() => {
    it('should fail on invalid input',() => {
      expect.eq.catch(Val.minimum(3),'foo',
        'boolean(false) does not equal string(foo)')
    })
    it('should be true if a number is above or equal to a base',() => {
      expect.eq(Val.minimum(3,3))
      expect.eq(Val.minimum(3,5))
    })
    it('should be false if a number is below a base',() => {
      expect.eq(Val.minimum(10,9),false)
    })
  })
  describe('neq',() => {
    it('should be false on true neq true',() => {
      expect.eq(Val.neq(true,true),false)
    })
  })
  it('should construct',() => {
    let testValidate = new Val()
    expect.isType('Validate',testValidate)
  })
  describe('Types',() => {
    it('should check for Array',() => {
      expect.eq(Val.eqDeep([],[]),true)
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
    //Equality comparison with NaN always evaluates to false
    it('should check for NaN',() => {
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
  describe('with instance',() => {
    it('should check above',() => {
      expect.eq(new Val(5).above(4))
    })
    it('should check below',() => {
      expect.eq(new Val(5).below(6))
    })
    it('should check equal',() => {
      expect.eq(new Val(1).equal(1))
    })
    it('should check is type',()=>{
      expect.eq(new Val('foo').is('string'))
    })
    it('should check min',()=>{
      const v = new Val(3)
      expect.eq(v.min(3))
      expect.eq(v.min(5),false)
    })
    it('should check max',()=>{
      const v = new Val(7)
      expect.eq(v.max(7))
      expect.eq(v.max(5),false)
    })
    it('should check not',()=>{
      const v = new Val(8)
      expect.eq(v.not(7))
      expect.eq(v.not(8),false)
    })
  })
})
*/