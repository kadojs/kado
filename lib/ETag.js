/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
    const encoding = options.encoding || 'utf8'
    const hash = crypto.createHash('sha1')
    hash.update(input, encoding)
    const tag = hash.digest('base64').substring(0, 27)
    const length = Buffer.byteLength(input, encoding)
    const prefix = options.weak ? 'W/' : ''
    return `${prefix}"${length}-${tag}"`
  }
}

module.exports = ETag
