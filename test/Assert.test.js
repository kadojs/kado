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
const Assert = require('../lib/Assert')
const runner = require('../lib/TestRunner').getInstance('Kado')

const getFutureDate = (timeoutDuration) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(new Date())
    }, timeoutDuration || 2)
  })
}

const assert = runner.suite('Assert', (it) => {
  it('should construct', () => {
    Assert.isType('Assert', new Assert(5))
  })
  it('should return an instance', () => {
    Assert.isType('Assert', Assert.getInstance())
  })
})
assert.suite('catch', (it) => {
  it('should catch by type', () => {
    Assert.eq(Assert.catch(true, true, Assert.Error, 'neq'))
  })
  it('should catch by string', () => {
    Assert.eq(Assert.catch(true, true,
      'true is not supposed to equal true', 'neq'))
  })
  it('should catch by RegEx', () => {
    Assert.eq(Assert.catch([], [1],
      /Array.* does not equal Array.*/, 'assert'))
  })
  it('should catch by mixed Array of possibilities', () => {
    Assert.eq(Assert.catch([], [1], [
      /foobar/,
      Error,
      / do3s n0t equ4l /,
      Assert.Error
    ], 'assert'))
  })
})
assert.suite('assert', (it) => {
  it('should assert an array', () => {
    Assert.assert([], [])
    Assert.assert.catch([], [1], 'Array() does not equal Array(1)')
    Assert.assert.catch([], {},
      'Array() does not equal Object([object Object])')
  })
  it('should assert a boolean', () => {
    Assert.assert(true, true)
    Assert.assert.catch(true, false,
      'boolean(true) does not equal boolean(false)')
  })
  it('should assert a date', () => {
    const now = new Date()
    Assert.assert(now, now)
  })
  it('should fail two new dates over time', async () => {
    Assert.assert.catch(new Date(), await getFutureDate(2), Assert.Error)
  })
  it('should assert an error', () => {
    Assert.assert(Error, Error)
  })
  it('should assert a function', () => {
    Assert.assert(() => {
    }, () => {
    })
  })
  it('should assert a null', () => {
    Assert.assert(null, null)
    Assert.assert.catch(null, undefined,
      'null(null) does not equal undefined(undefined)')
  })
  it('should assert a number', () => {
    Assert.assert(1, 1)
  })
  it('should assert an object', () => {
    Assert.assert({}, {})
  })
  it('should assert a string', () => {
    Assert.assert('', '')
    Assert.assert('foo', 'foo')
  })
  it('should assert an undefined', () => {
    Assert.assert(undefined, undefined)
    Assert.assert.catch(undefined, null,
      'undefined(undefined) does not equal null(null)')
  })
})
assert.suite('date', (it) => {
  it('should date with granularity', async () => {
    Assert.date(new Date(), await getFutureDate(2), { granularity: 1000 })
  })
  it('should date with distance', async () => {
    Assert.date(new Date(), await getFutureDate(2), { distance: 333 })
  })
})
assert.suite('eq', (it) => {
  it('should eq array', () => {
    const arr1 = []
    Assert.eq(arr1, arr1)
    Assert.eq.catch({}, {},
      'Object([object Object]) does not ' +
      'reference equal Object([object Object])')
    Assert.eq.catch([], [], 'Array() does not reference equal Array()')
    Assert.eq.catch([], {},
      'Array() does not reference equal Object([object Object])')
  })
  it('should eq boolean', () => {
    Assert.eq(true, true)
    Assert.eq.catch(true, false, 'boolean(true) does not equal boolean(false)')
  })
  it('should eq null', () => {
    Assert.eq(null, null)
    Assert.eq.catch(null, undefined, 'null(null) does not equal boolean(true)')
  })
  it('should eq object', () => {
    const obj1 = {}
    Assert.eq(obj1, obj1)
    Assert.eq.catch(obj1, [],
      'Object([object Object]) does not reference equal Array()')
  })
  it('should eq string', () => {
    Assert.eq('', '')
    Assert.eq('foo', 'foo')
  })
})
assert.suite('eqDeep', (it) => {
  it('should eq an array', () => {
    Assert.eq(Assert.eqDeep([], []))
    Assert.eq(Assert.eqDeep.catch([], {}, Assert.Error))
  })
  it('should eq an object', () => {
    Assert.eq(Assert.eqDeep({}, {}))
    Assert.eq(Assert.eqDeep.catch({}, [], Assert.Error))
  })
})
assert.suite('neq', (it) => {
  it('should neq array', () => {
    Assert.neq([], [1])
    Assert.neq.catch({}, { a: 1 },
      'Object([object Object]) does not ' +
      'reference equal Object([object Object])')
    Assert.neq.catch([], [1], 'Array() does not reference equal Array()')
    Assert.neq.catch([], [],
      'Array() does not reference equal Object([object Object])')
  })
  it('should neq boolean', () => {
    Assert.neq(true, false)
    Assert.neq.catch(true, true, 'true is not supposed to equal true')
  })
  it('should neq null', () => {
    Assert.neq(null, undefined)
    Assert.neq.catch(null, null, 'null is not supposed to equal null')
  })
  it('should neq object', () => {
    Assert.neq({}, { a: 1 })
    Assert.neq.catch({}, {},
      'Object([object Object]) does not reference equal Array()')
  })
  it('should neq string', () => {
    Assert.neq('', '1')
    Assert.neq('foo', '1')
    Assert.neq.catch('foo', 'foo', 'foo is not supposed to equal foo')
  })
})
assert.suite('isOk', (it) => {
  const msg = 'quick brown fox'
  it('should be passing for true', () => {
    Assert.isOk(true, msg)
  })
  it('should throw for false', () => {
    Assert.eq(Assert.isOk.catch(false, msg))
  })
  it('should throw for 0', () => {
    Assert.eq(Assert.isOk.catch(0, msg))
  })
  it('should throw for undefined', () => {
    Assert.eq(Assert.isOk.catch(undefined, msg))
  })
  it('should throw for null', () => {
    Assert.eq(Assert.isOk.catch(null, msg))
  })
})
assert.suite('getType', (it) => {
  it('should get a array', () => {
    Assert.eq(Assert.getType([]), 'Array')
  })
  it('should get a boolean', () => {
    Assert.eq(Assert.getType(true), 'boolean')
    Assert.eq.catch(Assert.getType('false'), 'boolean',
      'string(string) does not equal string(boolean)')
    Assert.eq.catch(Assert.getType('+00000000'), 'boolean',
      'string(string) does not equal string(boolean)')
  })
  it('should get a null', () => {
    Assert.eq(Assert.getType(null), 'null')
  })
  it('should get a number', () => {
    Assert.eq(Assert.getType(1), 'number')
  })
  it('should get a object', () => {
    Assert.eq(Assert.getType({}), 'Object')
  })
  it('should get a string', () => {
    Assert.eq(Assert.getType(''), 'string')
  })
  it('should get a undefined', () => {
    Assert.eq(Assert.getType(), 'undefined')
    Assert.eq.catch(Assert.getType(''), 'undefined',
      'string(string) does not equal string(undefined)')
  })
})
assert.suite('isType', (it) => {
  it('should identify a array', () => {
    Assert.eq(Assert.isType('Array', []))
  })
  it('should identify a null', () => {
    Assert.eq(Assert.isType('null', null))
  })
  it('should identify a number', () => {
    Assert.eq(Assert.isType('number', 1))
  })
  it('should identify a object', () => {
    Assert.eq(Assert.isType('Object', {}))
  })
  it('should identify a string', () => {
    Assert.eq(Assert.isType('string', ''))
  })
  it('should identify an undefined', () => {
    Assert.eq(Assert.isType('undefined', undefined))
  })
})
assert.suite('isAbove', (it) => {
  it('should fail on invalid input', () => {
    Assert.eq(Assert.isAbove.catch('foo', Assert.Error))
  })
  it('should be true if a number is above base', () => {
    Assert.eq(Assert.isAbove(3, 10))
  })
  it('should be false if a number is below a base', () => {
    Assert.eq(Assert.isAbove.catch(10, 3, Assert.Error))
  })
})
assert.suite('isBelow', (it) => {
  it('should fail on invalid input', () => {
    Assert.eq(Assert.isBelow.catch('foo', Assert.Error))
  })
  it('should be true if a number is below a base', () => {
    Assert.eq(Assert.isBelow(7, 5))
  })
  it('should be false if a number is above a base', () => {
    Assert.neq(Assert.isBelow(7, 4))
  })
})
assert.suite('match', (it) => {
  it('should match an array containing strings', () => {
    Assert.eq(Assert.match(/foo/, ['foo']))
  })
  it('should match an array within array containing strings', () => {
    Assert.eq(Assert.match(/foo/, [[1, 2], ['foo', 'bar'], { foo: 'foo' }]))
  })
  it('should match an object containing strings', () => {
    Assert.eq(Assert.match(/foo/, [[1, 2], ['bar'], { foo: 'foo' }]))
  })
  it('should match a string', () => {
    Assert.eq(Assert.match(/foo/, 'somefoostring'))
    Assert.eq(Assert.match(/bar/, 'somefoostring'), false)
  })
})
assert.suite('minimum', (it) => {
  it('should fail on invalid input', () => {
    Assert.eq(Assert.minimum.catch('foo', Assert.Error))
  })
  it('should be true if a number is above or equal to a base', () => {
    Assert.eq(Assert.minimum(3, 3))
    Assert.eq(Assert.minimum(3, 5))
  })
  it('should be false if a number is below a base', () => {
    Assert.eq(Assert.minimum.catch(10, 9, Assert.Error))
  })
})
assert.suite('maximum', (it) => {
  it('should fail on invalid input', () => {
    Assert.eq(Assert.maximum.catch('foo', Assert.Error))
  })
  it('should be true if a number is below or equal to a base', () => {
    Assert.eq(Assert.maximum(3, 2))
    Assert.eq(Assert.maximum(3, 3))
  })
  it('should be false if a number is above a base', () => {
    Assert.eq(Assert.maximum.catch(3, 211, Assert.Error))
  })
})
assert.suite('types', (it) => {
  it('should check for Array', () => {
    Assert.eq(Assert.eqDeep.catch([], [], Assert.Error))
    Assert.eq(Assert.eqDeep.catch([], {}, Assert.Error))
  })
  it('should check for Boolean', () => {
    Assert.eq(true)
    Assert.eq.catch(true, false, 'boolean(true) does not equal boolean(false)')
  })
  it('should check for Date', () => {
    const date = new Date()
    Assert.assert(date, date)
  })
  it('should check for Error', () => {
    Assert.eqDeep(new Error('foo'), new Error('foo'))
  })
  it('should check for Function', () => {
    Assert.assert(() => {
    }, () => {
    })
  })
  // it('should check for Generator')
  // it('should check for GeneratorFunction')
  it('should check for Infinity', () => {
    Assert.eq(Infinity, Infinity)
  })
  it('should check for Map', () => {
    const map = new Map([[1, 'one'], [2, 'two']])
    Assert.eq(map, map)
  })
  it('should check for NaN', () => {
    // Equality comparison with NaN always evaluates to false
    Assert.isType('NaN', NaN)
  })
  it('should check for null', () => {
    Assert.eqDeep(null, null)
    Assert.eqDeep.catch(null, undefined,
      'null(null) does not deep equal undefined(undefined)')
  })
  it('should check for Number', () => {
    Assert.eq(1, 1)
    Assert.eq.catch(1, '', Assert.Error)
    Assert.eq.catch(1, true, Assert.Error)
  })
  it('should check for Promise', () => {
    const promise = new Promise(function () {
    })
    Assert.eq(promise, promise)
  })
  it('should check for RangeError', () => {
    const rangeErr = new RangeError('')
    Assert.eq(rangeErr, rangeErr)
  })
  it('should check for ReferenceError', () => {
    const refErr = new ReferenceError('')
    Assert.eq(refErr, refErr)
  })
  it('should check for RegExp', () => {
    const regExp = /foo/ig
    Assert.eq(regExp, regExp)
  })
  it('should check for String', () => {
    Assert.eq('', '')
    Assert.eq('foo', 'foo')
    Assert.eq.catch('foo', 'bar', Assert.Error)
  })
  it('should check for Symbol', () => {
    Assert.eq(Symbol, Symbol)
  })
  it('should check for SyntaxError', () => {
    const synErr = new SyntaxError('')
    Assert.eq(synErr, synErr)
  })
  it('should check for TypedArray', () => {
    const tyArray = new Int8Array()
    Assert.eq(tyArray, tyArray)
  })
  it('should check for TypeError', () => {
    const tyErr = new TypeError('')
    Assert.eq(tyErr, tyErr)
  })
  it('should check for Undefined', () => {
    Assert.eq(undefined, undefined)
    Assert.eq.catch(undefined, null, Assert.Error)
  })
})
assert.suite('withInstance', (it) => {
  it('should check above', () => {
    try {
      Assert.eq(new Assert(5).above(4))
    } catch (e) {
      Assert.isType('AssertionError', e)
    }
  })
  it('should check below', () => {
    try {
      Assert.eq(new Assert(5).below(6))
    } catch (e) {
      Assert.isType('AssertionError', e)
    }
  })
  it('should check equal', () => {
    Assert.eq(new Assert(1).equal(1))
  })
  it('should check is type', () => {
    Assert.eq(new Assert('foo').is('string'))
  })
  it('should check min', () => {
    const v = new Assert(3)
    Assert.eq(v.min(3))
    try {
      Assert.eq(v.min(5), false)
    } catch (e) {
      Assert.isType('AssertionError', e)
    }
  })
  it('should check max', () => {
    const v = new Assert(7)
    Assert.eq(v.max(7))
    try {
      Assert.eq(v.max(5), false)
    } catch (e) {
      Assert.isType('AssertionError', e)
    }
  })
  it('should check not', () => {
    const v = new Assert(8)
    Assert.eq(v.not(7))
    try {
      Assert.eq(v.not(8), false)
    } catch (e) {
      Assert.isType('AssertionError', e)
    }
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
