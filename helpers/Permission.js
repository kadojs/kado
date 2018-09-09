'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
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


/**
 * Permission constructor
 * @constructor
 */
class Permission {
  constructor(){
    this.perm = {}
  }
  /**
   * Add Permission
   * @param {string} name
   * @param {description} description
   * @return {string}
   */
  add(name,description){
    if(!description) description = name
    this.perm[name] = {name: name, description: description}
    return name
  }
  /**
   * Remove Permission
   * @param {string} name
   * @return {string}
   */
  remove(name){
    delete this.perm[name]
    return name
  }
  /**
   * Get Permission
   * @param {string} name
   * @return {string}
   */
  get(name){
    let p
    for(let i in this.perm){
      if(this.perm.hasOwnProperty(i)){
        let r = new RegExp('^' + i,'i')
        if(name.match(r)) p = this.perm[i]
      }
    }
    return p
  }
  /**
   * Check if permission exists
   * @param {string} name
   * @return {boolean}
   */
  exists(name){
    return !!this.get(name)
  }
  /**
   * Check if permission is allowed
   * @param {string} name
   * @param {Permission} set
   * @return {boolean}
   */
  allowed(name,set){
    if(!set) return true
    let p = this.get(name)
    if(!p) return true
    return -1 !== set.indexOf(p.name)
  }
  /**
   * Digest permission set a comparative setup
   * @return {Array}
   */
  digest(){
    return Object.keys(this.perm)
  }
  /**
   * Return all perm entries
   * @return {[]}
   */
  all(){
    let all = []
    for(let i in this.perm){
      if(this.perm.hasOwnProperty(i)){
        all.push(this.perm[i])
      }
    }
    return all
  }
}


/**
 * Export class
 * @type {Permission}
 */
module.exports = Permission
