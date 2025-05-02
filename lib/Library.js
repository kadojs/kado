/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = class Library {
  static getInstance () { return new Library() }
  constructor () {
    this.fs = require('./FileSystem')
    this.paths = {}
    this.libraries = {}
  }

  nextKey (obj) {
    const keys = Object.keys(obj)
    if (keys.length > 0) return +keys.pop() + 1
    return 0
  }

  addPath (path) {
    if (this.existsPath(path)) return path
    this.paths[this.nextKey(this.paths)] = path
    return path
  }

  existsPath (path) {
    for (const key in this.paths) {
      if (
        Object.prototype.hasOwnProperty.call(this.paths, key) &&
        this.paths[key] === path
      ) {
        return this.paths[key]
      }
    }
    return false
  }

  removePath (path) {
    for (const key in this.paths) {
      if (
        Object.prototype.hasOwnProperty.call(this.paths, key) &&
        this.paths[key] === path
      ) {
        const removed = this.paths[key]
        delete this.paths[key]
        return removed
      }
    }
    return false
  }

  add (name, file) {
    this.libraries[name] = file
    return file
  }

  exists (name) {
    return this.libraries[name] ? this.libraries[name] : false
  }

  remove (name) {
    delete this.libraries[name]
    return name
  }

  search (name) {
    if (this.libraries[name]) return this.libraries[name]
    for (const key in this.paths) {
      if (Object.prototype.hasOwnProperty.call(this.paths, key)) {
        const file = this.fs.path.resolve(
          this.fs.path.join(this.paths[key], name + '.js')
        )
        if (this.fs.exists(file)) return this.add(name, file)
      }
    }
    throw new Error('Failed to find library: ' + name)
  }
}
