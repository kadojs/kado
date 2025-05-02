/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = class Permission {
  static getInstance () { return new Permission() }
  constructor () {
    this.perm = {}
  }

  add (name, description) {
    if (!description) description = name
    this.perm[name] = { name: name, description: description }
    return this.perm[name]
  }

  remove (name) {
    if (this.perm && this.perm[name]) {
      delete this.perm[name]
      return true
    }
    return false
  }

  get (name) {
    return this.perm[name] ? this.perm[name] : false
  }

  exists (name) {
    return !!this.get(name)
  }

  allowed (name, set) {
    if (!set) return true
    const p = this.get(name)
    if (!p) return true
    return set.indexOf(p.name) !== -1
  }

  digest () {
    return Object.keys(this.perm)
  }

  all () {
    const all = []
    for (const i in this.perm) {
      if (Object.prototype.hasOwnProperty.call(this.perm, i)) {
        all.push(this.perm[i])
      }
    }
    return all
  }
}
