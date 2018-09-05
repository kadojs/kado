'use strict';


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
