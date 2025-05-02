/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = class Language {
  static hasFullIntl () {
    const rv = (() => {
      try {
        return (new Intl.DateTimeFormat('es', { month: 'long' }))
          .format(new Date(9e8)) === 'enero'
      } catch (err) { return false }
    })()
    if (!rv) {
      try {
        let icuData = require.resolve('full-icu')
        if (icuData) {
          icuData =
            icuData.replace(process.cwd(), '.').replace(/.full-icu\.js$/, '')
          if (icuData.search(' ') > -1) icuData = '"' + icuData + '"'
          console.error('*** WARNING: Missing ICU data envvar, set: ' +
            'NODE_ICU_DATA=' + icuData)
        }
      } catch (e) {
        console.error('*** WARNING: Missing ICU data, try: ' +
          'npm install full-icu --no-save')
      }
    }
    return rv
  }

  static getInstance () { return new Language() }
  constructor () {
    this.pack = {}
    this.default = 'eng'
    this.defaultSC = 'en'
  }

  static getLocaleNumberSep (locale) {
    return (() => {
      try {
        const t = (new Intl.NumberFormat(locale)).format(1024.768)
        return [t[1].replace(' ', ''), t[5].replace(' ', '')]
      } catch (err) { return false }
    })() || [',', '.']
  }

  getSupportedSC () {
    return Object.keys(this.pack)
      .filter((v) => { return v[0] !== '_' })
      .map((v) => {
        if (this.pack[v]._pack_sc) return this.pack[v]._pack_sc
        return v.split('').filter((x, i) => { return i < 2 }).join('')
      })
  }

  getPack (locale, override) {
    const that = this
    let pack = {}
    if (!override) override = {}
    // check for objects when falling through defaults
    const isObject = (val) => {
      if (val === null) { return false }
      return ((typeof val === 'function') || (typeof val === 'object'))
    }
    // assign the pack based on locale
    for (const key in that.pack) {
      if (Object.prototype.hasOwnProperty.call(that.pack, key)) {
        if (that.pack[key]._pack_sc === locale || key === locale) {
          pack = that.pack[key]
        }
      }
    }
    // now open the default pack and fill any missing values
    for (const key in that.pack[that.default]) {
      if (Object.prototype.hasOwnProperty.call(that.pack[that.default], key)) {
        const ourPack = that.pack[that.default][key]
        if (isObject(ourPack)) {
          for (const key2 in ourPack) {
            if (Object.prototype.hasOwnProperty.call(ourPack, key2)) {
              const subPack = ourPack[key2]
              if (pack[key] && !pack[key][key2]) pack[key][key2] = subPack
              // apply overrides
              if (pack[key] && override[key] && override[key][key2]) {
                pack[key][key2] = override[key][key2]
              }
            }
          }
        } else if (!pack[key]) {
          pack[key] = that.pack[that.default][key]
          // apply overrides
          if (override[key]) pack[key] = override[key]
        }
      }
    }
    // function to return lang pack tags dynamically
    pack._get = () => {
      return (text, render) => {
        return pack[render(text)] || render(text)
      }
    }
    return pack
  }

  addPack (name, content) {
    if (this.pack[name]) return this.loadPack(name, content)
    this.pack[name] = content
    return name
  }

  loadPack (name, pack) {
    if (!this.pack[name]) this.pack[name] = {}
    for (const key in pack) {
      if (
        Object.prototype.hasOwnProperty.call(pack, key) &&
        !(this.pack[name][key] instanceof Object)
      ) {
        this.pack[name][key] = pack[key]
      }
    }
    return name
  }

  addModule (name, module, content) {
    if (this.pack[name] && this.pack[name][module]) {
      return this.loadModule(name, module, content)
    }
    this.pack[name][module] = content
    return module
  }

  loadModule (name, module, pack) {
    if (!this.pack[name]) this.pack[name] = {}
    if (!this.pack[name][module]) this.pack[name][module] = {}
    for (const key in pack) {
      if (!(this.pack[name][module] instanceof Object)) {
        this.pack[name][module] = {}
      }
      if (
        Object.prototype.hasOwnProperty.call(pack, key) &&
        !(this.pack[name][module][key] instanceof Object)
      ) {
        this.pack[name][module][key] = pack[key]
      }
    }
    return module
  }

  removeModule (name, module) {
    delete this.pack[name][module]
    return module
  }

  removePack (name) {
    delete this.pack[name]
    return name
  }

  all () {
    return this.pack
  }
}
