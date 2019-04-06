'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


/**
 * Asset constructor
 * @constructor
 */
class Asset {
  constructor(){
    this.css = []
    this.script = []
  }

  /**
   * Add CSS Asset
   * @param {string} uri
   * @return {string}
   */
  addCss(uri){
    if(this.css.filter((entry)=>{return (entry.uri === uri)}).length === 0){
      this.css.push({uri: uri})
    }
    return uri
  }
  /**
   * Add Script Asset
   * @param {string} uri
   * @param {boolean} defer
   * @return {string}
   */
  addScript(uri,defer){
    if(false !== defer) defer = true
    let entry = {uri: uri, defer: !!defer}
    if(this.script.filter((entry)=>{return (entry.uri === uri)}).length === 0){
      this.script.push(entry)
    }
    return entry
  }
  /**
   * Remove Css
   * @param {string} uri
   */
  removeCss(uri){
    this.css.filter((entry)=>{
      return (entry.uri === uri)
    })
    return true
  }
  /**
   * Remove Script
   * @param {string} uri
   */
  removeScript(uri){
    this.script.filter((entry)=>{
      return (entry.uri === uri)
    })
    return true
  }
  /**
   * Return all CSS for Templating
   * @returns {Array}
   */
  allCss(){
    return this.css
  }
  /**
   * Return all Scripts for Templating
   * @returns {Array}
   */
  allScript(){
    return this.script
  }
}


/**
 * Export class
 * @type {URI}
 */
module.exports = Asset
