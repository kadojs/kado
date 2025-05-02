/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
