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
const Assert = require('./Assert')
class PathExp {
  constructor (path, options) {
    Assert.isType('string', path)
    this.exp = false
    this.options = options || {}
    this.path = path
    this.build()
  }

  build () {
    // take the path and make a regular express
    // so like lets start with a regular expression and build it
    let expStr = '^'
    // now we need to just look for the start and stop of tokens because this
    // is a custom string parser, which is why i named it PathExp theoretically
    // its a type of regular expression, like typescript is a type of javascript
    const paramExp = new RegExp('(:[A-Za-z0-9_]+)', 'ig')
    const params = {}
    let param
    let i = 0
    let lastIndex = 0
    while ((param = paramExp.exec(this.path)) !== null) {
      const str = '([^/]+?)'
      params[i] = { key: i, param: param, exp: str }
      // apply any chars not used to the exp and then the new portion
      expStr += this.path.slice(lastIndex, param.index) + str
      lastIndex = param.lindex
      i++
    }
    expStr += '/?$'
    this.exp = new RegExp(expStr, 'i')
  }

  match (against) {
    Assert.isType('RegExp', this.exp)
    // test something against our expression
    return this.exp.test(against)
  }
}
module.exports = PathExp
