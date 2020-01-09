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

module.exports = class Search {
  static getInstance () { return new Search() }
  constructor () {
    this.modules = {}
  }

  allModules () {
    return this.modules
  }

  getModule (name) {
    return this.modules[name]
  }

  removeModule (name) {
    delete this.modules[name]
    return name
  }

  addModule (name, onSearch) {
    this.modules[name] = {
      name: name,
      title: name,
      onSearch: onSearch
    }
    return this.modules[name]
  }

  /**
   * Search modules
   * @param {object} app
   * @param {string} phrase
   * @param {object} options
   * @return {Promise}
   */
  byPhrase (app, phrase, options) {
    if (!options) options = {}
    if (!options.start) options.start = 0
    if (!options.limit) options.limit = 5
    options.keywords = (phrase || '').split(' ')
    const promises = []
    const modules = this.modules
    if (options.keywords[0] !== '') {
      Object.keys(modules).map((modName) => {
        const mod = modules[modName]
        if (typeof mod.onSearch === 'function') {
          promises.push(
            mod.onSearch(app, options)
              .then((result) => {
                if (result && result.length) {
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
    return Promise.all(promises)
      .then((result) => {
        if (!result) result = []
        let resultCount = 0
        let results = []
        if (result.length) {
          results = result.filter((a) => {
            if (
              a && (a.moduleError || (a.moduleResults &&
              a.moduleResults.length && a.moduleResults.length > 0))
            ) {
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
