'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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

module.exports = class Asset {
  static getInstance () { return new Asset() }
  constructor () {
    this.asset = {}
    this.assetOnce = {}
  }

  /**
   * Get current assets
   * @param {string} mimeType Filter by mimeType
   * @returns {[]}
   */
  get (mimeType) {
    const asset = []
    for (const key in this.asset) {
      if (!Object.prototype.hasOwnProperty.call(this.asset, key)) continue
      if (mimeType && this.asset[key].type !== mimeType) continue
      asset.push(this.asset[key])
    }
    return asset
  }

  /**
   * Get current one time assets
   * @param {string} mimeType Filter by mimeType
   * @returns {[]}
   */
  getOnce (mimeType) {
    const assetOnce = []
    for (const key in this.assetOnce) {
      if (!Object.prototype.hasOwnProperty.call(this.assetOnce, key)) continue
      if (mimeType && this.assetOnce[key].type !== mimeType) continue
      assetOnce.push(this.assetOnce[key])
    }
    return assetOnce
  }

  /**
   * Check if asset exists
   * @param uri
   * @returns {[]}
   */
  exists (uri) {
    return this.get().filter((entry) => { return (entry.uri === uri) }).pop()
  }

  /**
   * Check if asset exists for once off
   * @param uri
   * @returns {[]}
   */
  existsOnce (uri) {
    return this.getOnce().filter((entry) => { return (entry.uri === uri) }).pop()
  }

  nextKey (obj) {
    const keys = Object.keys(obj)
    if (keys.length > 0) return +keys.pop() + 1
    return 0
  }

  /**
   * Add Asset
   * @param {string} uri URI to access the asset
   * @param {string} mimeType Type mimeType of the asset
   * @param {boolean} defer defer loading or not js only
   * @return {string}
   */
  add (uri, mimeType, defer) {
    let options = { defer: false }
    if (defer === true) options.defer = defer
    if (typeof defer === 'object') options = defer
    if (!options) options = {}
    if (!this.exists(uri)) {
      const key = this.nextKey(this.asset)
      this.asset[key] = {
        uri: uri,
        type: mimeType || 'text/plain',
        defer: options.defer || false
      }
    }
    return uri
  }

  addCss (uri) {
    return this.add(uri, 'text/css')
  }

  addScript (uri, defer) {
    return this.add(uri, 'text/javascript', defer)
  }

  /**
   * Add Asset Once
   * @param {string} uri URI to access the asset
   * @param {string} mimeType Type mimeType of the asset
   * @param {boolean} defer defer loading or not js only
   * @return {string}
   */
  addOnce (uri, mimeType, defer) {
    let options = { defer: false }
    if (defer === true) options.defer = defer
    if (typeof defer === 'object') options = defer
    if (!options) options = {}
    if (!this.existsOnce(uri)) {
      const key = this.nextKey(this.assetOnce)
      this.assetOnce[key] = {
        uri: uri,
        type: mimeType || 'text/plain',
        defer: options.defer || false
      }
    }
    return uri
  }

  addCssOnce (uri) {
    return this.addOnce(uri, 'text/css')
  }

  addScriptOnce (uri, defer) {
    return this.addOnce(uri, 'text/javascript', defer)
  }

  /**
   * Remove Asset
   * @param {string} uri
   */
  remove (uri) {
    let lastAsset = null
    for (const key in this.asset) {
      if (!Object.prototype.hasOwnProperty.call(this.asset, key)) continue
      const asset = this.asset[key]
      if (asset.uri === uri) {
        lastAsset = asset
        delete this.asset[key]
      }
    }
    return lastAsset
  }

  /**
   * Remove Asset Once
   * @param {string} uri
   */
  removeOnce (uri) {
    let lastAsset = null
    for (const key in this.assetOnce) {
      if (!Object.prototype.hasOwnProperty.call(this.assetOnce, key)) continue
      const asset = this.assetOnce[key]
      if (asset.uri === uri) {
        lastAsset = asset
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
  all (mimeType, clearOnce) {
    const asset = []
    for (const key in this.asset) {
      if (Object.prototype.hasOwnProperty.call(this.asset, key) &&
        (!mimeType || (mimeType && this.asset[key].type === mimeType))
      ) {
        asset.push(this.asset[key])
      }
    }
    for (const key in this.assetOnce) {
      if (Object.prototype.hasOwnProperty.call(this.assetOnce, key) &&
        (!mimeType || (mimeType && this.assetOnce[key].type === mimeType))
      ) {
        asset.push(this.assetOnce[key])
        if (clearOnce !== false) delete this.assetOnce[key]
      }
    }
    return asset
  }
}
