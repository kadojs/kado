'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


/**
 * Search modules
 * @param {K} K
 * @param {object} app
 * @param {string} phrase
 * @param {number} start
 * @param {limit} limit
 * @return {Promise}
 */
module.exports = (K,app,phrase,start,limit) => {
  if(!start) start = 0
  if(!limit) limit = 5
  let keywords = (phrase || '').split(' ')
  let promises = []
  if('' !== keywords[0]){
    Object.keys(K.modules).map((modName) => {
      let mod = K.modules[modName]
      if(mod.enabled){
        let modFile = mod.root + '/kado.js'
        let module = require(modFile)
        if('function' === typeof module.search){
          promises.push(
            module.search(K,app,keywords,start,limit)
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
                K.log.warn('Search failed on module: ' +
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
      }
    })
  }
  return K.bluebird.all(promises)
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
