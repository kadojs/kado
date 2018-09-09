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
 * Sanitize names for useful short names
 * @type {RegExp}
 */
const sanitizeRegexp = new RegExp(/[^0-9a-z]+/i)


/**
 * Check active nav item
 * @returns {function(*=, *): string}
 */
let checkActive = () => {
  return (text,render) =>{
    let val = render(text)
    let parts = val.split(',')
    return parts.length > 1 && parts[0] === parts[1] ? 'active' : ''
  }
}


/**
 * Nav constructor
 * @constructor
 */
class Nav {
  constructor(){
    this.nav = {}
    this.group = []
  }
  /**
   * Add Nav Group
   * @param {string} uri
   * @param {string} name
   * @param {string} icon
   */
  addGroup(uri,name,icon){
    this.nav[name] = []
    this.group.push({
      uri: uri,
      name: name,
      shortName: name.replace(sanitizeRegexp,''),
      icon: icon,
      checkActive: checkActive,
      nav: this.nav[name]
    })
  }
  /**
   * Add Nav Item
   * @param {string} group
   * @param {string} uri
   * @param {string} name
   * @param {string} icon
   */
  addItem(group,uri,name,icon){
    if(!this.nav[group]) this.addGroup(group)
    this.nav[group].push({
      uri: uri,
      name: name,
      shortName: name.replace(sanitizeRegexp,''),
      icon: icon,
      checkActive: checkActive
    })
  }

  /**
   * Return built nav entries
   * @returns {Array}
   */
  all(){
    return this.group
  }
}


/**
 * Export class
 * @type {Nav}
 */
module.exports = Nav
