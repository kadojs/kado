'use strict'
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
  constructor (data) {
    if (typeof data === 'string') data = { message: data }
    super(data)
  }
}

class Validate {
  // static method section, for use without instance
  static assert (val1, val2) {
    const type = Validate.getType(val1)
    let rv
    switch (type) {
      case 'Array':
        rv = Validate.eqDeep(val1, val2)
        break
      case 'Object':
        rv = Validate.eqDeep(val1, val2)
        break
      case 'Date':
        rv = Validate.date(val1, val2)
        break
      case 'Error':
        rv = Validate.eq(val1.message, val2.message)
        break
      case 'Function':
        rv = Validate.eq(val1.toString(), val2.toString())
        break
      default:
        rv = Validate.eq(val1, val2)
        break
    }
    if (!rv) {
      throw new AssertionError(
      `${Validate.getType(val1)}(${val1}) does not equal ` +
      `${Validate.getType(val2)}(${val2})`
      )
    }
    return rv
  }

  static date (val1, val2, options) {
    options = options || {}
    const ensureOpt = (k) => {
      if (!Object.prototype.hasOwnProperty.call(options, k) || !options[k]) {
        options[k] = 0
      }
    }
    ensureOpt('granularity')
    ensureOpt('distance')
    const granulate = (v) => {
      return Math.floor(v / options.granularity) * options.granularity
    }
    const isNear = (a, b) => {
      return (Math.abs(b - a) <= options.distance)
    }
    let a = (+val1)
    let b = (+val2)
    if (options.granularity > 0) {
      a = granulate(a)
      b = granulate(b)
    }
    return (options.distance > 0) ? isNear(a, b) : Validate.eq(a, b)
  }

  static eq (val1, val2) {
    return val1 === val2
  }

  static eqDeep (val1, val2) {
    const assert = require('assert').strict
    try {
      assert.deepStrictEqual(val1, val2)
      return true
    } catch (e) {
      if (e instanceof assert.AssertionError) {
        return false
      } else {
        console.log(`Assertion failed unknown: ${e.message}`)
        return false
      }
    }
  }

  static neq (val1, val2) {
    return val1 !== val2
  }

  static isOk (value) {
    return !!(value)
  }

  static getType (val) {
    if (val === null) return 'null'
    if (val instanceof Object) return val.constructor.name
    return typeof val
  }

  static isType (type, value) {
    const lcType = type.toLowerCase()
    const builtins = ['array', 'function', 'null', 'number', 'string', 'object']
    if ((type !== lcType) && (builtins.indexOf(lcType) > -1)) {
      type = lcType
    }
    const upperFirst = ['function', 'object']
    if ((type === lcType) && (upperFirst.indexOf(lcType) > -1)) {
      type = lcType.charAt(0).toUpperCase() + lcType.slice(1)
    }
    if (type === 'NaN' && isNaN(value)) return true
    if (value === null) return type === 'null'
    if (type === 'array' && Array.isArray(value)) return true
    if (value instanceof Object) {
      return Object.getPrototypeOf(value).constructor.name === type
    }
    let valType = typeof value
    if (valType.toLowerCase() === 'object') valType = 'Object'
    return valType === type
  }

  static isAbove (base, test) {
    return test > base
  }

  static isBelow (base, test) {
    return test < base
  }

  static minimum (base, test) {
    return test >= base
  }

  static maximum (base, test) {
    return test <= base
  }

  static match (regex, val) {
    if (val instanceof Array) {
      let rv = false
      for (const v of val) {
        rv = Validate.match(regex, v)
        if (rv === true) break
      }
      return rv
    } else if (val instanceof Object) {
      let rv = false
      for (const v in val) {
        if (!Object.prototype.hasOwnProperty.call(val, v)) continue
        rv = Validate.match(regex, val[v])
        if (rv === true) break
      }
      return rv
    }
    return typeof val === 'string' && val.search(regex) !== -1
  }

  static catch (fn, err) {
    try { fn() } catch (e) {
      return (
        (err instanceof Object && e instanceof err) ||
        (Validate.getType(err) === 'string' && err === e.message)
      )
    }
  }
  // end static method section

  // stateful method section, for use with instance
  static getInstance (data) {
    return new Validate(data)
  }

  constructor (data) {
    this.data = data
  }

  above (floor) {
    return Validate.isAbove(floor, this.data)
  }

  below (ceiling) {
    return Validate.isBelow(ceiling, this.data)
  }

  equal (against) {
    return Validate.eq(this.data, against)
  }

  is (type) {
    return Validate.isType(type, this.data)
  }

  min (bottom) {
    return Validate.minimum(bottom, this.data)
  }

  max (top) {
    return Validate.maximum(top, this.data)
  }

  not (val) {
    return Validate.neq(this.data, val)
  }

  ok () {
    return Validate.isOk(this.data)
  }
  // end stateful method section
}
Validate.AssertionError = AssertionError
Validate.Error = AssertionError
Validate.Validate = Validate
module.exports = Validate
