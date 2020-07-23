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
const EventEmitter = require('events').EventEmitter
class StreamSearch extends EventEmitter {
  constructor (needle) {
    super()

    if (typeof needle === 'string') { needle = Buffer.from(needle) }
    let i; let j; const needleLen = needle.length

    this.maxMatches = Infinity
    this.matches = 0

    this._occ = new Array(256)
    this._lookbehind_size = 0
    this._needle = needle
    this._bufpos = 0

    this._lookbehind = Buffer.alloc(needleLen)

    for (j = 0; j < 256; ++j) { this._occ[j] = needleLen }

    if (needleLen >= 1) {
      for (i = 0; i < needleLen - 1; ++i) { this._occ[needle[i]] = needleLen - 1 - i }
    }
  }

  reset () {
    this._lookbehind_size = 0
    this.matches = 0
    this._bufpos = 0
  }

  push (chunk, pos) {
    let r = 0
    if (!Buffer.isBuffer(chunk)) { chunk = Buffer.from(chunk, 'binary') }
    const chLen = chunk.length
    this._bufpos = pos || 0
    while (r !== chLen && this.matches < this.maxMatches) { r = this._feed(chunk) }
    return r
  }

  _feed (data) {
    const len = data.length; const needle = this._needle; const needleLen = needle.length

    let pos = -this._lookbehind_size
    const lastNeedleChar = needle[needleLen - 1]
    const occ = this._occ
    const lookbehind = this._lookbehind

    if (pos < 0) {
      while (pos < 0 && pos <= len - needleLen) {
        const ch = this._lookupChar(data, pos + needleLen - 1)

        if (ch === lastNeedleChar &&
          this._memCompare(data, pos, needleLen - 1)) {
          this._lookbehind_size = 0
          ++this.matches
          if (pos > -this._lookbehind_size) {
            this.emit('info', true, lookbehind, 0, this._lookbehind_size + pos)
          } else {
            this.emit('info', true)
          }

          this._bufpos = pos + needleLen
          return pos + needleLen
        } else { pos += occ[ch] }
      }

      if (pos < 0) {
        while (pos < 0 && !this._memCompare(data, pos, len - pos)) { pos++ }
      }

      if (pos >= 0) {
        this.emit('info', false, lookbehind, 0, this._lookbehind_size)
        this._lookbehind_size = 0
      } else {
        const bytesToCutOff = this._lookbehind_size + pos

        if (bytesToCutOff > 0) {
          this.emit('info', false, lookbehind, 0, bytesToCutOff)
        }

        lookbehind.copy(lookbehind, 0, bytesToCutOff,
          this._lookbehind_size - bytesToCutOff)
        this._lookbehind_size -= bytesToCutOff

        data.copy(lookbehind, this._lookbehind_size)
        this._lookbehind_size += len

        this._bufpos = len
        return len
      }
    }

    if (pos >= 0) { pos += this._bufpos }

    const jsMemCompare = (buf1, pos1, buf2, pos2, num) => {
      for (let i = 0; i < num; ++i, ++pos1, ++pos2) {
        if (buf1[pos1] !== buf2[pos2]) { return false }
      }
      return true
    }
    while (pos <= len - needleLen) {
      const ch = data[pos + needleLen - 1]

      if (ch === lastNeedleChar &&
        data[pos] === needle[0] &&
        jsMemCompare(needle, 0, data, pos, needleLen - 1)) {
        ++this.matches
        if (pos > 0) {
          this.emit('info', true, data, this._bufpos, pos)
        } else {
          this.emit('info', true)
        }

        this._bufpos = pos + needleLen
        return pos + needleLen
      } else { pos += occ[ch] }
    }

    if (pos < len) {
      while (pos < len && (data[pos] !== needle[0] ||
        !jsMemCompare(data, pos, needle, 0, len - pos))) {
        ++pos
      }
      if (pos < len) {
        data.copy(lookbehind, 0, pos, pos + (len - pos))
        this._lookbehind_size = len - pos
      }
    }

    if (pos > 0) {
      this.emit('info', false, data, this._bufpos, pos < len ? pos : len)
    }

    this._bufpos = len
    return len
  }

  _lookupChar (data, pos) {
    if (pos < 0) { return this._lookbehind[this._lookbehind_size + pos] } else { return data[pos] }
  }

  _memCompare (data, pos, len) {
    let i = 0

    while (i < len) {
      if (this._lookupChar(data, pos + i) === this._needle[i]) { ++i } else { return false }
    }
    return true
  }
}
module.exports = StreamSearch
