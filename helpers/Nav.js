'use strict';



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
  this.group.push({uri: uri, name: name, icon: icon})
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
  this.nav[group].push({uri: uri, name: name, icon: icon})
}


/**
 * Export Class
 * @type {Function}
 */
module.exports = exports = Nav
