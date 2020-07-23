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
const ReadableStream = require('stream').Readable
const WritableStream = require('stream').Writable
const Encoding = require('./Encoding')
const StreamSlicer = require('./StreamSlicer')

const decodeText = (text, textEncoding, destEncoding) => {
  let ret
  if (text && Encoding.encodingExists(destEncoding)) {
    try {
      ret = Encoding.TextDecoder(destEncoding)
        .decode(Buffer.from(text, textEncoding))
    } catch (e) {}
  }
  return (typeof ret === 'string' ? ret : text)
}
const parseParams = str => {
  const res = []
  let state = 'key'
  let charset = ''
  let inQuote = false
  let escaping = false
  let p = 0
  let tmp = ''
  const RE_ENCODED = /%([a-fA-F0-9]{2})/g
  const encodedReplacer = (match, byte) => String.fromCharCode(parseInt(byte, 16))

  for (let i = 0, len = str.length; i < len; ++i) {
    if (str[i] === '\\' && inQuote) {
      if (escaping) { escaping = false } else {
        escaping = true
        continue
      }
    } else if (str[i] === '"') {
      if (!escaping) {
        if (inQuote) {
          inQuote = false
          state = 'key'
        } else { inQuote = true }
        continue
      } else { escaping = false }
    } else {
      if (escaping && inQuote) { tmp += '\\' }
      escaping = false
      if ((state === 'charset' || state === 'lang') && str[i] === "'") {
        if (state === 'charset') {
          state = 'lang'
          charset = tmp.substring(1)
        } else { state = 'value' }
        tmp = ''
        continue
      } else if (state === 'key' &&
        (str[i] === '*' || str[i] === '=') &&
        res.length) {
        if (str[i] === '*') { state = 'charset' } else { state = 'value' }
        res[p] = [tmp, undefined]
        tmp = ''
        continue
      } else if (!inQuote && str[i] === ';') {
        state = 'key'
        if (charset) {
          if (tmp.length) {
            tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
              'binary',
              charset)
          }
          charset = ''
        } else if (tmp.length) {
          tmp = decodeText(tmp, 'binary', 'utf8')
        }
        if (res[p] === undefined) { res[p] = tmp } else { res[p][1] = tmp }
        tmp = ''
        ++p
        continue
      } else if (!inQuote && (str[i] === ' ' || str[i] === '\t')) { continue }
    }
    tmp += str[i]
  }
  if (charset && tmp.length) {
    tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
      'binary',
      charset)
  } else if (tmp) {
    tmp = decodeText(tmp, 'binary', 'utf8')
  }

  if (res[p] === undefined) {
    if (tmp) { res[p] = tmp }
  } else { res[p][1] = tmp }

  return res
}
const basename = path => {
  if (typeof path !== 'string') { return '' }
  for (let i = path.length - 1; i >= 0; --i) {
    switch (path.charCodeAt(i)) {
      case 0x2F: // '/'
      case 0x5C: // '\'
        path = path.slice(i + 1)
        return (path === '..' || path === '.' ? '' : path)
    }
  }
  return (path === '..' || path === '.' ? '' : path)
}

class Decoder {
  constructor () {
    this.buffer = undefined
  }

  write (str) {
    const RE_PLUS = /\+/g
    str = str.replace(RE_PLUS, ' ')
    let res = ''
    let i = 0; let p = 0; const len = str.length
    const HEX = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]
    for (; i < len; ++i) {
      if (this.buffer !== undefined) {
        if (!HEX[str.charCodeAt(i)]) {
          res += '%' + this.buffer
          this.buffer = undefined
          --i
        } else {
          this.buffer += str[i]
          ++p
          if (this.buffer.length === 2) {
            res += String.fromCharCode(parseInt(this.buffer, 16))
            this.buffer = undefined
          }
        }
      } else if (str[i] === '%') {
        if (i > p) {
          res += str.substring(p, i)
          p = i
        }
        this.buffer = ''
        ++p
      }
    }
    if (p < len && this.buffer === undefined) { res += str.substring(p) }
    return res
  }

  reset () {
    this.buffer = undefined
  }
}
class ChunkStream extends ReadableStream {
  _read (n) { super._read(n) }
}

