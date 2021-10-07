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
const util = require('util')
const Assert = require('./Assert')

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
const LARGE_ARRAY_SIZE = 200

/** Used as the `TypeError` message for "Functions" methods. */
const FUNC_ERROR_TEXT = 'Expected a function'

/** Used to stand-in for `undefined` hash values. */
const HASH_UNDEFINED = '__lodash_hash_undefined__'

/** Used to compose bitmasks for comparison styles. */
const UNORDERED_COMPARE_FLAG = 1
const PARTIAL_COMPARE_FLAG = 2

/** Used as references for various `Number` constants. */
const INFINITY = 1 / 0
const MAX_SAFE_INTEGER = 9007199254740991
const MAX_INTEGER = 1.7976931348623157e+308
const NAN = 0 / 0

/** `Object#toString` result references. */
const argsTag = '[object Arguments]'
const arrayTag = '[object Array]'
const boolTag = '[object Boolean]'
const dateTag = '[object Date]'
const errorTag = '[object Error]'
const funcTag = '[object Function]'
const genTag = '[object GeneratorFunction]'
const mapTag = '[object Map]'
const numberTag = '[object Number]'
const objectTag = '[object Object]'
const promiseTag = '[object Promise]'
const regexpTag = '[object RegExp]'
const setTag = '[object Set]'
const stringTag = '[object String]'
const symbolTag = '[object Symbol]'
const weakMapTag = '[object WeakMap]'

const arrayBufferTag = '[object ArrayBuffer]'
const dataViewTag = '[object DataView]'
const float32Tag = '[object Float32Array]'
const float64Tag = '[object Float64Array]'
const int8Tag = '[object Int8Array]'
const int16Tag = '[object Int16Array]'
const int32Tag = '[object Int32Array]'
const uint8Tag = '[object Uint8Array]'
const uint8ClampedTag = '[object Uint8ClampedArray]'
const uint16Tag = '[object Uint16Array]'
const uint32Tag = '[object Uint32Array]'

/** Used to match property names within property paths. */
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)]/
const reIsPlainProp = /^\w*$/
const reLeadingDot = /^\./
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)]|(?=(?:\.|\[])(?:\.|\[]|$))/g

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g

/** Used to match leading and trailing whitespace. */
const reTrim = /^\s+|\s+$/g

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g

/** Used to detect bad signed hexadecimal string values. */
const reIsBadHex = /^[-+]0x[0-9a-f]+$/i

/** Used to detect binary string values. */
const reIsBinary = /^0b[01]+$/i

/** Used to detect host constructors (Safari). */
const reIsHostCtor = /^\[object .+?Constructor]$/

/** Used to detect octal string values. */
const reIsOctal = /^0o[0-7]+$/i

/** Used to detect unsigned integer values. */
const reIsUint = /^(?:0|[1-9]\d*)$/

/** Used to compose unicode character classes. */
const rsAstralRange = '\\ud800-\\udfff'
const rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23'
const rsComboSymbolsRange = '\\u20d0-\\u20f0'
const rsVarRange = '\\ufe0e\\ufe0f'

/** Used to compose unicode capture groups. */
const rsAstral = '[' + rsAstralRange + ']'
const rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']'
const rsFitz = '\\ud83c[\\udffb-\\udfff]'
const rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')'
const rsNonAstral = '[^' + rsAstralRange + ']'
const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}'
const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]'
const rsZWJ = '\\u200d'

/** Used to compose unicode regexes. */
const reOptMod = rsModifier + '?'
const rsOptVar = '[' + rsVarRange + ']?'
const rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*'
const rsSeq = rsOptVar + reOptMod + rsOptJoin
const rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')'

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
const reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g')

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
// eslint-disable-next-line no-misleading-character-class
const reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']')

