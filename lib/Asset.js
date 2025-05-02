/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = class Asset {
  static getInstance () { return new Asset() }
  constructor () {
    this.asset = {}
    this.assetOnce = {}
  }

  get (mimeType) {
    const asset = []
    for (const key in this.asset) {
      if (!Object.prototype.hasOwnProperty.call(this.asset, key)) continue
      if (mimeType && this.asset[key].type !== mimeType) continue
      asset.push(this.asset[key])
    }
    return asset
  }

  getOnce (mimeType) {
    const assetOnce = []
    for (const key in this.assetOnce) {
      if (!Object.prototype.hasOwnProperty.call(this.assetOnce, key)) continue
      if (mimeType && this.assetOnce[key].type !== mimeType) continue
      assetOnce.push(this.assetOnce[key])
    }
    return assetOnce
  }

  exists (uri) {
    return this.get().filter((entry) => { return (entry.uri === uri) }).pop()
  }

  existsOnce (uri) {
    return this.getOnce().filter((entry) => { return (entry.uri === uri) }).pop()
  }

  nextKey (obj) {
    const keys = Object.keys(obj)
    if (keys.length > 0) return +keys.pop() + 1
    return 0
  }

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
