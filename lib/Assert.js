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
const Validate = require('./Validate')

class Assert extends Validate {
  // static method section, for use without instance
  static assert (val1, val2) {
    return Validate.assert(val1, val2)
  }

  static eq (val1, val2) {
    if (val2 === undefined && val1 !== undefined) val2 = true
    const rv = Validate.eq(val1, val2)
    if (!rv) {
      if (
        (val1 instanceof Array && val2 instanceof Array) ||
        (val1 instanceof Object && val2 instanceof Object)
      ) {
        throw new Assert.Error(
          `${Assert.getType(val1)}(${val1}) does not reference equal ` +
          `${Assert.getType(val2)}(${val2})`
        )
      } else {
        throw new Assert.Error(
          `${Assert.getType(val1)}(${val1}) does not equal ` +
          `${Assert.getType(val2)}(${val2})`
        )
      }
    }
    return true
  }

  static eqDeep (val1, val2) {
    const rv = Validate.eqDeep(val1, val2)
    if (!rv) {
      throw new Assert.Error(
        `${Assert.getType(val1)}(${val1}) does not deep equal ` +
        `${Assert.getType(val2)}(${val2})`
      )
    }
    return true
  }

  static neq (val1, val2) {
    const rv = Validate.neq(val1, val2)
    if (!rv) {
      throw new Assert.Error(`${val1} is not supposed to equal ${val2}`)
    }
    return true
  }

  static isOk (value, message) {
    const rv = Validate.isOk(value)
    if (!rv) throw new Assert.Error(`${message}`)
    return true
  }

  static isType (type, value) {
    const rv = Validate.isType(type, value)
    if (!rv) {
      throw new Assert.Error(
        `${Assert.getType(value)} does not equal ${type}`
      )
    }
    return true
  }

  static isAbove (base, test) {
    const rv = Validate.isAbove(base, test)
    if (!rv) {
      throw new Assert.Error(`${test} is not above ${base}`)
    }
    return true
  }

  static isBelow (base, test) {
    const rv = Validate.isBelow(base, test)
    if (!rv) {
      throw new Assert.Error(`${test} is not below ${base}`)
    }
    return true
  }

  static minimum (base, test) {
    const rv = Validate.minimum(base, test)
    if (!rv) {
      throw new Assert.Error(`${test} is at least ${base}`)
    }
    return true
  }

  static maximum (base, test) {
    const rv = Validate.maximum(base, test)
    if (!rv) {
      throw new Assert.Error(`${test} is more than ${base}`)
    }
    return true
  }

  static catch (v1, v2, msg, method) {
    if (msg && method === undefined) {
      method = msg
      msg = v2
      v2 = undefined
    }
    if (msg === undefined && v2) {
      msg = v2
      v2 = undefined
    }
    if (Assert.getType(msg) !== 'Array') {
      msg = [msg]
    }
    try {
      Assert[method](v1, v2)
    } catch (e) {
      let rv = false
      for (const m of msg) {
        const t = Assert.getType(m)
        switch (t) {
          case 'string':
            rv = rv || (e instanceof Assert.Error && e.message === m)
            break
          case 'RegExp':
            rv = rv || (e instanceof Assert.Error && e.message.search(m) !== -1)
            break
          default:
            if (m instanceof Object && e instanceof m) rv = true
        }
      }
      if (!rv) {
        throw e
      }
      return rv
    }
  }
  // end static method section

  // stateful method section, for use with instance
  static getInstance (data) {
    return new Assert(data)
  }

  above (floor) {
    return Assert.isAbove(this.data, floor)
  }

  below (ceiling) {
    return Assert.isBelow(this.data, ceiling)
  }

  equal (against) {
    return Assert.eq(this.data, against)
  }

  is (type) {
    return Assert.isType(Assert.getType(this.data), type)
  }

  min (bottom) {
    return Assert.minimum(this.data, bottom)
  }

  max (top) {
    return Assert.maximum(this.data, top)
  }

  not (val) {
    return Assert.neq(this.data, val)
  }

  ok (message) {
    return Assert.isOk(this.data, message)
  }
  // end stateful method section
}
// catch wrappers
Assert.assert.catch = (val1, val2, msg) => {
  return Assert.catch(val1, val2, msg, 'assert')
}
Assert.eq.catch = (val1, val2, msg) => {
  return Assert.catch(val1, val2, msg, 'eq')
}
Assert.eqDeep.catch = (val1, val2, msg) => {
  return Assert.catch(val1, val2, msg, 'eqDeep')
}
Assert.isType.catch = (type, value, msg) => {
  return Assert.catch(type, value, msg, 'isType')
}
Assert.isAbove.catch = (base, test, msg) => {
  return Assert.catch(base, test, msg, 'isAbove')
}
Assert.isBelow.catch = (base, test, msg) => {
  return Assert.catch(base, test, msg, 'isBelow')
}
Assert.minimum.catch = (base, test, msg) => {
  return Assert.catch(base, test, msg, 'minimum')
}
Assert.maximum.catch = (base, test, msg) => {
  return Assert.catch(base, test, msg, 'maximum')
}
Assert.neq.catch = (val1, val2, msg) => {
  return Assert.catch(val1, val2, msg, 'neq')
}
Assert.isOk.catch = (value, message, msg) => {
  if (message && msg === undefined) {
    msg = message
  }
  return Assert.catch(value, message, msg, 'isOk')
}
// destructuring references
Assert.expect = Assert
Assert.Assert = Assert
module.exports = Assert
