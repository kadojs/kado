'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
    let entry = {
      uri: uri,
      name: name,
      shortName: name.replace(sanitizeRegexp,''),
      icon: icon,
      checkActive: checkActive,
      nav: this.nav[name]
    }
    this.group.push(entry)
    return entry
  }
  /**
   * Get Nav entry by name
   * @param {string} name
   * @return {*}
   */
  get(name){
    return this.nav[name]
  }
  all() {
    return this.nav
  }
  allGroups() {
    return this.group
  }
  /**
   * Add Nav Item
   * @param {string} group
   * @param {string} uri
   * @param {string} name
   * @param {string} icon
   */
  addItem(group,uri,name,icon){
    if(!this.nav[group]) this.addGroup('/',group)
    let entry = {
      uri: uri,
      name: name,
      shortName: name.replace(sanitizeRegexp,''),
      icon: icon,
      checkActive: checkActive
    }
    this.nav[group].push(entry)
    return entry
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