/** Used to identify `toStringTag` values of typed arrays. */
const typedArrayTags = {}
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
      typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
        typedArrayTags[uint32Tag] = true
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
      typedArrayTags[errorTag] = typedArrayTags[funcTag] =
        typedArrayTags[mapTag] = typedArrayTags[numberTag] =
          typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
            typedArrayTags[setTag] = typedArrayTags[stringTag] =
              typedArrayTags[weakMapTag] = false

/** Built-in method references without a dependency on `root`. */
const freeParseInt = parseInt

/** Detect free variable `global` from Node.js. */
const freeGlobal = typeof global === 'object' && global && global.Object === Object && global

/** Detect free variable `self`. */
// eslint-disable-next-line no-undef
const freeSelf = typeof self === 'object' && self && self.Object === Object && self

/** Used as a reference to the global object. */
const root = freeGlobal || freeSelf || (() => this)()

/* Node.js helper references. */
const nodeIsTypedArray = util.isTypedArray

const arraySome = (array, predicate) => {
  let index = -1
  const length = array ? array.length : 0
  while (++index < length) {
    if (predicate(array[index], index, array)) { return true }
  }
  return false
}

const baseFindIndex = (array, predicate, fromIndex, fromRight) => {
  const length = array.length
  let index = fromIndex + (fromRight ? 1 : -1)
  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index
    }
  }
  return -1
}

const baseProperty = (key) => (object) => object == null
  ? undefined
  : object[key]

const baseTimes = (n, iteratee) => {
  let index = -1
  const result = Array(n)
  while (++index < n) { result[index] = iteratee(index) }
  return result
}

const baseUnary = (func) => (value) => func(value)

const asciiSize = baseProperty('length')

const asciiToArray = (string) => string.split('')

const hasUnicode = (string) => reHasUnicode.test(string)

const unicodeSize = (string) => {
  let result = reUnicode.lastIndex = 0
  while (reUnicode.test(string)) result++
  return result
}

const unicodeToArray = (string) => string.match(reUnicode) || []

const stringSize = (string) => hasUnicode(string)
  ? unicodeSize(string)
  : asciiSize(string)

const stringToArray = (string) => hasUnicode(string)
  ? unicodeToArray(string)
  : asciiToArray(string)

const getValue = (object, key) => object == null ? undefined : object[key]

const mapToArray = (map) => {
  let index = -1
  const result = Array(map.size)
  map.forEach((value, key) => { result[++index] = [key, value] })
  return result
}

const overArg = (func, transform) => (arg) => func(transform(arg))

const setToArray = (set) => {
  let index = -1
  const result = Array(set.size)
  set.forEach((value) => { result[++index] = value })
  return result
}

/** Used for built-in method references. */
const arrayProto = Array.prototype
const funcProto = Function.prototype
const objectProto = Object.prototype

/** Used to detect overreaching core-js shims. */
const coreJsData = root['__core-js_shared__']

/** Used to detect methods masquerading as native. */
const maskSrcKey = ((() => {
  // eslint-disable-next-line no-mixed-operators
  const uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '')
  return uid ? ('Symbol(src)_1.' + uid) : ''
})())

/** Used to resolve the decompiled source of functions. */
const funcToString = funcProto.toString

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
const objectToString = objectProto.toString

/** Used to detect if a method is native. */
const reIsNative = RegExp('^' +
  funcToString.call(Object.prototype.hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\])/g, '$1.*?') + '$'
)

/** Built-in value references. */
const Symbol = root.Symbol
const Uint8Array = root.Uint8Array
const propertyIsEnumerable = objectProto.propertyIsEnumerable
const splice = arrayProto.splice

/* Built-in method references for those with the same name as other `lodash` methods. */
const nativeCeil = Math.ceil
const nativeFloor = Math.floor
const nativeKeys = overArg(Object.keys, Object)
const nativeMax = Math.max

/* Built-in method references that are verified to be native. */

const isMasked = (func) => !!maskSrcKey && (maskSrcKey in func)

const isObject = (value) => {
  const type = typeof value
  return !!value && (type === 'object' || type === 'function')
}