class Multipart {
  constructor (parseBus, cfg) {
    if (!(this instanceof Multipart)) { return new Multipart(parseBus, cfg) }
    this.detect = /^multipart\/form-data/i
    let i
    let len
    const self = this
    let boundary
    const limits = cfg.limits
    const parsedConType = cfg.parsedConType || []
    const defCharset = cfg.defCharset || 'utf8'
    const preservePath = cfg.preservePath
    const fileOpts = (typeof cfg.fileHwm === 'number'
      ? { highWaterMark: cfg.fileHwm }
      : {})

    const RE_BOUNDARY = /^boundary$/i
    for (i = 0, len = parsedConType.length; i < len; ++i) {
      if (Array.isArray(parsedConType[i]) &&
        RE_BOUNDARY.test(parsedConType[i][0])) {
        boundary = parsedConType[i][1]
        break
      }
    }

    const checkFinished = () => {
      if (nends === 0 && finished && !parseBus._done) {
        finished = false
        process.nextTick(function () {
          parseBus._done = true
          parseBus.emit('finish')
        })
      }
    }

    if (typeof boundary !== 'string') { throw new Error('Multipart: Boundary not found') }

    const oneMB = 1048576
    const fieldSizeLimit = (limits && typeof limits.fieldSize === 'number'
      ? limits.fieldSize
      : oneMB)
    const fileSizeLimit = (limits && typeof limits.fileSize === 'number'
      ? limits.fileSize
      : Infinity)
    const filesLimit = (limits && typeof limits.files === 'number'
      ? limits.files
      : Infinity)
    const fieldsLimit = (limits && typeof limits.fields === 'number'
      ? limits.fields
      : Infinity)
    const partsLimit = (limits && typeof limits.parts === 'number'
      ? limits.parts
      : Infinity)

    let nfiles = 0
    let nfields = 0
    let nends = 0
    let curFile
    let curField
    let finished = false

    this._needDrain = false
    this._pause = false
    this._cb = undefined
    this._nparts = 0
    this._parseBus = parseBus

    const parserCfg = {
      boundary: boundary,
      maxHeaderPairs: (limits && limits.headerPairs)
    }
    if (fileOpts.highWaterMark) { parserCfg.partHwm = fileOpts.highWaterMark }
    if (cfg.highWaterMark) { parserCfg.highWaterMark = cfg.highWaterMark }

    const skipPart = part => {
      part.resume()
    }

    this.parser = new StreamSlicer(parserCfg)
    this.parser.on('drain', function () {
      self._needDrain = false
      if (self._cb && !self._pause) {
        const cb = self._cb
        self._cb = undefined
        cb()
      }
    }).on('part', function onPart (part) {
      if (++self._nparts > partsLimit) {
        self.parser.removeListener('part', onPart)
        self.parser.on('part', skipPart)
        parseBus.hitPartsLimit = true
        parseBus.emit('partsLimit')
        return skipPart(part)
      }

      if (curField) {
        const field = curField
        field.emit('end')
        field.removeAllListeners('end')
      }

      part.on('header', function (header) {
        let conType
        let fieldname
        let parsed
        let charset
        let encoding
        let filename
        let nsize = 0

        if (header['content-type']) {
          const RE_CHARSET = /^charset$/i
          parsed = parseParams(header['content-type'][0])
          if (parsed[0]) {
            conType = parsed[0].toLowerCase()
            for (i = 0, len = parsed.length; i < len; ++i) {
              if (RE_CHARSET.test(parsed[i][0])) {
                charset = parsed[i][1].toLowerCase()
                break
              }
            }
          }
        }

        if (conType === undefined) { conType = 'text/plain' }
        if (charset === undefined) { charset = defCharset }

        if (header['content-disposition']) {
          const RE_FIELD = /^form-data$/i
          const RE_FILENAME = /^filename$/i
          const RE_NAME = /^name$/i
          parsed = parseParams(header['content-disposition'][0])
          if (!RE_FIELD.test(parsed[0])) { return skipPart(part) }
          for (i = 0, len = parsed.length; i < len; ++i) {
            if (RE_NAME.test(parsed[i][0])) {
              fieldname = parsed[i][1]
            } else if (RE_FILENAME.test(parsed[i][0])) {
              filename = parsed[i][1]
              if (!preservePath) { filename = basename(filename) }
            }
          }
        } else { return skipPart(part) }

        if (header['content-transfer-encoding']) {
          encoding = header['content-transfer-encoding'][0].toLowerCase()
        } else {
          encoding = '7bit'
        }

        let onData,
          onEnd
        if (conType === 'application/octet-stream' || filename !== undefined) {
          if (nfiles === filesLimit) {
            if (!parseBus.hitFilesLimit) {
              parseBus.hitFilesLimit = true
              parseBus.emit('filesLimit')
            }
            return skipPart(part)
          }

          ++nfiles

          if (!parseBus._events.file) {
            self.parser._ignore()
            return
          }

          ++nends
          const file = new ChunkStream(fileOpts)
          curFile = file
          file.on('end', function () {
            --nends
            self._pause = false
            checkFinished()
            if (self._cb && !self._needDrain) {
              const cb = self._cb
              self._cb = undefined
              cb()
            }
          })
          file._read = function () {
            if (!self._pause) { return }
            self._pause = false
            if (self._cb && !self._needDrain) {
              const cb = self._cb
              self._cb = undefined
              cb()
            }
          }
          parseBus.emit('file', fieldname, file, filename, encoding, conType)

          onData = function (data) {
            if ((nsize += data.length) > fileSizeLimit) {
              const extraLen = (fileSizeLimit - (nsize - data.length))
              if (extraLen > 0) { file.push(data.slice(0, extraLen)) }
              file.emit('limit')
              file.truncated = true
              part.removeAllListeners('data')
            } else if (!file.push(data)) { self._pause = true }
          }

          onEnd = function () {
            curFile = undefined
            file.push(null)
          }
        } else {
          if (nfields === fieldsLimit) {
            if (!parseBus.hitFieldsLimit) {
              parseBus.hitFieldsLimit = true
              parseBus.emit('fieldsLimit')
            }
            return skipPart(part)
          }

          ++nfields
          ++nends
          let buffer = ''
          let truncated = false
          curField = part

          onData = function (data) {
            if ((nsize += data.length) > fieldSizeLimit) {
              const extraLen = (fieldSizeLimit - (nsize - data.length))
              buffer += data.toString('binary', 0, extraLen)
              truncated = true
              part.removeAllListeners('data')
            } else { buffer += data.toString('binary') }
          }

          onEnd = function () {
            curField = undefined
            if (buffer.length) { buffer = decodeText(buffer, 'binary', charset) }
            parseBus.emit('field', fieldname, buffer, false, truncated, encoding, conType)
            --nends
            checkFinished()
          }
        }

        part._readableState.sync = false

        part.on('data', onData)
        part.on('end', onEnd)
      }).on('error', function (err) {
        if (curFile) { curFile.emit('error', err) }
      })
    }).on('error', function (err) {
      parseBus.emit('error', err)
    }).on('finish', function () {
      finished = true
      checkFinished()
    })
  }

