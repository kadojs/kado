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

module.exports = class Permission {
  static getInstance () { return new Permission() }
  constructor () {
    this.perm = {}
  }

  /**
   * Add Permission
   * @param {string} name
   * @param {description} description
   * @return {string}
   */
  add (name, description) {
    if (!description) description = name
    this.perm[name] = { name: name, description: description }
    return this.perm[name]
  }

  /**
   * Remove Permission
   * @param {string} name
   * @return {string}
   */
  remove (name) {
    if (this.perm && this.perm[name]) {
      delete this.perm[name]
      return true
    }
    return false
  }

  /**
   * Get Permission
   * @param {string} name
   * @return {string}
   */
  get (name) {
    return this.perm[name] ? this.perm[name] : false
  }

  /**
   * Check if permission exists
   * @param {string} name
   * @return {boolean}
   */
  exists (name) {
    return !!this.get(name)
  }

  /**
   * Check if permission is allowed
   * @param {string} name
   * @param {Permission} set
   * @return {boolean}
   */
  allowed (name, set) {
    if (!set) return true
    const p = this.get(name)
    if (!p) return true
    return set.indexOf(p.name) !== -1
  }

  /**
   * Digest permission set a comparative setup
   * @return {Array}
   */
  digest () {
    return Object.keys(this.perm)
  }

  /**
   * Return all perm entries
   * @return {[]}
   */
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
