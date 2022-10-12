'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2022 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
const net = require('./Network')
const UTCRegex = /[a-z]{3}, [0-9]{1,2} [a-z]{3} [0-9]{1,5} [0-9]{2}:[0-9]{2}:[0-9]{2} [a-z]{3}/i
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
const ProgressBar = class ProgressBar {
  constructor (fmt, options) {
    this.stream = options.stream || process.stderr
    if (typeof (options) === 'number') {
      const total = options
      options = {}
      options.total = total
    } else {
      options = options || {}
      if (typeof fmt !== 'string') throw new Error('format required')
      if (typeof options.total !== 'number') throw new Error('total required')
    }
    this.fmt = fmt
    this.curr = options.curr || 0
    this.total = options.total
    this.width = options.width || this.total
    this.clear = options.clear
    this.chars = {
      complete: options.complete || '=',
      incomplete: options.incomplete || '-',
      head: options.head || (options.complete || '=')
    }
    this.renderThrottle = options.renderThrottle !== 0 ? (options.renderThrottle || 16) : 0
    this.lastRender = -Infinity
    this.callback = options.callback || function () {}
    this.tokens = {}
    this.lastDraw = ''
  }

  setTotal (total) {
    this.total = total
  }

  setFmt (fmt) {
    this.fmt = fmt
  }

  tick (len, tokens) {
    if (len !== 0) { len = len || 1 }
    // swap tokens
    if (typeof len === 'object') {
      tokens = len
      len = 1
    }
    if (tokens) this.tokens = tokens
    if (this.curr === 0) this.start = new Date()
    this.curr += len
    this.render()
    if (this.curr >= this.total) {
      this.render(undefined, true)
      this.complete = true
      this.terminate()
      this.callback(this)
    }
  }

  render (tokens, force) {
    force = force !== undefined ? force : false
    if (tokens) this.tokens = tokens
    if (!this.stream.isTTY) return
    const now = Date.now()
    const delta = now - this.lastRender
    if (!force && (delta < this.renderThrottle)) {
      return
    } else {
      this.lastRender = now
    }
    let ratio = this.curr / this.total
    ratio = Math.min(Math.max(ratio, 0), 1)
    const percent = Math.floor(ratio * 100)
    const elapsed = new Date() - this.start
    const eta = (percent === 100) ? 0 : elapsed * (this.total / this.curr - 1)
    const rate = this.curr / (elapsed / 1000)
    let str = this.fmt
      .replace(':current', this.curr)
      .replace(':total', this.total)
      .replace(':elapsed', isNaN(elapsed)
        ? '0.0'
        : (elapsed / 1000).toFixed(1)
      )
      .replace(':eta', (isNaN(eta) || !isFinite(eta))
        ? '0.0'
        : (eta / 1000).toFixed(1)
      )
      .replace(':percent', percent.toFixed(0) + '%')
      .replace(':rate', Math.round(rate))
    let availableSpace = Math.max(0,
      this.stream.columns - str.replace(':bar', '').length
    )
    if (availableSpace && process.platform === 'win32') {
      availableSpace = availableSpace - 1
    }
    const width = Math.min(this.width, availableSpace)
    /* TODO: the following assumes the user has one ':bar' token */
    const completeLength = Math.round(width * ratio)
    let complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete)
    const incomplete = Array(Math.max(0, width - completeLength + 1)).join(this.chars.incomplete)
    if (completeLength > 0) { complete = complete.slice(0, -1) + this.chars.head }
    str = str.replace(':bar', complete + incomplete)
    if (this.tokens) for (const key in this.tokens) str = str.replace(':' + key, this.tokens[key])
    if (this.lastDraw !== str) {
      this.stream.cursorTo(0)
      this.stream.write(str)
      this.stream.clearLine(1)
      this.lastDraw = str
    }
  }

  update (ratio, tokens) {
    const goal = Math.floor(ratio * this.total)
    const delta = goal - this.curr
    this.tick(delta, tokens)
  }

  interrupt (message) {
    this.stream.clearLine()
    this.stream.cursorTo(0)
    this.stream.write(message)
    this.stream.write('\n')
    this.stream.write(this.lastDraw)
  }

  terminate () {
    if (this.clear) {
      if (this.stream.clearLine) {
        this.stream.clearLine()
        this.stream.cursorTo(0)
      }
    } else {
      this.stream.write('\n')
    }
  }
}

module.exports = class Format {
  // all static no constructor needed

  static toFixedFix (n, prec = 0) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
    } else {
      const arr = ('' + n).split('e')
      return (+(Math.round(
        +arr[0] + 'e' + (+arr[1] + prec > 0)
          ? '+'
          : '' +
        (+arr[1] + prec)
      ) + 'e-' + prec
      )).toFixed(prec)
    }
  }

  static cookie (name, value = '', options = {}) {
    if (!name || !name.length) throw new Error('Name required')
    const sameSiteType = ['strict', 'lax', 'none']
    let cookie = `${name}=`
    if (typeof value === 'string') cookie += value
    else if (typeof value === 'object') cookie += JSON.stringify(value)
    if (options.domain) cookie += `; Domain=${options.domain}`
    if (options.expires) {
      Assert.isOk(
        Assert.match(UTCRegex, options.expires),
        'Invalid Expiration Date Format'
      )
      cookie += `; Expires=${options.expires}`
    }
    if (options.httpOnly) cookie += '; HttpOnly'
    if (options.maxAge) {
      if (typeof options.maxAge === 'number') {
        options.maxAge = `${options.maxAge}`
      }
      Assert.isOk(Assert.match(/\d+/, options.maxAge), 'Invalid maxAge')
      cookie += `; Max-Age=${options.maxAge}`
    }
    if (options.path) cookie += `; Path=${options.path}`
    if (options.sameSite) {
      let sameSite = options.sameSite
      sameSite = sameSite.toLowerCase()
      if (sameSiteType.indexOf(sameSite) >= 0) {
        sameSite = sameSite.charAt(0).toUpperCase() + sameSite.slice(1)
        cookie += `; SameSite=${sameSite}`
      } else {
        throw new Error('Invalid SameSite value')
      }
    }
    if (options.secure) cookie += '; Secure'
    return cookie
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
    const s = (prec
      ? this.toFixedFix(n, prec).toString()
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

  static inetPtoN (p) { return net.inetPtoN(p) }

  static inetNtoP (n) { return net.inetNtoP(n) }

  static ip (ip = '0.0.0.0', padding = '0', web = false) {
    return net.ip(ip, padding, web)
  }

  static ProgressBar (fmt, options) {
    return new ProgressBar(fmt, options)
  }
}