  write (chunk, cb) {
    let r
    if ((r = this.parser.write(chunk)) && !this._pause) { cb() } else {
      this._needDrain = !r
      this._cb = cb
    }
  }

  end () {
    const self = this
    if (this._nparts === 0 && !self._parseBus._done) {
      process.nextTick(function () {
        self._parseBus._done = true
        self._parseBus.emit('finish')
      })
    } else if (this.parser.writable) { this.parser.end() }
  }
}
class UrlEncoded {
  constructor (parseBus, cfg) {
    if (!(this instanceof UrlEncoded)) { return new UrlEncoded(parseBus, cfg) }
    this.detect = /^application\/x-www-form-urlencoded/i
    const RE_CHARSET = /^charset$/i
    const limits = cfg.limits
    this.headers = cfg.headers
    const parsedConType = cfg.parsedConType
    this.parseBus = parseBus

    const oneHundred = 100
    const oneMB = 1048576
    this.fieldSizeLimit = (limits && typeof limits.fieldSize === 'number'
      ? limits.fieldSize
      : oneMB)
    this.fieldNameSizeLimit = (limits && typeof limits.fieldNameSize === 'number'
      ? limits.fieldNameSize
      : oneHundred)
    this.fieldsLimit = (limits && typeof limits.fields === 'number'
      ? limits.fields
      : Infinity)

    let charset
    for (let i = 0, len = parsedConType.length; i < len; ++i) {
      if (Array.isArray(parsedConType[i]) &&
        RE_CHARSET.test(parsedConType[i][0])) {
        charset = parsedConType[i][1].toLowerCase()
        break
      }
    }

    if (charset === undefined) { charset = cfg.defCharset || 'utf8' }

    this.decoder = new Decoder()
    this.charset = charset
    this._fields = 0
    this._state = 'key'
    this._checkingBytes = true
    this._bytesKey = 0
    this._bytesVal = 0
    this._key = ''
    this._val = ''
    this._keyTrunc = false
    this._valTrunc = false
    this._hitlimit = false
  }

