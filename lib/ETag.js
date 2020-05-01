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
const fs = require('./FileSystem')
const crypto = require('crypto')
class ETag {
  static getTag (input, options = {}) {
    Assert.isType('Object', options)
    if (input instanceof fs.Stats) {
      return `W/"${input.size}-${input.mtime.getTime()}"`
    }
    Assert.isType('string', input)
    if (input.length === 0) return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
    const hash = crypto.createHash('sha1')
    hash.update(input, 'utf8')
    const tag = hash.digest('base64').substring(0, 27)
    const length = input.length
    const prefix = options.weak ? 'W/' : ''
    return `${prefix}"${length}-${tag}"`
  }
}

module.exports = ETag
