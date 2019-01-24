'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
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
    Object.keys(K.modules).forEach((modName) => {
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
            a && a.moduleResults &&
            a.moduleResults.length && a.moduleResults.length > 0
          )
          {
            resultCount = resultCount + a.moduleResults.length
            return true
          }
          else{
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