  write (data, cb) {
    if (this._fields === this.fieldsLimit) {
      if (!this.parseBus.hitFieldsLimit) {
        this.parseBus.hitFieldsLimit = true
        this.parseBus.emit('fieldsLimit')
      }
      return cb()
    }

    let idxEq; let idxAmp; let i; let p = 0; const len = data.length

    while (p < len) {
      if (this._state === 'key') {
        idxEq = idxAmp = undefined
        for (i = p; i < len; ++i) {
          if (!this._checkingBytes) { ++p }
          if (data[i] === 0x3D /* = */) {
            idxEq = i
            break
          } else if (data[i] === 0x26 /* & */) {
            idxAmp = i
            break
          }
          if (this._checkingBytes && this._bytesKey === this.fieldNameSizeLimit) {
            this._hitLimit = true
            break
          } else if (this._checkingBytes) { ++this._bytesKey }
        }

        if (idxEq !== undefined) {
          if (idxEq > p) { this._key += this.decoder.write(data.toString('binary', p, idxEq)) }
          this._state = 'val'

          this._hitLimit = false
          this._checkingBytes = true
          this._val = ''
          this._bytesVal = 0
          this._valTrunc = false
          this.decoder.reset()

          p = idxEq + 1
        } else if (idxAmp !== undefined) {
          ++this._fields
          let key; const keyTrunc = this._keyTrunc
          if (idxAmp > p) { key = (this._key += this.decoder.write(data.toString('binary', p, idxAmp))) } else { key = this._key }

          this._hitLimit = false
          this._checkingBytes = true
          this._key = ''
          this._bytesKey = 0
          this._keyTrunc = false
          this.decoder.reset()

          if (key.length) {
            this.parseBus.emit('field', decodeText(key, 'binary', this.charset),
              '',
              keyTrunc,
              false)
          }

          p = idxAmp + 1
          if (this._fields === this.fieldsLimit) { return cb() }
        } else if (this._hitLimit) {
          if (i > p) { this._key += this.decoder.write(data.toString('binary', p, i)) }
          p = i
          if ((this._bytesKey = this._key.length) === this.fieldNameSizeLimit) {
            this._checkingBytes = false
            this._keyTrunc = true
          }
        } else {
          if (p < len) { this._key += this.decoder.write(data.toString('binary', p)) }
          p = len
        }
      } else {
        idxAmp = undefined
        for (i = p; i < len; ++i) {
          if (!this._checkingBytes) { ++p }
          if (data[i] === 0x26 /* & */) {
            idxAmp = i
            break
          }
          if (this._checkingBytes && this._bytesVal === this.fieldSizeLimit) {
            this._hitLimit = true
            break
          } else if (this._checkingBytes) { ++this._bytesVal }
        }

        if (idxAmp !== undefined) {
          ++this._fields
          if (idxAmp > p) { this._val += this.decoder.write(data.toString('binary', p, idxAmp)) }
          this.parseBus.emit('field', decodeText(this._key, 'binary', this.charset),
            decodeText(this._val, 'binary', this.charset),
            this._keyTrunc,
            this._valTrunc)
          this._state = 'key'

          this._hitLimit = false
          this._checkingBytes = true
          this._key = ''
          this._bytesKey = 0
          this._keyTrunc = false
          this.decoder.reset()

          p = idxAmp + 1
          if (this._fields === this.fieldsLimit) { return cb() }
        } else if (this._hitLimit) {
          if (i > p) { this._val += this.decoder.write(data.toString('binary', p, i)) }
          p = i
          if ((this._val === '' && this.fieldSizeLimit === 0) ||
            (this._bytesVal = this._val.length) === this.fieldSizeLimit) {
            this._checkingBytes = false
            this._valTrunc = true
          }
        } else {
          if (p < len) { this._val += this.decoder.write(data.toString('binary', p)) }
          p = len
        }
      }
    }
    cb()
  }

