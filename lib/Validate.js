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

module.exports = class Validate {
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
    if(!rv) throw new Error(`Assertion failed ${val1} does not equal ${val2}`)
    return rv
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
    if(val instanceof Object) return val.constructor.name
    return typeof val
  }
  static isType(type,value){
    if(value instanceof Object) return value instanceof type
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
    return Validate.eq(against)
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
