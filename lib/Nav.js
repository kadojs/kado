'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Nav {
  static getInstance(){ return new Nav() }
  constructor(){
    this.nav = {}
    this.group = []
    this.sanitizeRegexp = new RegExp(/[^0-9a-z]+/i)
  }
  static checkActive(){
    return (text,render) =>{
      let val = render(text)
      let parts = val.split(',')
      return parts.length > 1 && parts[0] === parts[1] ? 'active' : ''
    }
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
      shortName: name.replace(this.sanitizeRegexp,''),
      icon: icon,
      checkActive: this.checkActive,
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
    return this.group
  }
  allNav(){
    return this.nav
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
      shortName: name.replace(this.sanitizeRegexp,''),
      icon: icon,
      checkActive: this.checkActive
    }
    this.nav[group].push(entry)
    return entry
  }
}
