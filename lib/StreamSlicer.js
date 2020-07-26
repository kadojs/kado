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
const ReadableStream = require('stream').Readable
const WritableStream = require('stream').Writable
const StreamSearch = require('./StreamSearch')

class ChunkStream extends ReadableStream {
  _read (n) { super._read(n) }
}
class HeaderParser extends EventEmitter {
  constructor (cfg) {
    super()
    const self = this

    const B_DOUBLE_CRLF = Buffer.from('\r\n\r\n')
    const MAX_HEADER_SIZE = 80 * 1024 // from node's http_parser

    this.nread = 0
    this.maxed = false
    this.npairs = 0
    this.maxHeaderPairs = (cfg && typeof cfg.maxHeaderPairs === 'number'
      ? cfg.maxHeaderPairs
      : 2000) // from node's http.js
    this.buffer = ''
    this.header = {}
    this.finished = false
    this.ss = new StreamSearch(B_DOUBLE_CRLF)
    this.ss.on('info', function (isMatch, data, start, end) {
      if (data && !self.maxed) {
        if (self.nread + (end - start) > MAX_HEADER_SIZE) {
          end = (MAX_HEADER_SIZE - self.nread)
          self.nread = MAX_HEADER_SIZE
        } else { self.nread += (end - start) }

        if (self.nread === MAX_HEADER_SIZE) { self.maxed = true }

        self.buffer += data.toString('binary', start, end)
      }
      if (isMatch) { self._finish() }
    })
  }

  push (data) {
    const r = this.ss.push(data)
    if (this.finished) { return r }
  }

  reset () {
    this.finished = false
    this.buffer = ''
    this.header = {}
    this.ss.reset()
  }

  _finish () {
    if (this.buffer) { this._parseHeader() }
    this.ss.matches = this.ss.maxMatches
    const header = this.header
    this.header = {}
    this.buffer = ''
    this.finished = true
    this.nread = this.npairs = 0
    this.maxed = false
    this.emit('header', header)
  }

  _parseHeader () {
    if (this.npairs === this.maxHeaderPairs) { return }
    // eslint-disable-next-line no-control-regex
    const RE_HDR = /^([^:]+):[ \t]?([\x00-\xFF]+)?$/
    const RE_CRLF = /\r\n/g

    const lines = this.buffer.split(RE_CRLF)
    const len = lines.length
    let m; let h
    let modded = false

    for (let i = 0; i < len; ++i) {
      if (lines[i].length === 0) { continue }
      if (lines[i][0] === '\t' || lines[i][0] === ' ') {
        this.header[h][this.header[h].length - 1] += lines[i]
      } else {
        m = RE_HDR.exec(lines[i])
        if (m) {
          h = m[1].toLowerCase()
          if (m[2]) {
            if (this.header[h] === undefined) {
              this.header[h] = [m[2]]
            } else {
              this.header[h].push(m[2])
            }
          } else { this.header[h] = [''] }
          if (++this.npairs === this.maxHeaderPairs) { break }
        } else {
          this.buffer = lines[i]
          modded = true
          break
        }
      }
    }
    if (!modded) { this.buffer = '' }
  }
}
class StreamSlicer extends WritableStream {
  constructor (cfg) {
    super(cfg)
    if (!(this instanceof StreamSlicer)) { return new StreamSlicer(cfg) }

    if (!cfg || (!cfg.headerFirst && typeof cfg.boundary !== 'string')) {
      throw new TypeError('Boundary required')
    }

    if (typeof cfg.boundary === 'string') {
      this.setBoundary(cfg.boundary)
    } else {
      this._bparser = undefined
    }

    this._headerFirst = cfg.headerFirst

    const self = this

    this._dashes = 0
    this._parts = 0
    this._finished = false
    this._realFinish = false
    this._isPreamble = true
    this._justMatched = false
    this._firstWrite = true
    this._inHeader = true
    this._part = undefined
    this._cb = undefined
    this._ignoreData = false
    this._partOpts = (typeof cfg.partHwm === 'number'
      ? { highWaterMark: cfg.partHwm }
      : {})
    this._pause = false

    this._hparser = new HeaderParser(cfg)
    this._hparser.on('header', function (header) {
      self._inHeader = false
      self._part.emit('header', header)
    })
  }

