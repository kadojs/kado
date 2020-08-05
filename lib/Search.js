'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
