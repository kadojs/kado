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

module.exports = class Mapper {
  static getInstance () { return new Mapper() }
  static mergeObject (obj1, obj2, depth = 0, maxDepth = 50) {
    for (const key in obj2) {
      // skip externals
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) continue
      // define obj1 if needed
      if (obj1 === undefined) {
        if (obj2 instanceof Array) obj1 = []
        else obj1 = {}
      }
      // recursive object
      if (obj2[key] instanceof Object) {
        if (depth > maxDepth) {
          throw new Error(`Max object merge depth reached ${maxDepth}`)
        }
        depth++
        obj2[key] = Mapper.mergeObject(obj1[key], obj2[key], depth, maxDepth)
      }
      // merge value
      if (obj2 instanceof Array) obj1.push(obj2[key])
      else obj1[key] = obj2[key]
    }
    return obj1
  }

  static getFromObject (base, keyArray) {
    const key = keyArray.shift()
    if (key && keyArray.length === 0) return base[key]
    return Mapper.getFromObject(base[key], keyArray)
  }

  static setToObject (base, keyArray, value) {
    if (!(base instanceof Object)) {
      throw new Error(`Base is not an object ${base}`)
    }
    let ctx = base
    const keyMax = keyArray.length - 1
    for (const [i, key] of keyArray.entries()) {
      if (i < keyMax && undefined === ctx[key]) ctx[key] = {}
      else if (i === keyMax) ctx[key] = value
      ctx = ctx[key]
    }
    return base
  }

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

  constructor (data) {
    this.merge(data)
  }

  merge (data) {
    Mapper.mergeObject(this, data || {})
    return this
  }

  get (key) {
    return Mapper.getFromObject(this, Mapper.parseKey(key))
  }

  set (key, value) {
    Mapper.setToObject(this, Mapper.parseKey(key), value)
    return value
  }

  delete (key) {
    const keys = Mapper.parseKey(key)
    const rv = keys[keys.length - 1]
    Mapper.deleteFromObject(this, keys)
    return rv
  }

  all () {
    return this
  }
}
