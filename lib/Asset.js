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
    this.asset = {}
    this.assetOnce = {}
  }

  /**
   * Get current assets
   * @param {string} mimeType Filter by mimeType
   * @returns {[]}
   */
  get(mimeType){
    let asset = []
    if(mimeType){
      asset = this.asset.filter((entry)=>{ return entry.type === mimeType })
    }
    return asset
  }
  getArray(){
    let once = []
    for(let key in this.asset){
      if(this.asset.hasOwnProperty(key)) once.push(this.asset[key])
    }
    return once
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
  getOnceArray(){
    let once = []
    for(let key in this.assetOnce){
      if(this.assetOnce.hasOwnProperty(key)) once.push(this.assetOnce[key])
    }
    return once
  }

  /**
   * Check if asset exists
   * @param uri
   * @returns {[]}
   */
  exists(uri){
    return this.getArray().filter((entry)=>{ return (entry.uri === uri) })
  }

  /**
   * Check if asset exists for once off
   * @param uri
   * @returns {[]}
   */
  existsOnce(uri){
    return this.getOnceArray().filter((entry)=>{ return (entry.uri === uri) })
  }

  nextKey(obj){
    return +Object.keys(obj).pop() + 1
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
      let key = this.nextKey(this.asset)
      this.asset[key] = {
        uri: uri,
        type: mimeType || 'text/plain',
        defer: defer
      }
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
      let key = this.nextKey(this.assetOnce)
      this.assetOnce[key] = {
        uri: uri,
        type: mimeType || 'text/plain',
        defer: defer
      }
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
    let lastAsset = null
    for(let key in this.asset){
      if(!this.asset.hasOwnProperty(key)) break
      let asset = this.asset[key]
      if(asset.uri === uri){
        lastAsset = asset
        removed = true
        delete this.asset[key]
      }
    }
    return lastAsset
  }

  /**
   * Remove Asset Once
   * @param {string} uri
   */
  removeOnce(uri){
    let removed = false
    let lastAsset = null
    for(let key in this.assetOnce){
      if(!this.assetOnce.hasOwnProperty(key)) break
      let asset = this.assetOnce[key]
      if(asset.uri === uri){
        lastAsset = asset
        removed = true
        delete this.assetOnce[key]
      }
    }
    return lastAsset
  }

  /**
   * Return all CSS for Templating
   * @param {string} mimeType Filter the results by mime type
   * @param {boolean} clearOnce Clear the once array on return
   * @returns {Array}
   */
  all(mimeType,clearOnce){
    let asset = []
    for(let key in this.asset){
      if(!this.asset.hasOwnProperty(key)) break
      if(mimeType && this.asset[key].type !== mimeType) break
      asset.push(this.asset[key])
    }
    for(let key in this.assetOnce){
      if(!this.assetOnce.hasOwnProperty(key)) break
      if(mimeType && this.assetOnce[key].type !== mimeType) break
      asset.push(this.assetOnce[key])
      if(clearOnce !== false) delete this.assetOnce[key]
    }
    return asset
  }
}


/**
 * Export class
 * @type {Asset}
 */
module.exports = Asset
