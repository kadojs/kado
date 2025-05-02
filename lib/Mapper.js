/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')

module.exports = class Mapper {
  static getInstance (data) { return new Mapper(data) }

  static deleteFromObject (base, keyArray, ctx = null) {
    const key = keyArray.shift()
    if (key && keyArray.length === 0) {
      if (!ctx) ctx = base
      delete ctx[key]
      return base
    }
    if (!ctx) ctx = base
    return Mapper.deleteFromObject(base, keyArray, ctx[key])
  }

  static getFromObject (base, keyArray) {
    const key = keyArray.shift()
    if (key && keyArray.length === 0) return base[key]
    return Mapper.getFromObject(base[key], keyArray)
  }

  static mergeObject (base, overlay, depth = 0, maxDepth = 50) {
    // define base if needed
    if (base === undefined) {
      if (overlay instanceof Array) base = []
      else base = {}
    }
    for (const key in overlay) {
      // skip externals
      if (!Object.prototype.hasOwnProperty.call(overlay, key)) continue
      // recursive object
      if (overlay[key] instanceof Object && !(overlay[key] instanceof Date)) {
        Assert.isOk(depth <= maxDepth,
          `Max object merge depth reached ${maxDepth}`)
        overlay[key] = Mapper.mergeObject(
          base[key], overlay[key], depth + 1, maxDepth
        )
      }
      // merge value
      if (overlay instanceof Array && base instanceof Array) {
        base.push(overlay[key])
      } else base[key] = overlay[key]
    }
    return base
  }

  static parseKey (key) {
    if (key instanceof Array) return key
    if (typeof key === 'string') {
      key = key.split('.')
    }
    if (typeof key === 'function') {
      key = key()
    }
    if (!(key instanceof Array)) key = [key]
    return key
  }

  static setToObject (base, keyArray, value) {
    Assert.isOk(base instanceof Object, `Base is not an object ${base}`)
    let ctx = base
    const keyMax = keyArray.length - 1
    for (const [i, key] of keyArray.entries()) {
      if (i < keyMax && undefined === ctx[key]) ctx[key] = {}
      else if (i === keyMax) ctx[key] = value
      ctx = ctx[key]
    }
    return base
  }

  constructor (data) {
    this.merge(data)
  }

  all () {
    return this
  }

  delete (key) {
    const keys = Mapper.parseKey(key)
    const rv = keys[keys.length - 1]
    Mapper.deleteFromObject(this, keys)
    return rv
  }

  get (key) {
    return Mapper.getFromObject(this, Mapper.parseKey(key))
  }

  map (iterator) {
    if (!iterator) return this
    Object.keys(this).map((key) => {
      return iterator(this.get(key), key)
    })
    return this
  }

  merge (data) {
    Mapper.mergeObject(this, data || {})
    return this
  }

  set (key, value) {
    Mapper.setToObject(this, Mapper.parseKey(key), value)
    return value
  }
}