const isHostObject = (value) => {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  let result = false
  if (value != null && typeof value.toString !== 'function') {
    try {
      result = !!(value + '')
    } catch (e) {}
  }
  return result
}

const isFunction = (value) => {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  const tag = isObject(value) ? objectToString.call(value) : ''
  return tag === funcTag || tag === genTag
}

const baseIsNative = (value) => {
  if (!isObject(value) || isMasked(value)) {
    return false
  }
  const pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor
  return pattern.test(toSource(value))
}

const toSource = (func) => {
  if (func != null) {
    try {
      return funcToString.call(func)
    } catch (e) {}
    try {
      return (func + '')
    } catch (e) {}
  }
  return ''
}

const getNative = (object, key) => {
  const value = getValue(object, key)
  return baseIsNative(value) ? value : undefined
}
const DataView = getNative(root, 'DataView')
const Map = getNative(root, 'Map')
const Promise = getNative(root, 'Promise')
const Set = getNative(root, 'Set')
const WeakMap = getNative(root, 'WeakMap')
const nativeCreate = getNative(Object, 'create')

/** Used to detect maps, sets, and weakmaps. */
const dataViewCtorString = toSource(DataView)
const mapCtorString = toSource(Map)
const promiseCtorString = toSource(Promise)
const setCtorString = toSource(Set)
const weakMapCtorString = toSource(WeakMap)

/** Used to convert symbols to primitives and strings. */
const symbolProto = Symbol ? Symbol.prototype : undefined
const symbolValueOf = symbolProto ? symbolProto.valueOf : undefined
const symbolToString = symbolProto ? symbolProto.toString : undefined

class Hash {
  constructor (entries) {
    let index = -1
    const length = entries ? entries.length : 0
    this.clear()
    while (++index < length) {
      const entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  clear () {
    this.__data__ = nativeCreate ? nativeCreate(null) : {}
  }

  delete (key) {
    return this.has(key) && delete this.__data__[key]
  }

  get (key) {
    const data = this.__data__
    if (nativeCreate) {
      const result = data[key]
      return result === HASH_UNDEFINED ? undefined : result
    }
    return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : undefined
  }

  has (key) {
    const data = this.__data__
    return nativeCreate ? data[key] !== undefined : Object.prototype.hasOwnProperty.call(data, key)
  }

  set (key, value) {
    const data = this.__data__
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value
    return this
  }
}

const getMapData = (map, key) => {
  const data = map.__data__
  return isKeyable(key)
    ? data[typeof key === 'string' ? 'string' : 'hash']
    : data.map
}

class MapCache {
  constructor (entries) {
    let index = -1
    const length = entries ? entries.length : 0
    this.clear()
    while (++index < length) {
      const entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  clear () {
    this.__data__ = {
      hash: new Hash(),
      map: new (Map || ListCache)(),
      string: new Hash()
    }
  }

  delete (key) {
    return getMapData(this, key).delete(key)
  }

  get (key) {
    return getMapData(this, key).get(key)
  }

  has (key) {
    return getMapData(this, key).has(key)
  }

  set (key, value) {
    getMapData(this, key).set(key, value)
    return this
  }
}

const memoize = (func, resolver) => {
  if (typeof func !== 'function' || (resolver && typeof resolver !== 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT)
  }
  const memoized = () => {
    // eslint-disable-next-line no-undef
    const args = arguments
    const key = resolver ? resolver.apply(this, args) : args[0]
    const cache = memoized.cache
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.apply(this, args)
    memoized.cache = cache.set(key, result)
    return result
  }
  memoized.cache = new (memoize.Cache || MapCache)()
  return memoized
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache

const toString = (value) => value == null ? '' : baseToString(value)

const stringToPath = memoize((string) => {
  string = toString(string)
  const result = []
  if (reLeadingDot.test(string)) {
    result.push('')
  }
  string.replace(rePropName, (match, number, quote, string) => {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match))
  })
  return result
})

const isSymbol = (value) => typeof value === 'symbol' ||
  (isObjectLike(value) && objectToString.call(value) === symbolTag)

const toKey = (value) => {
  if (typeof value === 'string' || isSymbol(value)) {
    return value
  }
  const result = (value + '')
  return (result === '0' && (1 / value) === -INFINITY) ? '-0' : result
}

const castPath = (value) => isArray(value) ? value : stringToPath(value)

const isKey = (value, object) => {
  if (isArray(value)) {
    return false
  }
  const type = typeof value
  if (type === 'number' || type === 'symbol' || type === 'boolean' ||
    value == null || isSymbol(value)) {
    return true
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object))
}

const baseGet = (object, path) => {
  path = isKey(path, object) ? [path] : castPath(path)
  let index = 0
  const length = path.length
  while (object != null && index < length) {
    object = object[toKey(path[index++])]
  }
  return (index && index === length) ? object : undefined
}

const baseGetTag = (value) => objectToString.call(value)

const baseHasIn = (object, key) => object != null && key in Object(object)

const equalArrays = (array, other, equalFunc, customizer, bitmask, stack) => {
  const isPartial = bitmask & PARTIAL_COMPARE_FLAG
  const arrLength = array.length
  const othLength = other.length

  if (arrLength !== othLength && !(isPartial && othLength > arrLength)) {
    return false
  }
  // Assume cyclic values are equal.
  const stacked = stack.get(array)
  if (stacked && stack.get(other)) {
    return stacked === other
  }
  let index = -1
  let result = true
  const seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache() : undefined

  stack.set(array, other)
  stack.set(other, array)

  // Ignore non-index properties.
  while (++index < arrLength) {
    let compared
    const arrValue = array[index]
    const othValue = other[index]

    if (customizer) {
      compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack)
    }
    if (compared !== undefined) {
      if (compared) {
        continue
      }
      result = false
      break
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!seen.has(othIndex) &&
          (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
          return seen.add(othIndex)
        }
      })) {
        result = false
        break
      }
    } else if (!(
      arrValue === othValue ||
      equalFunc(arrValue, othValue, customizer, bitmask, stack)
    )) {
      result = false
      break
    }
  }
  stack.delete(array)
  stack.delete(other)
  return result
}

