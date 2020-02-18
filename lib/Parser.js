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
const qs = require('querystring')
class Parser {
  static lineToObject (input, options = {}) {
    Assert.isType('string', input)
    const delimiter = options.delimiter || ';'
    const separator = options.separator || '='
    const whitespace = options.whitespace !== undefined
      ? options.whitespace : true
    const last = { mode: null, value: null }
    const output = {}
    const ws = /\s+/
    let buffer = ''
    let mode = 'ws'
    for (let i = 0; i < input.length; i++) {
      const v = input[i]
      switch (mode) {
        case 'name':
          if (v !== separator) { buffer += v } else {
            mode = 'value'
            last.mode = 'name'
            last.value = buffer
            buffer = ''
          }
          break
        case 'value':
          if (v !== delimiter) { buffer += v } else {
            mode = 'ws'
            if (last.mode === 'name') { output[last.value] = buffer }
            last.mode = 'value'
            last.value = buffer
            buffer = ''
          }
          break
        case 'ws':
        default:
          if (ws.test(v) && whitespace === true) { buffer += v } else {
            mode = 'name'
            last.mode = 'ws'
            last.value = buffer
            buffer = v
          }
      }
    }
    if (mode === 'value' && last.mode === 'name') output[last.value] = buffer
    return output
  }

  static cookie (input) { return Parser.lineToObject(input) }

  static queryString (input, options = {}) {
    return qs.parse(input, options.sep, options.eq, options)
  }

  static replacer (map, input) {
    Assert.isType('Object', map)
    Assert.isType('string', input)
    const replacer = (match) => { return map[match] }
    const exp = '(?:' + Object.keys(map).join('|') + ')'
    const testExp = new RegExp(exp)
    const repExp = new RegExp(exp, 'g')
    return testExp.test(input) ? input.replace(repExp, replacer) : input
  }

  static htmlEscape (input) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;'
    }
    return Parser.replacer(escapeMap, input)
  }

  static htmlUnescape (input) {
    const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x60;': '`'
    }
    return Parser.replacer(unescapeMap, input)
  }
}
module.exports = Parser
