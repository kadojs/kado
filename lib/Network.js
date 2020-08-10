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
const net = require('net')
const ord = c => c.charCodeAt(0)
const chr = String.fromCharCode

module.exports = class Network {
  // all static no constructor needed

  static isIPv4 (s) { return net.isIPv4(s) }

  static isIPv6 (s) { return net.isIPv6(s) }

  static isIP (s) { return net.isIP(s) }

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

    // IPv4
    if (l === 4) {
      m = [ord(n[0]), ord(n[1]), ord(n[2]), ord(n[3])].join('.')
      return m
    }

    // IPv6
    if (l === 16) {
      const hex = d => Number(d).toString(16).padStart(2, '0')
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

  static aton4 (a) {
    const c = Network.inetPtoN(a)
    return (
      ((c[0].charCodeAt(0) << 24) >>> 0) +
      ((c[1].charCodeAt(0) << 16) >>> 0) +
      ((c[2].charCodeAt(0) << 8) >>> 0) +
      (c[3].charCodeAt(0) >>> 0)
    )
  }

  static aton6 (a) {
    const c = Network.inetPtoN(a)
    const r = []
    for (let i = 0; i < c.length; i += 4) {
      r.push(
        ((c[i].charCodeAt(0) << 24) >>> 0) +
        ((c[i + 1].charCodeAt(0) << 16) >>> 0) +
        ((c[i + 2].charCodeAt(0) << 8) >>> 0) +
        (c[i + 3].charCodeAt(0) >>> 0)
      )
    }
    return r
  }

  static cmp (a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a < b ? -1 : (a > b ? 1 : 0))
    }
    if (a instanceof Array && b instanceof Array) {
      return this.cmp6(a, b)
    }
    return null
  }

  static cmp6 (a, b) {
    for (let ii = 0; ii < 2; ii++) {
      if (a[ii] < b[ii]) {
        return -1
      }
      if (a[ii] > b[ii]) {
        return 1
      }
    }
    return 0
  }

  static isPrivateIP (addr) {
    addr = addr.toString()
    return addr.match(/^10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/) != null ||
      addr.match(/^192\.168\.([0-9]{1,3})\.([0-9]{1,3})/) != null ||
      addr.match(/^172\.16\.([0-9]{1,3})\.([0-9]{1,3})/) != null ||
      addr.match(/^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/) != null ||
      addr.match(/^169\.254\.([0-9]{1,3})\.([0-9]{1,3})/) != null ||
      addr.match(/^fc00:/) != null || addr.match(/^fe80:/) != null
  }

  static ntoa4 (n) {
    return net.inetNtoP(
      String.fromCharCode(n >>> 24 & 0xff) +
      String.fromCharCode(n >>> 16 & 0xff) +
      String.fromCharCode(n >>> 8 & 0xff) +
      String.fromCharCode(n & 0xff)
    )
  }

  static ntoa6 (n) {
    let n2 = ''
    for (let i = 0; i < 4; i++) {
      n2 +=
        String.fromCharCode(n[i] >>> 24 & 0xff) +
        String.fromCharCode(n[i] >>> 16 & 0xff) +
        String.fromCharCode(n[i] >>> 8 & 0xff) +
        String.fromCharCode(n[i] & 0xff)
    }
    return '[' + net.inetNtoP(n2) + ']'
  }
}
