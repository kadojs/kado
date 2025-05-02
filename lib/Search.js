/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { Assert } = require('../lib/Assert')
const Connect = require('./Connect')
const ConnectEngine = Connect.ConnectEngine
class SearchEngine extends ConnectEngine {
  search () {
    this.checkEngine()
    throw new Error('SearchEngine.search() must be extended')
  }
}
class Search extends Connect {
  static getInstance () { return new Search() }

  byPhrase (app, phrase, options) {
    Assert.isOk(Assert.getType(phrase) === 'string',
      `Search phrase must be string, got ${typeof phrase}`
    )
    if (!options) options = {}
    if (!options.start) options.start = 0
    if (!options.limit) options.limit = 5
    options.keywords = (phrase || '').split(' ')
    options.app = app
    return Connect.each(this, null, options, 'search')
      .then((result) => {
        if (!result) result = {}
        let resultCount = 0
        if (Object.keys(result).length) {
          for (const k in result) {
            if (!Object.prototype.hasOwnProperty.call(result, k)) continue
            if (!result[k]) continue
            resultCount += result[k].length
          }
        }
        return {
          resultCount: resultCount,
          results: result
        }
      })
  }
}
Search.SearchEngine = SearchEngine
module.exports = Search
