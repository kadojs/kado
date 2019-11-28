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
    this.asset = []
    this.assetOnce = []
  }

  /**
   * Get current assets
   * @param {string} mimeType Filter by mimeType
   * @returns {[]}
   */
  get(mimeType){
    let asset = []
    if(mimeType){
      asset = this.asset.filter((entry)=>{
        return entry.type === mimeType
      })
    }
    return asset
  }

  /**
   * Get current one time assets
   * @param {string} mimeType Filter by mimeType
   * @returns {[]}
   */
  getOnce(mimeType){
    let assetOnce = []
    if(mimeType){
      assetOnce = this.assetOnce.filter((entry)=>{
        return entry.type === mimeType
      })
    }
    return assetOnce
  }

  /**
   * Check if asset exists
   * @param uri
   * @returns {[]}
   */
  exists(uri){
    return this.asset.filter((entry)=>{return (entry.uri === uri)})
  }

  /**
   * Check if asset exists for once off
   * @param uri
   * @returns {[]}
   */
  existsOnce(uri){
    return this.assetOnce.filter((entry)=>{return (entry.uri === uri)})
  }

  /**
   * Add Asset
   * @param {string} uri URI to access the asset
   * @param {string} mimeType Type mimeType of the asset
   * @param {boolean} defer defer loading or not js only
   * @return {string}
   */
  add(uri,mimeType,defer){
    if(this.exists(uri).length === 0){
      this.asset.push({uri: uri, type: mimeType || 'text/plain', defer: defer})
    }
    return uri
  }
  addCss(uri){
    return this.add(uri,'text/css')
  }
  addScript(uri,defer){
    return this.add(uri,'text/javascript',defer)
  }

  /**
   * Add Asset Once
   * @param {string} uri URI to access the asset
   * @param {string} mimeType Type mimeType of the asset
   * @param {boolean} defer defer loading or not js only
   * @return {string}
   */
  addOnce(uri,mimeType,defer){
    if(this.existsOnce(uri).length === 0){
      this.assetOnce.push({
        uri: uri, type: mimeType || 'text/plain', defer: defer})
    }
    return uri
  }
  addCssOnce(uri){
    return this.addOnce(uri,'text/css')
  }
  addScriptOnce(uri,defer){
    return this.addOnce(uri,'text/javascript',defer)
  }

  /**
   * Remove Asset
   * @param {string} uri
   */
  remove(uri){
    let removed = false
    this.asset = this.asset.filter((entry)=>{
      if(entry.uri !== uri){
        return true
      } else {
        removed = true
        return false
      }
    })
    return removed
  }

  /**
   * Remove Asset Once
   * @param {string} uri
   */
  removeOnce(uri){
    let removed = false
    this.assetOnce = this.assetOnce.filter((entry)=>{
      if(entry.uri !== uri){
        return true
      } else {
        removed = true
        return false
      }
    })
    return removed
  }

  /**
   * Return all CSS for Templating
   * @param {string} mimeType Filter the results by mime type
   * @param {boolean} clearOnce Clear the once array on return
   * @returns {Array}
   */
  all(mimeType,clearOnce){
    let asset = []
    let assetOnce = []
    if(mimeType){
      asset = this.asset.filter((entry)=>{
        return entry.type === mimeType
      })
      assetOnce = this.assetOnce.filter((entry)=>{
        return entry.type === mimeType
      })
    } else {
      this.asset.forEach((e)=>{asset.push(e)})
      this.assetOnce.forEach((e)=>{assetOnce.push(e)})
    }
    let result = [].concat(asset,assetOnce)
    if(clearOnce !== false) this.assetOnce = []
    return result
  }
}


/**
 * Export class
 * @type {Asset}
 */
module.exports = Asset
