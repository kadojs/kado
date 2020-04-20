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
