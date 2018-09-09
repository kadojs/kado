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
 * URI constructor
 * @constructor
 */
class URI {
  constructor(){
    this.uri = {}
  }
  /**
   * Add URI
   * @param {string} name
   * @param {string} uri
   * @return {string}
   */
  add(name,uri){
    if(!uri) uri = name
    this.uri[name] = uri
    return uri
  }
  /**
   * Update URI
   * @param {string} name
   * @param {string} uri
   * @return {string}
   */
  update(name,uri){
    this.uri[name] = uri
    return uri
  }
  /**
   * Remove URI
   * @param {string} name
   */
  remove(name){
    let uri = this.uri[name]
    delete this.uri[name]
    return uri
  }
  /**
   * Get URI
   * @param {string} name
   * @return {string}
   */
  get(name){
    return this.uri[name] || '/'
  }
}


/**
 * Export class
 * @type {URI}
 */
module.exports = URI
