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
    this.cssOnce = []
    this.script = []
    this.scriptOnce = []
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
   * Add CSS Asset Once
   * @param {string} uri
   * @return {string}
   */
  addCssOnce(uri){
    if(this.cssOnce.filter((entry)=>{return (entry.uri === uri)}).length === 0){
      this.cssOnce.push({uri: uri})
    }
    return uri
  }
  /**
   * Add Script Asset
   * @param {string} uri
   * @param {string} defer
   * @return {string}
   */
  addScript(uri,defer){
    if('defer' !== defer) defer = ''
    let entry = {uri: uri, defer: defer === 'defer'}
    if(this.script.filter((entry)=>{return (entry.uri === uri)}).length === 0){
      this.script.push(entry)
    }
    return entry
  }
  /**
   * Add Script Asset Once
   * @param {string} uri
   * @param {string} defer
   * @return {string}
   */
  addScriptOnce(uri,defer){
    if('defer' !== defer) defer = ''
    let entry = {uri: uri, defer: defer === 'defer'}
    if(this.scriptOnce.filter((entry)=>{
      return (entry.uri === uri)
    }).length === 0){
      this.scriptOnce.push(entry)
    }
    return entry
  }
  /**
   * Remove Css
   * @param {string} uri
   */
  removeCss(uri){
    this.css = this.css.filter((entry)=>{
      return (entry.uri === uri)
    })
    return true
  }
  /**
   * Remove Css Once
   * @param {string} uri
   */
  removeCssOnce(uri){
    this.cssOnce = this.cssOnce.filter((entry)=>{
      return (entry.uri === uri)
    })
    return true
  }
  /**
   * Remove Script
   * @param {string} uri
   */
  removeScript(uri){
    this.script = this.script.filter((entry)=>{
      return (entry.uri === uri)
    })
    return true
  }
  /**
   * Remove Script Once
   * @param {string} uri
   */
  removeScriptOnce(uri){
    this.scriptOnce = this.scriptOnce.filter((entry)=>{
      return (entry.uri === uri)
    })
    return true
  }
  /**
   * Return all CSS for Templating
   * @returns {Array}
   */
  allCss(){
    let result = [].concat(this.css,this.cssOnce)
    this.cssOnce = []
    return result
  }
  /**
   * Return all Scripts for Templating
   * @returns {Array}
   */
  allScript(){
    let result = [].concat(this.script,this.scriptOnce)
    this.scriptOnce = []
    return result
  }
}


/**
 * Export class
 * @type {URI}
 */
module.exports = Asset