  emit (ev) {
    if (ev === 'finish' && !this._realFinish) {
      if (!this._finished) {
        const self = this
        process.nextTick(function () {
          self.emit('error', new Error('Unexpected end of multipart data'))
          if (self._part && !self._ignoreData) {
            const type = (self._isPreamble ? 'Preamble' : 'Part')
            self._part.emit('error', new Error(
              `${type} terminated early due to unexpected end of multipart data`
            ))
            self._part.push(null)
            process.nextTick(function () {
              self._realFinish = true
              self.emit('finish')
              self._realFinish = false
            })
            return
          }
          self._realFinish = true
          self.emit('finish')
          self._realFinish = false
        })
      }
    } else { WritableStream.prototype.emit.apply(this, arguments) }
  }

  _write (data, encoding, cb) {
    if (!this._hparser && !this._bparser) { return cb() }

    if (this._headerFirst && this._isPreamble) {
      if (!this._part) {
        this._part = new ChunkStream(this._partOpts)
        if (this._events.preamble) {
          this.emit('preamble', this._part)
        } else {
          this._ignore()
        }
      }
      const r = this._hparser.push(data)
      if (!this._inHeader && r !== undefined && r < data.length) {
        data = data.slice(r)
      } else {
        return cb()
      }
    }

    if (this._firstWrite) {
      const B_CRLF = Buffer.from('\r\n')
      this._bparser.push(B_CRLF)
      this._firstWrite = false
    }

    this._bparser.push(data)

    if (this._pause) { this._cb = cb } else { cb() }
  }

  reset () {
    this._part = undefined
    this._bparser = undefined
    this._hparser = undefined
  }

  setBoundary (boundary) {
    const self = this
    this._bparser = new StreamSearch('\r\n--' + boundary)
    this._bparser.on('info', function (isMatch, data, start, end) {
      self._onInfo(isMatch, data, start, end)
    })
  }

  _ignore () {
    if (this._part && !this._ignoreData) {
      const EMPTY_FN = function () {}
      this._ignoreData = true
      this._part.on('error', EMPTY_FN)
      this._part.resume()
    }
  }

  _onInfo (isMatch, data, start, end) {
    const self = this
    let buf; let r; let ev; let i = 0
    let shouldWriteMore = true

    if (!this._part && this._justMatched && data) {
      const DASH = 45
      const B_ONE_DASH = Buffer.from('-')
      while (this._dashes < 2 && (start + i) < end) {
        if (data[start + i] === DASH) {
          ++i
          ++this._dashes
        } else {
          if (this._dashes) { buf = B_ONE_DASH }
          this._dashes = 0
          break
        }
      }
      if (this._dashes === 2) {
        if ((start + i) < end && this._events.trailer) {
          this.emit('trailer', data.slice(start + i, end))
        }
        this.reset()
        this._finished = true
        if (self._parts === 0) {
          self._realFinish = true
          self.emit('finish')
          self._realFinish = false
        }
      }
      if (this._dashes) { return }
    }
    if (this._justMatched) { this._justMatched = false }
    if (!this._part) {
      this._part = new ChunkStream(this._partOpts)
      this._part._read = function () {
        self._unpause()
      }
      ev = this._isPreamble ? 'preamble' : 'part'
      if (this._events[ev]) {
        this.emit(ev, this._part)
      } else {
        this._ignore()
      }
      if (!this._isPreamble) { this._inHeader = true }
    }
    if (data && start < end && !this._ignoreData) {
      if (this._isPreamble || !this._inHeader) {
        if (buf) { shouldWriteMore = this._part.push(buf) }
        shouldWriteMore = this._part.push(data.slice(start, end))
        if (!shouldWriteMore) { this._pause = true }
      } else if (!this._isPreamble && this._inHeader) {
        if (buf) { this._hparser.push(buf) }
        r = this._hparser.push(data.slice(start, end))
        if (!this._inHeader && r !== undefined && r < end) {
          this._onInfo(false, data, start + r, end)
        }
      }
    }
    if (isMatch) {
      this._hparser.reset()
      if (this._isPreamble) { this._isPreamble = false } else {
        ++this._parts
        this._part.on('end', function () {
          if (--self._parts === 0) {
            if (self._finished) {
              self._realFinish = true
              self.emit('finish')
              self._realFinish = false
            } else {
              self._unpause()
            }
          }
        })
      }
      this._part.push(null)
      this._part = undefined
      this._ignoreData = false
      this._justMatched = true
      this._dashes = 0
    }
  }

  _unpause () {
    if (!this._pause) { return }

    this._pause = false
    if (this._cb) {
      const cb = this._cb
      this._cb = undefined
      cb()
    }
  }
}
module.exports = StreamSlicer
module.exports.HeaderParser = HeaderParser