  end () {
    if (this.parseBus._done) { return }

    if (this._state === 'key' && this._key.length > 0) {
      this.parseBus.emit('field', decodeText(this._key, 'binary', this.charset),
        '',
        this._keyTrunc,
        false)
    } else if (this._state === 'val') {
      this.parseBus.emit('field', decodeText(this._key, 'binary', this.charset),
        decodeText(this._val, 'binary', this.charset),
        this._keyTrunc,
        this._valTrunc)
    }
    this.parseBus._done = true
    this.parseBus.emit('finish')
  }
}
const TYPES = [Multipart, UrlEncoded]

const Multiparse = class Multiparse extends WritableStream {
  static getInstance (opts) { return new Multiparse(opts) }
  constructor (opts) {
    if (opts.highWaterMark !== undefined) {
      super({ highWaterMark: opts.highWaterMark })
    } else {
      super()
    }
    this._done = false
    this._parser = undefined
    this._finished = false
    this.opts = opts
    if (opts.headers && typeof opts.headers['content-type'] === 'string') {
      this.parseHeaders(opts.headers)
    } else {
      throw new Error('Missing Content-Type')
    }
  }

  emit (ev) {
    if (ev === 'finish') {
      if (!this._done) {
        this._parser && this._parser.end()
        return
      } else if (this._finished) {
        return
      }
      this._finished = true
    }
    super.emit(arguments)
  }

  parseHeaders (headers) {
    this._parser = undefined
    if (headers['content-type']) {
      var parsed = parseParams(headers['content-type'])
      var matched; var type
      for (var i = 0; i < TYPES.length; ++i) {
        type = TYPES[i]
        if (typeof type.detect === 'function') {
          matched = type.detect(parsed)
        } else {
          matched = type.detect.test(parsed[0])
        }
        if (matched) {
          break
        }
      }
      if (matched) {
        var cfg = {
          limits: this.opts.limits,
          headers: headers,
          parsedConType: parsed,
          highWaterMark: undefined,
          fileHwm: undefined,
          defCharset: undefined,
          preservePath: false
        }
        if (this.opts.highWaterMark) { cfg.highWaterMark = this.opts.highWaterMark }
        if (this.opts.fileHwm) { cfg.fileHwm = this.opts.fileHwm }
        cfg.defCharset = this.opts.defCharset
        cfg.preservePath = this.opts.preservePath
        this._parser = type(this, cfg)
        return
      }
    }
    throw new Error('Unsupported content type: ' + headers['content-type'])
  }

  _write (chunk, encoding, cb) {
    if (!this._parser) { return cb(new Error('Not ready to parse. Missing Content-Type?')) }
    this._parser.write(chunk, cb)
  }
}

module.exports = Multiparse
