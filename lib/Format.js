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
const Separators = class Separators {
  constructor (locale) {
    this.locale = ''
    this.sep = ','
    this.pt = '.'
    this.setLocale(locale)
  }

  setLocale (locale) {
    this.locale = locale
    ;[this.sep, this.pt] =
      require('../lib/Language').getLocaleNumberSep(this.locale)
  }

  get () {
    return [this.sep, this.pt]
  }
}
const S = new Separators()

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

  static number (n, pos, pt = false, sep = false) {
    if (pt.length > 1) {
      S.setLocale(pt)
      pt = false
    }
    pt = (pt !== false) ? pt : S.get()[1] || '.'
    sep = (sep !== false) ? sep : S.get()[0] || ','
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

  static magnitude (val, opts = { force: false, space: false, round: true, suffix: 'B' }) {
    const hOP = Object.prototype.hasOwnProperty
    if (!hOP.call(opts, 'force')) opts.force = false
    if (!hOP.call(opts, 'space')) opts.space = false
    if (!hOP.call(opts, 'round')) opts.round = true
    if (!hOP.call(opts, 'magnitudes')) opts.magnitudes = 'KMGTPEZY'
    if (!hOP.call(opts, 'suffix')) opts.suffix = 'B'
    if (!hOP.call(opts, 'locale')) opts.locale = undefined
    if (typeof opts.force === 'string') {
      opts.force = opts.force.toLowerCase()
    }
    if (!Number.isFinite(val)) {
      throw new TypeError(`Expected a finite number, got ${typeof val}: ${val}`)
    }
    val = +val // coerce input to Number always
    let fmt = ''
    const c = opts.magnitudes.length
    for (let i = c - 1; i >= 0; i--) {
      const force = opts.magnitudes[i].toLowerCase()
      const limit = Math.pow(1000, i + 1)
      if (force === opts.force || (!opts.force && val > limit)) {
        fmt = opts.magnitudes[i]
        val = (val / limit)
        break
      }
    }
    if (opts.round) val = Math.round(val)
    if (val % 1 !== 0) {
      if (Math.abs(val) < 10) {
        val = Math.round(100 * val) / 100
      } else if (Math.abs(val) < 100) {
        val = Math.round(1000 * val) / 1000
      } else {
        val = Math.round(val)
      }
    }
    S.setLocale(opts.locale)
    const [sep, pt] = S.get()
    let rv = this.number(val, 8, pt, sep)
      .replace(new RegExp('[' + pt + ']0*$'), '')
    const seps = (rv.match(new RegExp('[' + sep + ']', 'g')) || []).length
    if (rv.search(pt) !== -1) rv = rv.substr(0, 4 + seps)
    if (opts.space) fmt = ' ' + fmt
    if (opts.suffix) return rv + fmt + opts.suffix
    else return rv
  }

  static bytes (number, options) {
    const opts = { space: true, round: false, magnitudes: 'kMGTPEZY' }
    options = Object.assign({ bits: false }, options)
    if (options.bits) opts.suffix = 'bit'
    if (options.locale) opts.locale = options.locale
    const rv = this.magnitude(number, opts)
    if (options.signed && number === 0) return rv
    return (number < 0) ? '-' : (options.signed ? '+' : '') + rv
  }

  static inetPtoN (p) {
    if (typeof p !== 'string') {
      throw new TypeError(`Expected a string, got ${typeof p}: ${p}`)
    }

    const m4 = p.match(/^(?:\d{1,3}(?:\.|$)){4}/)
    const m6 = p.match(
      /^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/
    )

    if ((!m4) && (!m6)) {
      throw new TypeError(`Expected a valid IP, got: ${p}`)
    }

    let m, x, i, j
    const chr = String.fromCharCode

    // IPv4
    if (m4) {
      m = m4[0].split('.')
      m = chr(m[0]) + chr(m[1]) + chr(m[2]) + chr(m[3])
      return (m.length === 4) ? m : false
    }

    // IPv6
    if (m6) {
      for (j = 1; j < 4; j++) {
        if (j === 2 || m6[j].length === 0) continue
        m6[j] = m6[j].split(':')
        for (i = 0; i < m6[j].length; i++) {
          m6[j][i] = parseInt(m6[j][i], 16)
          if (isNaN(m6[j][i])) return false
          // jshint -W016
          m6[j][i] = chr(m6[j][i] >> 8) + chr(m6[j][i] & 0xFF)
          // jshint +W016
        }
        m6[j] = m6[j].join('')
      }
      x = m6[1].length + m6[3].length
      if (x === 16) {
        return m6[1] + m6[3]
      } else if (x < 16 && m6[2].length > 0) {
        return m6[1] + (new Array(16 - x + 1)).join('\x00') + m6[3]
      }
    }
    return false
  }

  static inetNtoP (n) {
    if (typeof n !== 'string') {
      throw new TypeError(`Expected a string, got ${typeof n}: ${n}`)
    }

    const l = n.length
    if ((l !== 4) && (l !== 16)) {
      throw new TypeError(`Expected a valid IP length (4 or 16), got: ${l}`)
    }

    let m, x, j
    const ord = c => c.charCodeAt(0)

    // IPv4
    if (l === 4) {
      m = [ord(n[0]), ord(n[1]), ord(n[2]), ord(n[3])].join('.')
      return m
    }

    // IPv6
    if (l === 16) {
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
    const l = n.length
    let rv = ''
    if (l === 4) {
      for (let c = 0; c < l; c++) {
        const octet = '' + n.charCodeAt(c)
        p.push((padding !== '') ? octet.padStart(3, padding) : octet)
      }
      rv = p.join('.')
    } else if (l === 16) {
      for (let c = 0; c < l; c += 2) {
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