const equalByTag = (object, other, tag, equalFunc, customizer, bitmask, stack) => {
  let stacked = false
  let convert = () => {}
  let isPartial = false
  let result = false
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength !== other.byteLength) ||
      (object.byteOffset !== other.byteOffset)) {
        return false
      }
      object = object.buffer
      other = other.buffer

    // eslint-disable-next-line no-fallthrough
    case arrayBufferTag:
      return !((object.byteLength !== other.byteLength) ||
      !equalFunc(new Uint8Array(object), new Uint8Array(other)))

    case boolTag:
    case dateTag:
    case numberTag:
    // Coerce booleans to `1` or `0` and dates to milliseconds.
    // Invalid dates are coerced to `NaN`.
      return eq(+object, +other)

    case errorTag:
      return object.name === other.name && object.message === other.message

    case regexpTag:
    case stringTag:
    // Coerce regexes to strings and treat strings, primitives and objects,
    // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
    // for more details.
      return object === (other + '')

    case mapTag:
      convert = mapToArray

    // eslint-disable-next-line no-fallthrough
    case setTag:
      isPartial = bitmask & PARTIAL_COMPARE_FLAG
      convert || (convert = setToArray)
      if (object.size !== other.size && !isPartial) {
        return false
      }
      // Assume cyclic values are equal.
      stacked = stack.get(object)
      if (stacked) {
        return stacked === other
      }
      bitmask |= UNORDERED_COMPARE_FLAG

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other)
      result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack)
      stack.delete(object)
      return result

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) === symbolValueOf.call(other)
      }
  }
  return false
}

