'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


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
   * Add a new language pack
   * @param {string} name
   * @param {object} content
   * @return {string}
   */
  addPack(name,content){
    this.pack[name] = content
    return name
  }


  /**
   * Add a module to an existing language pack
   * @param {string} pack name of the language pack
   * @param {string} module name of the module
   * @param {object} content the pack contentws
   * @returns {*}
   */
  addModule(pack,module,content){
    this.pack[pack][module] = content
    return module
  }

  removeModule(pack,module){
    delete this.pack[pack][module]
    return module
  }

  removePack(pack){
    delete this.pack[pack]
    return pack
  }


  /**
   * Return all packs
   * @returns {Array}
   */
  all(){
    return this.pack
  }
}

module.exports = Language
