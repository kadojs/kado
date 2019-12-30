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
const _AssertionError = require('assert').AssertionError

class AssertionError extends _AssertionError {
  constructor(data){
    if(typeof data === 'string') data = {message: data}
    super(data)
  }
}

class Validate {
  static assert(val1,val2){
    const type = Validate.getType(val1)
    let rv
    switch(type){
    case 'Array':
      rv = Validate.eqDeep(val1,val2)
      break
    case 'Object':
      rv = Validate.eqDeep(val1,val2)
      break
    case 'Date':
      rv = Validate.eq((+val1),(+val2))
      break
    case 'Error':
      rv = Validate.eq(val1.message,val2.message)
      break
    case 'Function':
      rv = Validate.eq(val1.toString(),val2.toString())
      break
    default:
      rv = Validate.eq(val1,val2)
      break
    }
    if(!rv) throw new AssertionError(
      `${Validate.getType(val1)}(${val1}) does not equal ` +
      `${Validate.getType(val2)}(${val2})`
    )
    return rv
  }
  static catch(fn,err){
    try { fn() } catch(e){
      return (
        (err instanceof Object && e instanceof err) ||
        (Validate.getType(err) === 'string' && err === e.message)
      )
    }
  }
  static eq(val1,val2){
    return val1 === val2
  }
  static eqDeep(val1,val2){
    const assert = require('assert').strict
    try {
      assert.deepStrictEqual(val1,val2)
      return true
    } catch(e){
      if(e instanceof assert.AssertionError){
        return false
      } else {
        console.log(`Assertion failed unknown: ${e.message}`)
        return false
      }
    }
  }
  static getType(val){
    if(val === null) return 'null'
    if(val instanceof Object) return val.constructor.name
    return typeof val
  }
  static isType(type,value){
    if(type === 'NaN' && isNaN(value)) return true
    if(value === null) return 'null' === type
    if(value instanceof Object){
      return Object.getPrototypeOf(value).constructor.name === type
    }
    return typeof value === type
  }
  static isAbove(base,test){
    return test < base
  }
  static isBelow(base,test){
    return test > base
  }
  static minimum(base,test){
    return test >= base
  }
  static maximum(base,test){
    return test <= base
  }
  static neq(val1,val2){
    return val1 !== val2
  }
  static getInstance(data){
    return new Validate(data)
  }
  constructor(data){
    this.data = data
  }
  above(floor){
    return Validate.isAbove(this.data,floor)
  }
  below(ceiling){
    return Validate.isBelow(this.data,ceiling)
  }
  equal(against){
    return Validate.eq(this.data,against)
  }
  is(type){
    return Validate.isType(Validate.getType(this.data),type)
  }
  min(bottom){
    return Validate.minimum(this.data,bottom)
  }
  max(top){
    return Validate.maximum(this.data,top)
  }
  not(val){
    return Validate.neq(this.data,val)
  }
}

class Assert extends Validate {
  static assert(val1,val2){
    return Validate.assert(val1,val2)
  }
  static catch(){
    const [ v1, v2, msg, method ] = arguments
    try {
      Assert[method](v1,v2)
    } catch(e){
      if(msg instanceof Object && e instanceof msg) return true
      const rv = (e instanceof AssertionError && e.message === msg)
      if(!rv){
        throw e
      }
      return true
    }
  }
  static eq(val1,val2){
    if(val2 === undefined && val1 !== undefined) val2 = true
    const rv = Validate.eq(val1,val2)
    if(!rv){
      if(
        (val1 instanceof Array && val2 instanceof Array) ||
        (val1 instanceof Object && val2 instanceof Object)
      ){
        throw new AssertionError(
          `${Assert.getType(val1)}(${val1}) does not reference equal ` +
          `${Assert.getType(val2)}(${val2})`
        )
      } else {
        throw new AssertionError(
          `${Assert.getType(val1)}(${val1}) does not equal ` +
          `${Assert.getType(val2)}(${val2})`
        )
      }
    }
    return true
  }
  static eqDeep(val1,val2){
    const rv = Validate.eqDeep(val1,val2)
    if(!rv){
      throw new AssertionError(
        `${Assert.getType(val1)}(${val1}) does not deep equal ` +
        `${Assert.getType(val2)}(${val2})`
      )
    }
    return true
  }
  static isType(type,value){
    const rv = Validate.isType(type,value)
    if(!rv){
      throw new AssertionError(
        `${Assert.getType(value)} does not equal ${type}`
      )
    }
    return true
  }
  static isAbove(base,test){
    const rv = Validate.isAbove(base,test)
    if(!rv){
      throw new AssertionError(`${test} is not above ${base}`)
    }
    return true
  }
  static isBelow(base,test){
    const rv = Validate.isBelow(base,test)
    if(!rv){
      throw new AssertionError(`${test} is not below ${base}`)
    }
    return true
  }
  static minimum(base,test){
    const rv = Validate.minimum(base,test)
    if(!rv){
      throw new AssertionError(`${test} is at least ${base}`)
    }
    return true
  }
  static maximum(base,test){
    const rv = Validate.maximum(base,test)
    if(!rv){
      throw new AssertionError(`${test} is more than ${base}`)
    }
    return true
  }
  static neq(val1,val2){
    const rv = Validate.neq(val1,val2)
    if(!rv){
      throw new AssertionError(`${val1} is not supposed to equal ${val2}`)
    }
    return true
  }
  static getInstance(data){
    return new Validate(data)
  }
  constructor(data){
    super(data)
  }
  above(floor){
    return Assert.isAbove(this.data,floor)
  }
  below(ceiling){
    return Assert.isBelow(this.data,ceiling)
  }
  equal(against){
    return Assert.eq(this.data,against)
  }
  is(type){
    return Assert.isType(Assert.getType(this.data),type)
  }
  min(bottom){
    return Assert.minimum(this.data,bottom)
  }
  max(top){
    return Assert.maximum(this.data,top)
  }
  not(val){
    return Assert.neq(this.data,val)
  }
}
Assert.assert.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'assert'])
}
Assert.eq.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'eq'])
}
Assert.eqDeep.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'eqDeep'])
}
Assert.isType.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'isType'])
}
Assert.isAbove.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'isAbove'])
}
Assert.isBelow.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'isBelow'])
}
Assert.minimum.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'minimum'])
}
Assert.maximum.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'maximum'])
}
Assert.neq.catch = function(){
  return Assert.catch.apply(Assert,[...arguments,'neq'])
}
//destructuring references
Validate.AssertionError = AssertionError
Validate.Assert = Assert
Validate.expect = Assert
Validate.Val = Validate
Validate.Validate = Validate
module.exports = Validate
