'use strict';


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
  Object.keys(K.modules).forEach((modName) =>{
    let mod = K.modules[modName]
    if(mod.enabled){
      let modFile = mod.root + '/kado.js'
      let module = require(modFile)
      if('function' === typeof module.search){
        promises.push(
          module.search(K,app,keywords,start,limit)
            .then((result) => {
              if(result.length){
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
  return K.bluebird.all(promises)
    .then((result) => {
      let resultCount = 0
      let results = result.filter((a) => {
        if(
          a && a.moduleResults &&
          a.moduleResults.length && a.moduleResults.length > 0
        ){
          resultCount = resultCount + a.moduleResults.length
          return true
        } else {
          return false
        }
      })
      return {
        resultCount: resultCount,
        results: results
      }
    })
}
