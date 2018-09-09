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
 * View constructor
 * @constructor
 */
class View {
  constructor(){
    this.view = {}
  }
  /**
   * Add View
   * @param {string} name
   * @param {string} file
   * @return {string}
   */
  add(name,file){
    if(!file) file = name
    this.view[name] = file
    return file
  }
  /**
   * Update View
   * @param {string} name
   * @param {string} file
   * @return {string}
   */
  update(name,file){
    this.view[name] = file
    return file
  }
  /**
   * Remove View
   * @param {string} name
   * @return {string}
   */
  remove(name){
    let file = this.view[name]
    delete this.view[name]
    return file
  }
  /**
   * Get View
   * @param {string} name
   * @return {string}
   */
  get(name){
    return this.view[name] || 'home'
  }
}


/**
 * Export class
 * @type {View}
 */
module.exports = View