const equalObjects = (object, other, equalFunc, customizer, bitmask, stack) => {
  const isPartial = bitmask & PARTIAL_COMPARE_FLAG
  const objProps = keys(object)
  const objLength = objProps.length
  const othProps = keys(other)
  const othLength = othProps.length
  if (objLength !== othLength && !isPartial) {
    return false
  }
  let index = objLength
  while (index--) {
    const key = objProps[index]
    if (!(isPartial ? key in other : Object.prototype.hasOwnProperty.call(other, key))) {
      return false
    }
  }
  // Assume cyclic values are equal.
  const stacked = stack.get(object)
  if (stacked && stack.get(other)) {
    return stacked === other
  }
  let result = true
  stack.set(object, other)
  stack.set(other, object)

  let skipCtor = isPartial
  while (++index < objLength) {
    let compared
    const key = objProps[index]
    const objValue = object[key]
    const othValue = other[key]

    if (customizer) {
      compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack)
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
      ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
      : compared
    )) {
      result = false
      break
    }
    skipCtor || (skipCtor = key === 'constructor')
  }
  if (result && !skipCtor) {
    const objCtor = object.constructor
    const othCtor = other.constructor

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor !== othCtor &&
      ('constructor' in object && 'constructor' in other) &&
      !(typeof objCtor === 'function' && objCtor instanceof objCtor &&
        typeof othCtor === 'function' && othCtor instanceof othCtor)) {
      result = false
    }
  }
  stack.delete(object)
  stack.delete(other)
  return result
}

const baseIsEqualDeep = (object, other, equalFunc, customizer, bitmask, stack) => {
  const objIsArr = isArray(object)
  const othIsArr = isArray(other)
  let objTag = arrayTag
  let othTag = arrayTag

  if (!objIsArr) {
    objTag = getTag(object)
    objTag = objTag === argsTag ? objectTag : objTag
  }
  if (!othIsArr) {
    othTag = getTag(other)
    othTag = othTag === argsTag ? objectTag : othTag
  }
  const objIsObj = objTag === objectTag && !isHostObject(object)
  const othIsObj = othTag === objectTag && !isHostObject(other)
  const isSameTag = objTag === othTag

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack())
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack)
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    const objIsWrapped = objIsObj && Object.prototype.hasOwnProperty.call(object, '__wrapped__')
    const othIsWrapped = othIsObj && Object.prototype.hasOwnProperty.call(other, '__wrapped__')

    if (objIsWrapped || othIsWrapped) {
      const objUnwrapped = objIsWrapped ? object.value() : object
      const othUnwrapped = othIsWrapped ? other.value() : other

      stack || (stack = new Stack())
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack)
    }
  }
  if (!isSameTag) {
    return false
  }
  stack || (stack = new Stack())
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack)
}

const isObjectLike = (value) => !!value && typeof value === 'object'

const baseIsEqual = (value, other, customizer, bitmask, stack) => {
  if (value === other) {
    return true
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    // eslint-disable-next-line no-self-compare
    return value !== value && other !== other
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack)
}

const baseIsMatch = (object, source, matchData, customizer) => {
  let index = matchData.length
  let data
  const length = index
  const noCustomizer = !customizer

  if (object == null) {
    return !length
  }
  object = Object(object)
  while (index--) {
    data = matchData[index]
    if ((noCustomizer && data[2])
      ? data[1] !== object[data[0]]
      : !(data[0] in object)
    ) {
      return false
    }
  }
  while (++index < length) {
    data = matchData[index]
    const key = data[0]
    const objValue = object[key]
    const srcValue = data[1]
    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false
      }
    } else {
      let result
      const stack = new Stack()
      if (customizer) {
        result = customizer(objValue, srcValue, key, object, source, stack)
      }
      if (!(result === undefined
        ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
        : result
      )) {
        return false
      }
    }
  }
  return true
}

const isLength = (value) => typeof value === 'number' &&
  value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER

const baseIsTypedArray = (value) => isObjectLike(value) &&
  isLength(value.length) && !!typedArrayTags[objectToString.call(value)]

const identity = (value) => value

const property = (path) => isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path)

