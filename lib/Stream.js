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
const EventEmitter = require('events').EventEmitter
const Stream = require('stream')
class StreamChunk extends Stream.Readable { _read (n) { super._read(n) } }
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
class StreamChain extends Stream.Readable {
  constructor (options = {}) {
    super({ highWaterMark: options.highWaterMark })
    this.currentStream = null
    this.busy = false
    this.paused = true
    this.pending = false
    this.released = false
    this.streams = []
    this.writable = false
  }

  addStream (stream) {
    const isStream = this.isLikeStream(stream)
    if (isStream) {
      this.handleErrors(stream)
      if (this.paused) stream.pause()
    }
    this.streams.push(stream)
    return this
  }

  destroy () {
    this.reset()
    this.emit('close')
  }

  emitError (err) {
    this.reset()
    this.emit('error', err)
  }

  end () {
    this.reset()
    this.emit('end')
  }

  findStream () {
    const stream = this.streams.shift()
    if (stream === undefined) {
      return this.end()
    }
    if (typeof stream === 'function') {
      stream(function (stream) {
        const isStream = this.isLikeStream(stream)
        if (isStream) { this.handleErrors(stream) }
        this.pipeStream(stream)
      }.bind(this))
    } else {
      this.pipeStream(stream)
    }
  }

  handleErrors (stream) {
    if (this.isLikeStream(stream)) {
      stream.on('error', (err) => { this.emitError(err) })
    }
  }

  isLikeStream (stream) {
    return (typeof stream !== 'function') &&
      (typeof stream !== 'string') &&
      (typeof stream !== 'boolean') &&
      (typeof stream !== 'number') &&
      (!Buffer.isBuffer(stream))
  }

  nextStream () {
    this.currentStream = null
    if (this.busy) {
      this.pending = true
      return
    }
    this.busy = true
    try {
      do {
        this.pending = false
        this.findStream()
      } while (this.pending)
    } finally {
      this.busy = false
    }
  }

  pipe (dest, options = {}) {
    const str = Stream.prototype.pipe.call(this, dest, options)
    this.resume()
    return str
  }

  pipeStream (stream) {
    this.currentStream = stream
    const isStream = this.isLikeStream(stream)
    if (isStream) {
      stream.on('end', this.nextStream.bind(this))
      stream.pipe(this, { end: false })
      return
    }
    this.write(stream)
    this.nextStream()
  }

  pause () {
    if (!this.paused) return
    if (this.currentStream && typeof this.currentStream.pause === 'function') {
      this.currentStream.pause()
    }
    this.emit('pause')
  }

  reset () {
    this.writable = false
    this.streams = []
    this.currentStream = null
  }

  resume () {
    if (!this.released) {
      this.released = true
      this.writable = true
      this.nextStream()
    }
    if (this.paused && this.currentStream.resume) {
      this.currentStream.resume()
    }
    this.emit('resume')
  }

  write (data) { this.emit('data', data) }
}
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
      for (i = 0; i < needleLen - 1; ++i) {
        this._occ[needle[i]] = needleLen - 1 - i
      }
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
    while (r !== chLen && this.matches < this.maxMatches) {
      r = this._feed(chunk)
    }
    return r
  }

  _feed (data) {
    const len = data.length
    const needle = this._needle
    const needleLen = needle.length

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
    if (pos < 0) {
      return this._lookbehind[this._lookbehind_size + pos]
    } else {
      return data[pos]
    }
  }

  _memCompare (data, pos, len) {
    let i = 0

    while (i < len) {
      if (this._lookupChar(data, pos + i) === this._needle[i]) {
        ++i
      } else {
        return false
      }
    }
    return true
  }
}
class StreamSlicer extends Stream.Writable {
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
    } else { Stream.Writable.prototype.emit.apply(this, arguments) }
  }

  _write (data, encoding, cb) {
    if (!this._hparser && !this._bparser) { return cb() }

    if (this._headerFirst && this._isPreamble) {
      if (!this._part) {
        this._part = new StreamChunk(this._partOpts)
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
      this._part = new StreamChunk(this._partOpts)
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
Stream.HeaderParser = HeaderParser
Stream.StreamChain = StreamChain
Stream.StreamChunk = StreamChunk
Stream.StreamSearch = StreamSearch
Stream.StreamSlicer = StreamSlicer
module.exports = Stream
