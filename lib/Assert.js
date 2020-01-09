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
const AssertionError = require('./AssertionError')
const Validate = require('./Validate')

class Assert extends Validate {
  static assert(val1,val2){
    return Validate.assert(val1,val2)
  }
  static catch(){
    let [ v1, v2, msg, method ] = arguments
    if(method === undefined){
      method = msg
      msg = v2
      v2 = undefined
    }
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
    return new Assert(data)
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
Assert.AssertionError = AssertionError
Assert.expect = Assert
Assert.Assert = Assert
module.exports = Assert
