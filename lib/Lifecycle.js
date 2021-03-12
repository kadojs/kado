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
const Assert = require('./Assert')
const EventEmitter = require('events').EventEmitter
class Lifecycle extends EventEmitter {
  constructor () {
    super()
    this.items = {}
  }

  nextIndex () {
    return Object.keys(this.items).length
  }

  list () {
    return Object.keys(this.items)
  }

  get (title) {
    for (const i in this.items) {
      if (!Object.prototype.hasOwnProperty.call(this.items, i)) continue
      if (title === i || this.items[i].title === title) return this.items[i]
    }
    return false
  }

  add (title, start, stop) {
    const index = this.nextIndex()
    const noop = () => {}
    if (typeof title === 'function') {
      start = title
      stop = start
      title = index
    }
    this.items[index] = {
      index: index,
      title: title,
      start: start || noop,
      stop: stop || noop
    }
    return this.items[index]
  }

  remove (title) {
    let item = null
    for (const i in this.items) {
      if (!Object.prototype.hasOwnProperty.call(this.items, i)) continue
      if (this.items[i].title === title) {
        item = this.items[i]
        delete this.items[i]
      }
    }
    return item === null ? false : item
  }

  execute (keys, method) {
    const key = keys.shift()
    const item = this.get(key)
    Assert.isOk(item, `Could not find item ${key}`)
    Assert.isOk(typeof item[method] === 'function',
      `Invalid lifecycle method ${method} not defined`)
    if (key && keys.length === 0) {
      return Promise.resolve().then(() => {
        this.emit(method, item)
        return item[method]()
      })
    } else {
      return Promise.resolve()
        .then(() => {
          this.emit(method, item)
          return item[method]()
        })
        .then(() => { return this.execute(keys, method) })
    }
  }

  start () {
    return this.execute(Object.keys(this.items), 'start')
  }

  stop () {
    return this.execute(Object.keys(this.items), 'stop')
  }
}
module.exports = Lifecycle
