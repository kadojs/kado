'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const debug = require('debug')('kado:lang')

class Language {
  constructor(){
    this.pack = {}
    this.default = 'eng'
    this.defaultSC = 'en'
  }

  /**
   * Get supported ISO-659-1 codes
   * @returns {any[]}
   */
  getSupportedSC(){
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
  getPack(locale,override){
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
   * Scan language packs
   * @returns {*}
   */
  scan(){
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
      debug(that.pack[name]._pack_name +
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
    let doScan = (pattern,handler) => {return glob.sync(pattern).map(handler)}
    //scan lang packs
    debug('Scanning language packs')
    doScan(defaultLangGlob,loadLanguage)
    doScan(defaultModuleLangGlob,loadModuleLanguage)
    doScan(localModuleLangGlob,loadModuleLanguage)
    doScan(localLangGlob,loadLanguage)
    debug('Found ' + Object.keys(that.pack).length + ' language(s)')
  }


  /**
   * Return all packs
   * @returns {Array}
   */
  all(){
    const that = this
    let a = []
    Object.keys(that.pack).map((k) =>{
      if(that.pack.hasOwnProperty(k)){
        a.push(that.pack[k])
      }
    })
    return a
  }
}

module.exports = Language
