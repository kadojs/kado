'use strict';
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
 * @return {{}}
 */
module.exports.getPack = (locale) => {
  const that = this
  let pack = {}
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
            if(!pack[key][key2]) pack[key][key2] = subPack
          }
        }
      } else if(!pack[key]){
        pack[key] = that.pack[that.default][key]
      }
    }
  }
  return pack
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
      if(pack.hasOwnProperty(key)){
        that.pack[name][key] = pack[key]
      }
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
    K.log.debug(pack._module_name + ' language pack loaded')
  }
  let doScan = (pattern,handler) => {
    return glob.sync(pattern)
     .forEach(handler)
  }
  //scan lang packs
  K.log.debug('Scanning language packs')
  doScan(defaultLangGlob,loadLanguage)
  doScan(defaultModuleLangGlob,loadModuleLanguage)
  doScan(localModuleLangGlob,loadModuleLanguage)
  doScan(localLangGlob,loadLanguage)
  K.log.debug('Found ' + Object.keys(that.pack).length +
    ' language(s)')
}