const baseIteratee = value => {
  if (typeof value === 'function') return value
  if (value == null) return identity
  if (typeof value === 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value)
  }
  return property(value)
}

const get = (object, path, defaultValue) => {
  const result = object == null ? undefined : baseGet(object, path)
  return result === undefined ? defaultValue : result
}

const hasPath = (object, path, hasFunc) => {
  path = isKey(path, object) ? [path] : castPath(path)

  let result
  let key
  let index = -1
  let length = path.length

  while (++index < length) {
    key = toKey(path[index])
    if (!(result = object != null && hasFunc(object, key))) {
      break
    }
    object = object[key]
  }
  if (result) {
    return result
  }
  length = object ? object.length : 0
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object))
}

const hasIn = (object, path) => object != null && hasPath(object, path, baseHasIn)

const isStrictComparable = (value) => {
  // eslint-disable-next-line no-self-compare
  return value === value && !isObject(value)
}

const matchesStrictComparable = (key, srcValue) => function (object) {
  if (object == null) {
    return false
  }
  return object[key] === srcValue &&
    (srcValue !== undefined || (key in Object(object)))
}

const baseMatchesProperty = (path, srcValue) => {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue)
  }
  return (object) => {
    const objValue = get(object, path)
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG)
  }
}

const getMatchData = (object) => {
  const result = keys(object)
  let length = result.length

  while (length--) {
    const key = result[length]
    const value = object[key]

    result[length] = [key, value, isStrictComparable(value)]
  }
  return result
}

const baseMatches = source => {
  const matchData = getMatchData(source)
  if (matchData.length === 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1])
  }
  return (object) => object === source || baseIsMatch(object, source, matchData)
}

const isPrototype = (value) => {
  const Ctor = value && value.constructor
  const proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto

  return value === proto
}

const baseKeys = (object) => {
  if (!isPrototype(object)) return nativeKeys(object)
  const result = []
  for (const key in Object(object)) {
    if (Object.prototype.hasOwnProperty.call(object, key) && key !== 'constructor') {
      result.push(key)
    }
  }
  return result
}

const basePropertyDeep = (path) => (object) => baseGet(object, path)

const baseToString = (value) => {
  if (typeof value === 'string') return value
  if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : ''
  const result = (value + '')
  return (result === '0' && (1 / value) === -INFINITY) ? '-0' : result
}

// eslint-disable-next-line no-self-compare
const eq = (value, other) => (value === other) || (value !== value && other !== other)

const isArrayLike = (value) => value != null && isLength(value.length) && !isFunction(value)

const isArrayLikeObject = value => isObjectLike(value) && isArrayLike(value)

const isArguments = (value) => {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && Object.prototype.hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) === argsTag)
}

const isArray = Array.isArray

const isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray

const toNumber = (value) => {
  if (typeof value === 'number') {
    return value
  }
  if (isSymbol(value)) {
    return NAN
  }
  if (isObject(value)) {
    const other = typeof value.valueOf === 'function' ? value.valueOf() : value
    value = isObject(other) ? (other + '') : other
  }
  if (typeof value !== 'string') {
    return value === 0 ? value : +value
  }
  value = value.replace(reTrim, '')
  const isBinary = reIsBinary.test(value)
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value)
}

const toFinite = (value) => {
  if (!value) {
    return value === 0 ? value : 0
  }
  value = toNumber(value)
  if (value === INFINITY || value === -INFINITY) {
    const sign = (value < 0 ? -1 : 1)
    return sign * MAX_INTEGER
  }
  // eslint-disable-next-line no-self-compare
  return value === value ? value : 0
}

const toInteger = (value) => {
  const result = toFinite(value)
  const remainder = result % 1
  // eslint-disable-next-line no-self-compare
  return result === result ? (remainder ? result - remainder : result) : 0
}

