'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
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
const K = require('./kado')


/**
 * Default code (ISO-659-2)
 * @type {string}
 */
module.exports.default = 'eng'


/**
 * Default short code (ISO-659-1)
 * @type {string}
 */
module.exports.defaultSC = 'en'


/**
 * Get supported ISO-659-1 codes
 * @returns {any[]}
 */
module.exports.getSupportedSC = () => {
  return Object.keys(this.pack)
    .filter((v)=>{return v[0] !== '_'})
    .map((v)=>{
      if(this.pack[v]._pack_sc) return this.pack[v]._pack_sc
      return v.split('').filter((x,i)=>{return i < 2}).join('')
    })
}

/**
 * Get a language pack by a loose locale name and then overlay defaults
 * this will always return a full pack, it may be default if there is no
 * requested pack
 * @param {string} locale
 * @param {object} override
 * @return {{}}
 */
module.exports.getPack = (locale,override) => {
  const that = this
  let pack = {}
  if(!override) override = {}
  //check for objects when falling through defaults
  let isObject = (val) => {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
  }
  //assign the pack based on locale
  for(let key in that.pack){
    if(that.pack.hasOwnProperty(key)){
      if(that.pack[key]._pack_sc === locale || key === locale){
        pack = that.pack[key]
      }
    }
  }
  //now open the default pack and fill any missing values
  for(let key in that.pack[that.default]){
    if(that.pack[that.default].hasOwnProperty(key)){
      let ourPack = that.pack[that.default][key]
      if(isObject(ourPack)){
        for(let key2 in ourPack){
          if(ourPack.hasOwnProperty(key2)){
            let subPack = ourPack[key2]
            if(pack[key] && !pack[key][key2]) pack[key][key2] = subPack
            //apply overrides
            if(pack[key] && override[key] && override[key][key2]){
              pack[key][key2] = override[key][key2]
            }
          }
        }
      } else if(!pack[key]){
        pack[key] = that.pack[that.default][key]
        //apply overrides
        if(override[key]) pack[key] = override[key]
      }
    }
  }
  //function to return lang pack tags dynamically
  pack._get = () => {return (text,render) => {
    return pack[render(text)] || render(text)
  }}
  return pack
}


/**
 * Return all packs
 * @returns {Array}
 */
module.exports.all = () => {
  const that = this
  let a = []
  Object.keys(that.pack).forEach((k) =>{
    if(that.pack.hasOwnProperty(k)){
      a.push(that.pack[k])
    }
  })
  return a
}


/**
 * Store language packs
 * @type {{}}
 */
module.exports.pack = {}


/**
 * Scan language packs
 * @returns {*}
 */
module.exports.scan = () => {
  const that = this
  const glob = require('glob')
  const path = require('path')
  let defaultLangGlob = process.env.KADO_LANG + '/*.js'
  let defaultModuleLangGlob = process.env.KADO_MODULES + '/**/lang/*.js'
  let localModuleLangGlob = process.env.KADO_USER_MODULES + '/**/lang/*.js'
  let localLangGlob = process.env.KADO_USER_LANG + '/*.js'
  let loadLanguage = (file) => {
    let name = path.basename(file,'.js')
    let pack = require(file)
    if(!that.pack[name]) that.pack[name] = {}
    for(let key in pack){
      if(pack.hasOwnProperty(key)){that.pack[name][key] = pack[key]}
    }
    K.log.debug(that.pack[name]._pack_name +
      ' v' + that.pack[name]._pack_version + ' language pack loaded')
  }
  let loadModuleLanguage = (file) => {
    let name = path.basename(file,'.js')
    let module = path.basename(path.dirname(path.dirname(file)))
    let pack = require(file)
    if(!that.pack[name]) that.pack[name] = {}
    if(!that.pack[name][module]) that.pack[name][module] = {}
    for(let key in pack){
      if(pack.hasOwnProperty(key)){
        if(!(that.pack[name][module] instanceof Object)){
          that.pack[name][module] = {}
        }
        that.pack[name][module][key] = pack[key]
      }
    }
  }
  let doScan = (pattern,handler) => {return glob.sync(pattern).forEach(handler)}
  //scan lang packs
  K.log.debug('Scanning language packs')
  doScan(defaultLangGlob,loadLanguage)
  doScan(defaultModuleLangGlob,loadModuleLanguage)
  doScan(localModuleLangGlob,loadModuleLanguage)
  doScan(localLangGlob,loadLanguage)
  K.log.debug('Found ' + Object.keys(that.pack).length + ' language(s)')
}
