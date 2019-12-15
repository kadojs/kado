'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')


class Search {
  constructor(){
    this.modules = {}
  }
  allModules(){
    return this.modules
  }
  getModule(name){
    return this.modules[name]
  }
  removeModule(name){
    delete this.modules[name]
    return name
  }
  addModule(name,onSearch){
    this.modules[name] = {
      name: name,
      title: name,
      onSearch: onSearch
    }
    return this.modules[name]
  }


  /**
   * Search modules
   * @param {Kado} app
   * @param {string} phrase
   * @param {object} options
   * @return {Promise}
   */
  byPhrase(app,phrase,options){
    if(!options) options = {}
    if(!options.start) options.start = 0
    if(!options.limit) options.limit = 5
    options.keywords = (phrase || '').split(' ')
    let promises = []
    let modules = this.modules
    if('' !== options.keywords[0]){
      Object.keys(modules).map((modName) => {
        let mod = modules[modName]
        if('function' === typeof mod.onSearch){
          promises.push(
            mod.onSearch(app,options)
              .then((result) => {
                if(result && result.length){
                  return {
                    moduleName: mod.name,
                    moduleTitle: mod.title,
                    moduleResults: result
                  }
                }
              })
              .catch((err) => {
                console.warn('Search failed on module: ' +
                  mod.name + ' due to: ' + err.message)
                return {
                  moduleName: mod.name,
                  moduleTitle: mod.title,
                  moduleResults: [],
                  moduleError: 'Search failed on module "' +
                    mod.name + '" due to: <b>' + err.message + '</b>'
                }
              })
          )
        }
      })
    }
    return P.all(promises)
      .then((result) => {
        if(!result) result = []
        let resultCount = 0
        let results = []
        if(result.length){
          results = result.filter((a) => {
            if(
              a && (a.moduleError || a.moduleResults &&
              a.moduleResults.length && a.moduleResults.length > 0)
            ){
              resultCount = resultCount + a.moduleResults.length
              return true
            } else {
              return false
            }
          })
        }
        return {
          resultCount: resultCount,
          results: results
        }
      })
  }
}

module.exports = Search
