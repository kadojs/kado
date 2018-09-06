'use strict';


/**
 * Search modules
 * @param {K} K
 * @param {string} phrase
 * @param {number} start
 * @param {limit} limit
 * @return {Promise}
 */
module.exports = (K,phrase,start,limit) => {
  if(!start) start = 0
  if(!limit) limit = 5
  let keywords = phrase.split(' ')
  let promises = []
  Object.keys(K.modules).forEach((modName) =>{
    let mod = K.modules[modName]
    if(mod.enabled){
      let modFile = mod.root + '/kado.js'
      let module = require(modFile)
      if('function' === typeof module.search){
        promises.push(
          module.search(K,keywords,start,limit)
            .then((result) => {
              if(result.length){
                return {
                  name: mod.name,
                  title: mod.title,
                  results: result
                }
              }
            })
        )
      }
    }
  })
  return K.bluebird.all(promises)
    .then((result) => {
      return result.filter((a) => {return a.length > 0})
    })
}
