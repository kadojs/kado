'use strict';

let isActive = function(){
  return function(text,render){
    let val = render(text)
    let parts = val.split(',')
    return parts.length > 1 && parts[0] === parts[1] ? 'active' : ''
  }
}


/**
 * Nav constructor
 * @constructor
 */
let Nav = function(){
  this.nav = {}
  this.group = []
}


/**
 * Add Nav Group
 * @param {string} uri
 * @param {string} name
 * @param {string} icon
 */
Nav.prototype.addGroup = function(uri,name,icon){
  this.nav[name] = []
  this.group.push({
    uri: uri,
    name: name,
    icon: icon,
    isActive: isActive,
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
Nav.prototype.addItem = function(group,uri,name,icon){
  if(!this.nav[group]) this.addGroup(group)
  this.nav[group].push({
    uri: uri,
    name: name,
    icon: icon,
    isActive: isActive
  })
}


/**
 * Export Class
 * @type {Function}
 */
module.exports = exports = Nav