const keys = (object) => {
  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {Array} Returns the array of property names.
   */
  const arrayLikeKeys = (value) => {
    // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
    // Safari 9 makes `arguments.length` enumerable in strict mode.
    const result = (isArray(value) || isArguments(value))
      ? baseTimes(value.length, String)
      : []
    const length = result.length
    const skipIndexes = !!length
    for (const key in value) {
      if ((Object.prototype.hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key === 'length' || isIndex(key, length)))) {
        result.push(key)
      }
    }
    return result
  }
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object)
}

const assocIndexOf = (array, key) => {
  let length = array.length
  while (length--) {
    if (eq(array[length][0], key)) {
      return length
    }
  }
  return -1
}

class ListCache {
  constructor (entries) {
    let index = -1
    const length = entries ? entries.length : 0
    this.clear()
    while (++index < length) {
      const entry = entries[index]
      this.set(entry[0], entry[1])
    }
  }

  clear () {
    this.__data__ = []
  }

  delete (key) {
    const data = this.__data__
    const index = assocIndexOf(data, key)
    if (index < 0) {
      return false
    }
    const lastIndex = data.length - 1
    if (index === lastIndex) {
      data.pop()
    } else {
      splice.call(data, index, 1)
    }
    return true
  }

  get (key) {
    const data = this.__data__
    const index = assocIndexOf(data, key)
    return index < 0 ? undefined : data[index][1]
  }

  has (key) {
    return assocIndexOf(this.__data__, key) > -1
  }

  set (key, value) {
    const data = this.__data__
    const index = assocIndexOf(data, key)
    if (index < 0) {
      data.push([key, value])
    } else {
      data[index][1] = value
    }
    return this
  }
}

class SetCache {
  constructor (values) {
    let index = -1
    const length = values ? values.length : 0
    this.__data__ = new MapCache()
    while (++index < length) {
      this.add(values[index])
    }
    this.push = SetCache.prototype.add
  }

  add (value) {
    this.__data__.set(value, HASH_UNDEFINED)
    return this
  }

  has (value) {
    return this.__data__.has(value)
  }
}

class Stack {
  constructor (entries) {
    this.__data__ = new ListCache(entries)
  }

  clear () {
    this.__data__ = new ListCache()
  }

  delete (key) {
    return this.__data__.delete(key)
  }

  get (key) {
    return this.__data__.get(key)
  }

  has (key) {
    return this.__data__.has(key)
  }

  set (key, value) {
    let cache = this.__data__
    if (cache instanceof ListCache) {
      const pairs = cache.__data__
      if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value])
        return this
      }
      cache = this.__data__ = new MapCache(pairs)
    }
    cache.set(key, value)
    return this
  }
}

const isIndex = (value, length) => {
  length = length == null ? MAX_SAFE_INTEGER : length
  return !!length &&
    (typeof value === 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 === 0 && value < length)
}

let getTag = baseGetTag

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) !== dataViewTag) ||
  (Map && getTag(new Map()) !== mapTag) ||
  (Promise && getTag(Promise.resolve()) !== promiseTag) ||
  (Set && getTag(new Set()) !== setTag) ||
  (WeakMap && getTag(new WeakMap()) !== weakMapTag)) {
  getTag = (value) => {
    const result = objectToString.call(value)
    const Ctor = result === objectTag ? value.constructor : undefined
    const ctorString = Ctor ? toSource(Ctor) : undefined
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag
        case mapCtorString: return mapTag
        case promiseCtorString: return promiseTag
        case setCtorString: return setTag
        case weakMapCtorString: return weakMapTag
      }
    }
    return result
  }
}

const baseExtremum = (array, iteratee, comparator) => {
  let index = -1
  let computed = -1
  let result = -1
  const length = array.length
  while (++index < length) {
    const value = array[index]
    const current = iteratee(value)
    if (current != null && (computed === undefined
      // eslint-disable-next-line no-self-compare
      ? (current === current && !isSymbol(current))
      : comparator(current, computed)
    )) {
      computed = current
      result = value
    }
  }
  return result
}

const baseGt = (value, other) => value > other

