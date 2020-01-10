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
module.exports = class Format {
  // all static no constructor needed

  static toFixedFix (n, prec = 0) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
    } else {
      const arr = ('' + n).split('e')
      return (+(Math.round(
        +arr[0] + 'e' + (+arr[1] + prec > 0) ? '+' : '' +
            (+arr[1] + prec)
      ) + 'e-' + prec
      )).toFixed(prec)
    }
  }

  static number (n, pos, pt = '.', sep = ',') {
    n = (n + '').replace(/[^0-9+\-Ee.]/g, '')
    n = !isFinite(+n) ? 0 : +n
    const prec = !isFinite(+pos) ? 0 : Math.abs(pos)
    const s = (prec ? this.toFixedFix(n, prec).toString()
      : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(pt)
  }

  static bytes (val, opts = { force: false, suffix: 'B' }) {
    if (!Object.prototype.hasOwnProperty.call(opts, 'force')) opts.force = false
    if (!Object.prototype.hasOwnProperty.call(opts, 'suffix')) opts.suffix = 'B'
    val = +val // coerce input to Number always
    let fmt = ''
    if (opts.force === 'p' || (!opts.force && val > 10000000000000000)) { // pb
      fmt = 'P'
      val = Math.round(val / 1000000000000000)
    } else if (opts.force === 't' || (!opts.force && val > 10000000000000)) { // tb
      fmt = 'T'
      val = Math.round(val / 1000000000000)
    } else if (opts.force === 'g' || (!opts.force && val > 10000000000)) { // gb
      fmt = 'G'
      val = Math.round(val / 1000000000)
    } else if (opts.force === 'm' || (!opts.force && val > 10000000)) { // mb
      fmt = 'M'
      val = Math.round(val / 1000000)
    } else if (opts.force === 'k' || (!opts.force && val > 1000)) { // kb
      fmt = 'K'
      val = Math.round(val / 1000)
    } else {
      val = Math.round(val)
    }
    if (opts.suffix) return this.number(val) + fmt + opts.suffix
    else return val + ''
  }

  static prettyBytes (number, options) {
    if (!Number.isFinite(number)) {
      throw new TypeError(
        `Expected a finite number, got ${typeof number}: ${number}`
      )
    }
    options = Object.assign({ bits: false }, options)
    const UNITS = options.bits ? [
      'b', 'kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit', 'Ebit', 'Zbit', 'Ybit'
    ] : [
      'B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'
    ]
    if (options.signed && number === 0) return ' 0 ' + UNITS[0]

    const prefix = (number < 0) ? '-' : (options.signed ? '+' : '')
    if (number < 0) number = -number

    const toLocaleString = (number, locale) => {
      let result = number
      if (typeof locale === 'string') {
        result = number.toLocaleString(locale)
      } else if (locale === true) {
        result = number.toLocaleString()
      }
      return result
    }
    if (number < 1) {
      return prefix + toLocaleString(number, options.locale) + ' ' + UNITS[0]
    }
    const exponent = Math.min(
      Math.floor(Math.log10(number) / 3), UNITS.length - 1
    )
    number = Number((number / Math.pow(1000, exponent)).toPrecision(3))
    return prefix + toLocaleString(number, options.locale) +
      ' ' + UNITS[exponent]
  }

  static inetPtoN (p) {
    let m, x, i, j
    const chr = String.fromCharCode

    // IPv4
    m = p.match(/^(?:\d{1,3}(?:\.|$)){4}/)
    if (m) {
      m = m[0].split('.')
      m = chr(m[0]) + chr(m[1]) + chr(m[2]) + chr(m[3])
      return (m.length === 4) ? m : false
    }

    // IPv6
    m = p.match(
      /^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/
    )
    if (m) {
      for (j = 1; j < 4; j++) {
        if (j === 2 || m[j].length === 0) continue
        m[j] = m[j].split(':')
        for (i = 0; i < m[j].length; i++) {
          m[j][i] = parseInt(m[j][i], 16)
          if (isNaN(m[j][i])) return false
          // jshint -W016
          m[j][i] = chr(m[j][i] >> 8) + chr(m[j][i] & 0xFF)
          // jshint +W016
        }
        m[j] = m[j].join('')
      }
      x = m[1].length + m[3].length
      if (x === 16) {
        return m[1] + m[3]
      } else if (x < 16 && m[2].length > 0) {
        return m[1] + (new Array(16 - x + 1)).join('\x00') + m[3]
      }
    }
    return false
  }

  static inetNtoP (n) {
    let m, x, j
    const ord = c => c.charCodeAt(0)

    // IPv4
    if (n.length === 4) {
      m = [ord(n[0]), ord(n[1]), ord(n[2]), ord(n[3])].join('.')
      return m
    }

    // IPv6
    if (n.length === 16) {
      const hex = d => Number(d).toString(16)
      m = ''
      for (j = 0; j < 16; j += 2) {
        m = m + hex(ord(n[j])) + hex(ord(n[j + 1])) + ':'
      }
      while (m !== (x = m.replace(/\b0+\b/g, '').replace(/::[:*]/, '::'))) m = x
      return m.replace(/\b0+/g, '').replace(/:$/, '')
    }
    return false
  }

  static ip (ip = '0.0.0.0', padding = '0', web = false) {
    const p = []
    const n = this.inetPtoN(ip)
    let rv = ''
    if (n.length === 4) {
      for (let c = 0; c < n.length; c++) {
        const octet = '' + n.charCodeAt(c)
        p.push((padding !== '') ? octet.padStart(3, padding) : octet)
      }
      rv = p.join('.')
    } else if (n.length === 16) {
      for (let c = 0; c < n.length; c += 2) {
        let hextet = (n.charCodeAt(c)).toString(16).replace(/^0/g, '') +
          (n.charCodeAt(c + 1)).toString(16).replace(/^0/g, '')
        if (hextet.length === 0) hextet = '0'
        p.push((padding !== '') ? hextet.padStart(4, padding) : hextet)
      }
      rv = p.join(':')
    }
    if (web) rv = rv.replace(/ /g, '&nbsp;')
    return rv
  }

  static color (message, fgc, bgc, set, rst) {
    const cFG = {
      Default: 39,
      Black: 30,
      Red: 31,
      Green: 32,
      Yellow: 33,
      Blue: 34,
      Magenta: 35,
      Cyan: 36,
      'Light Gray': 37,
      'Dark Gray': 90,
      'Light Red': 91,
      'Light Green': 92,
      'Light Yellow': 93,
      'Light Blue': 94,
      'Light Magenta': 95,
      'Light Cyan': 96,
      White: 97
    }
    const cSET = {
      Default: 0,
      Bold: 1,
      Dim: 2,
      Underlined: 4,
      Blink: 5,
      Reverse: 7,
      Hidden: 8
    }
    const cBG = {}
    for (const k of Object.keys(cFG)) cBG[k] = cFG[k] + 10
    const cRST = {}
    for (const k of Object.keys(cSET)) {
      cRST[(k === 'Default') ? 'All' : k] = (cSET[k] === 0) ? 0 : cSET[k] + 20
    }
    if (Object.keys(cFG).indexOf(fgc) === -1) { fgc = 'Default' }
    if (Object.keys(cBG).indexOf(bgc) === -1) { bgc = 'Default' }
    if (Object.keys(cSET).indexOf(set) === -1) { set = 'Default' }
    if (Object.keys(cRST).indexOf(rst) === -1) { rst = 'All' }

    return '\u001b[' + cSET[set] + ';' + cBG[bgc] + ';' + cFG[fgc] + 'm' +
      message +
      '\u001b[' + cRST[rst] + 'm'
  }
}
