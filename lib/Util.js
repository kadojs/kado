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

module.exports = class Util {
  // all static no constructor needed

  static capitalize (string) {
    return string.replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Print date with a nice format
   * @param {Date} d
   * @param {string} emptyString
   * @return {string}
   */
  static printDate (d, emptyString = 'Never') {
    if (d === undefined || d === null) d = new Date()
    if (!(d instanceof Date)) d = new Date(d)
    return d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ` +
      `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}` : emptyString
  }

  static escapeAndTruncate () {
    return (text, render) => {
      const parts = text.split(',')
      if (!parts || parts.length !== 2) {
        throw new Error('Cannot parse escapeAndTruncate')
      }
      const len = +parts[0]
      let tpl = render(parts[1])
      tpl = tpl.replace(/<(?:.|\n)*?>/gm, '') // remove html
      return tpl.substring(0, len) // shorten
    }
  }

  static is () {
    return (text, render) => {
      const parts = render(text).split(',')
      if (parts.length !== 3) throw new Error('Failed parsing _is')
      let cond = true
      if (parts[0] === '' || parts[0] === 'false' || parts[0] === false) {
        cond = false
      }
      return cond ? parts[1] : parts[2]
    }
  }

  static compare () {
    return (text, render) => {
      const parts = render(text).split(',')
      if (parts.length !== 4) throw new Error('Failed parsing _compare')
      let cond = true
      if (parts[0] !== parts[1]) {
        cond = false
      }
      return cond ? parts[2] : parts[3]
    }
  }
}
