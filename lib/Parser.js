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
      ? options.whitespace
      : true
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
    if (Assert.getType(input) === 'number') input = '' + input
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

  static capitalize (string) {
    return string.replace(/\b\w/g, l => l.toUpperCase())
  }

  static escapeAndTruncate () {
    return (text, render) => {
      const parts = text.split(',')
      Assert.isOk(parts && parts.length === 2, 'Cannot parse escapeAndTruncate')
      const len = +parts[0]
      let tpl = render(parts[1])
      tpl = tpl.replace(/<(?:.|\n)*?>/gm, '') // remove html
      return tpl.substring(0, len) // shorten
    }
  }

  static printDate (d, emptyString = 'Never') {
    if (d === undefined || d === null) d = new Date()
    if (!(d instanceof Date)) d = new Date(d)
    const yyyy = d.getFullYear()
    const mm = `0${d.getMonth() + 1}`.slice(-2)
    const dd = `0${d.getDate()}`.slice(-2)
    const hr = `0${d.getHours()}`.slice(-2)
    const mn = `0${d.getMinutes()}`.slice(-2)
    const sc = `0${d.getSeconds()}`.slice(-2)
    return d ? `${yyyy}-${mm}-${dd} ${hr}:${mn}:${sc}` : emptyString
  }

  static stringCaseSeparate (input, separator = ' ') {
    let rv = ''
    for (let i = 0; i < input.length; i++) {
      if (input[i] === input[i].toUpperCase() || input[i].match(/\d+/)) {
        if (rv !== '' && rv !== separator) rv += separator
        rv += input[i]
      } else { rv += input[i] }
    }
    return rv
  }

  static stringToPath (input, separator = '/') {
    let rv = input
    rv = rv.replace(/([a-z0-9]+)[^a-z0-9\s]+([a-z0-9]+)/ig, '$1$2')
    rv = rv.replace(/[^a-z0-9\-,.]+/ig, ' ')
    rv = rv.trim()
    rv = rv.replace(/\s+/ig, separator)
    rv = rv.toLowerCase()
    return rv
  }

  static stringToTitle (name, separator = ' ', joiner = ' ') {
    const article = ['a', 'an', 'the']
    const conjunction = ['and', 'but', 'for', 'or', 'so', 'yet']
    const preposition = [
      'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid',
      'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below',
      'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by',
      'concerning', 'considering', 'despite', 'down', 'during', 'except',
      'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside',
      'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite',
      'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save',
      'since', 'than', 'through', 'to', 'toward', 'towards', 'under',
      'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with',
      'within', 'without'
    ]
    let sepExp = /\s/g
    if (separator && separator !== ' ') sepExp = new RegExp(separator, 'ig')
    const parts = name.replace(sepExp, ' ').split(' ')
    let index = 0
    const title = parts.map((v) => {
      const i = index
      index += v.length + separator.length
      if (
        (
          article.indexOf(v) >= 0 ||
          conjunction.indexOf(v) >= 0 ||
          preposition.indexOf(v) >= 0
        ) && i !== 0 && (i + v.length) !== name.length
      ) { return v }
      return Parser.capitalize(v)
    })
    return title.join(joiner)
  }

  static requestBody (req) {
    return new Promise((resolve, reject) => {
      req.body = {} // initialize body to ensure its available empty
      const supportedTypes = [
        'application/x-www-form-urlencoded',
        'application/x-www-form-urlencoded; charset=UTF-8',
        'application/json',
        'text/plain'
      ]
      if (supportedTypes.indexOf(req.headers['content-type']) === -1) {
        resolve()
      } else {
        let buffer = Buffer.alloc(0)
        req.on('data', (chunk) => { buffer = Buffer.concat([buffer, chunk]) })
        req.on('end', () => {
          try {
            switch (req.headers['content-type']) {
              case 'application/x-www-form-urlencoded':
              case 'application/x-www-form-urlencoded; charset=UTF-8':
                req.body = Parser.queryString(buffer.toString('utf8'))
                break
              case 'application/json':
                req.body = JSON.parse(buffer.toString('utf8'))
                break
              case 'text/plain':
                req.body = buffer.toString('utf8')
                break
              default:
                req.body = buffer
                break
            }
            resolve()
          } catch (e) { reject(e) }
        })
        req.on('error', (e) => { reject(e) })
      }
    })
  }
}
module.exports = Parser