const baseRepeat = (string, n) => {
  let result = ''
  if (!string || n < 1 || n > MAX_SAFE_INTEGER) return result
  do {
    if (n % 2) result += string
    n = nativeFloor(n / 2)
    if (n) string += string
  } while (n)
  return result
}

const baseSlice = (array, start, end) => {
  let index = -1
  let length = array.length
  if (start < 0) {
    start = -start > length ? 0 : (length + start)
  }
  end = end > length ? length : end
  if (end < 0) {
    end += length
  }
  length = start > end ? 0 : ((end - start) >>> 0)
  start >>>= 0
  const result = Array(length)
  while (++index < length) {
    result[index] = array[index + start]
  }
  return result
}

const castSlice = (array, start, end) => {
  const length = array.length
  end = end === undefined ? length : end
  return (!start && end >= length) ? array : baseSlice(array, start, end)
}

const createPadding = (length, chars) => {
  chars = chars === undefined ? ' ' : baseToString(chars)
  const charsLength = chars.length
  if (charsLength < 2) {
    return charsLength ? baseRepeat(chars, length) : chars
  }
  const result = baseRepeat(chars, nativeCeil(length / stringSize(chars)))
  return hasUnicode(chars)
    ? castSlice(stringToArray(result), 0, length).join('')
    : result.slice(0, length)
}

const isKeyable = (value) => {
  const type = typeof value
  return (
    type === 'string' ||
    type === 'number' ||
    type === 'symbol' ||
    type === 'boolean'
  )
    ? (value !== '__proto__')
    : (value === null)
}

const isIterateeCall = (value, index, object) => {
  if (!isObject(object)) return false
  const type = typeof index
  if (type === 'number'
    ? (isArrayLike(object) && isIndex(index, object.length))
    : (type === 'string' && index in object)
  ) {
    return eq(object[index], value)
  }
  return false
}

const createFind = (findIndexFunc) => (collection, predicate, fromIndex) => {
  let iteratee
  const iterable = Object(collection)
  if (!isArrayLike(collection)) {
    iteratee = baseIteratee(predicate, 3)
    collection = keys(collection)
    predicate = (key) => iteratee(iterable[key], key, iterable)
  }
  const index = findIndexFunc(collection, predicate, fromIndex)
  return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined
}

const findIndex = (array, predicate, fromIndex) => {
  const length = array ? array.length : 0
  if (!length) {
    return -1
  }
  let index = fromIndex == null ? 0 : toInteger(fromIndex)
  if (index < 0) {
    index = nativeMax(length + index, 0)
  }
  return baseFindIndex(array, baseIteratee(predicate, 3), index)
}

module.exports = class Util {
  static is () {
    return (text, render) => {
      const parts = render(text).split(',')
      Assert.isOk(parts.length === 3, 'Failed parsing _is')
      let cond = true
      if (parts[0] === '' || parts[0] === 'false' || parts[0] === false) {
        cond = false
      }
      return cond ? parts[1] : parts[2]
    }
  }

  static compare () {
    return (text, render) => {
      const parts = render(text).split(',')
      Assert.isOk(parts.length === 4, 'Failed parsing _compare')
      let cond = true
      if (parts[0] !== parts[1]) {
        cond = false
      }
      return cond ? parts[2] : parts[3]
    }
  }

  static find (collection, predicate, fromIndex) {
    const f = createFind(findIndex)
    return f.call(f, [collection, predicate, fromIndex])
  }

  static max (array) {
    return (array && array.length)
      ? baseExtremum(array, identity, baseGt)
      : undefined
  }

  static padStart (string, length, chars) {
    string = toString(string)
    length = toInteger(length)
    const strLength = length ? stringSize(string) : 0
    return (length && strLength < length)
      ? (createPadding(length - strLength, chars) + string)
      : string
  }

  static repeat (string, n, guard) {
    if ((guard ? isIterateeCall(string, n, guard) : n === undefined)) {
      n = 1
    } else {
      n = toInteger(n)
    }
    return baseRepeat(toString(string), n)
  }
}
