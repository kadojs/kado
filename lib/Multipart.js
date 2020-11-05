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
const fs = require('./FileSystem')
const Mime = require('./Mime')
const Stream = require('./Stream')
const StreamChunk = Stream.StreamChunk
const StreamChain = Stream.StreamChain
const StreamSlicer = Stream.StreamSlicer
const Validate = require('./Validate')
const regex = {
  boundarySelect: /; boundary=(.+)$/,
  charset: /^charset$/i,
  contentType: /^multipart\/form-data; boundary=/i,
  encoded: /%([a-fA-F0-9]{2})/g,
  field: /^form-data$/i,
  filename: /^filename$/i,
  name: /^name$/i
}
class Multipart {}
class FormBuild extends StreamChain {
  constructor (opts = {}) {
    super({ highWaterMark: opts.highWaterMark })
    this.boundary = this.generateBoundary()
    this.B_BOUNDARY = Buffer.from(this.boundary)
    this.headers = opts.headers || {}
    this.length = {
      total: 0,
      file: 0,
      value: 0
    }
    this.parts = []
  }

  add (name, value, options = {}) {
    Assert.isOk(!Validate.isType('array', value), 'Arrays not supported')
    if (Validate.isType('number', value)) value = `${value}`
    const part = {
      filename: options.filename,
      headers: [],
      name: name,
      options: options,
      value: value
    }
    if (value instanceof Stream) {
      part.filename = options.filename || fs.path.basename(value.path)
      part.type = Mime.getType(part.filename)
      part.headers.push('Content-Disposition: form-data;' +
        ' name="' + name + '"; filename="' + part.filename + '"')
      part.headers.push('Content-Type: ' + part.type.type)
    } else {
      part.headers.push('Content-Disposition: form-data; name="' + name + '"')
    }
    part.header = this.buildHeader(part.headers)
    part.footer = this.buildFooter()
    this.addStream(part.header)
    this.addStream(part.value)
    this.addStream(part.footer)
    this.parts.push(part)
  }

  buildFinalBoundary () {
    return Buffer.concat([
      FormBuild.B_DD, this.B_BOUNDARY, FormBuild.B_DD, FormBuild.B_CRLF
    ])
  }

  buildFooter () {
    return function (next) {
      let footer = FormBuild.B_CRLF
      if (!this.streams.length) {
        footer += this.buildFinalBoundary()
      }
      next(footer)
    }.bind(this)
  }

  buildHeader (headers) {
    return Buffer.concat([
      FormBuild.B_DD, this.B_BOUNDARY, FormBuild.B_CRLF,
      Buffer.from(headers.join(FormBuild.B_CRLF)), FormBuild.B_DCRLF
    ])
  }

  generateBoundary () {
    let boundary = '--------------------------'
    for (let i = 0; i < 24; i++) {
      boundary += Math.floor(Math.random() * 10).toString(16)
    }
    return boundary
  }

  getHeaders () {
    const headers = this.headers || {}
    headers['content-type'] = 'multipart/form-data; boundary=' + this.boundary
    if (!headers['transfer-encoding']) headers['transfer-encoding'] = 'chunked'
    return headers
  }
}
FormBuild.B_CRLF = Buffer.from('\r\n')
FormBuild.B_DCRLF = Buffer.from('\r\n\r\n')
FormBuild.B_DD = Buffer.from('--')
class FormData extends Stream.Writable {
  static getInstance (opts) { return new FormData(opts) }

  static getBoundary (contentType) {
    Assert.isType('string', contentType)
    const match = contentType.match(regex.boundarySelect)
    Assert.isOk(match && match.length, 'Failed to find boundary')
    return match[1]
  }

  constructor (opts) {
    Assert.isOk(opts && opts.headers, 'Missing headers or options')
    super({ highWaterMark: opts.highWaterMark })
    Assert.isOk(opts.headers['content-type'], 'Missing content type')
    Assert.isOk(
      Validate.match(
        regex.contentType,
        opts.headers['content-type']
      ),
      'Invalid content type'
    )
    this._cb = undefined
    this._done = false
    this._needDrain = false
    this._nparts = 0
    this._pause = false
    this.boundary = FormData.getBoundary(opts.headers['content-type'])
    this.charset = opts.charset || 'utf8'
    this.curFile = null
    this.curField = null
    this.fieldSizeLimit = opts.fieldSizeLimit || Infinity
    this.filesLimit = opts.filesLimit || Infinity
    this.fileOpts = (typeof opts.fileHwm === 'number'
      ? { highWaterMark: opts.fileHwm }
      : {})
    this.fileSizeLimit = opts.fileSizeLimit || Infinity
    this.finished = false
    this.hitFilesLimit = false
    this.hitPartsLimit = false
    this.nends = 0
    this.nfields = 0
    this.nfiles = 0
    this.parser = new StreamSlicer({ boundary: this.boundary })
    this.partsLimit = opts.partsLimit || Infinity
    this.preservePath = opts.preservePath
    this.setupParser()
  }

  checkFinished () {
    if (this.nends === 0 && this.finished && !this._done) {
      this.finished = false
      process.nextTick(() => {
        this._done = true
        this.emit('finish')
      })
    }
  }

  decodeText (text, textEncoding, destEncoding) {
    let ret
    if (text) {
      try {
        ret = TextDecoder(destEncoding)
          .decode(Buffer.from(text, textEncoding))
      } catch (e) {}
    }
    return (typeof ret === 'string' ? ret : text)
  }

  end () {
    if (this._nparts === 0 && !this._done) {
      process.nextTick(() => {
        this._done = true
        this.emit('finish')
      })
    } else if (this.parser.writable) {
      this.parser.end()
    }
  }

  parserDrain () {
    this._needDrain = false
    if (this._cb && !this._pause) {
      const cb = this._cb
      delete this._cb
      cb()
    }
  }

  parserError (err) { this.emit('error', err) }

  parserFinish () {
    this.finished = true
    this.checkFinished()
  }

  parseHeader (str) {
    const res = []
    let state = 'key'
    let charset = ''
    let inQuote = false
    let escaping = false
    let p = 0
    let tmp = ''
    const encodedReplacer = (match, byte) => {
      return String.fromCharCode(parseInt(byte, 16))
    }
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
              tmp = this.decodeText(
                tmp.replace(regex.encoded, encodedReplacer),
                'binary',
                charset
              )
            }
            charset = ''
          } else if (tmp.length) {
            tmp = this.decodeText(tmp, 'binary', 'utf8')
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
      tmp = this.decodeText(
        tmp.replace(regex.encoded, encodedReplacer),
        'binary',
        charset
      )
    } else if (tmp) {
      tmp = this.decodeText(tmp, 'binary', 'utf8')
    }
    if (res[p] === undefined) {
      if (tmp) { res[p] = tmp }
    } else { res[p][1] = tmp }
    return res
  }

  parserPartError (e) { if (this.curFile) { this.curFile.emit('error', e) } }

  parserPartHeader (header) {
    let charset = this.charset
    let conType
    let encoding
    let fieldname
    let filename
    let i = 0
    let len = 0
    let nsize = 0
    let onData
    let onEnd
    let parsed
    if (header['content-type']) {
      parsed = this.parseHeader(header['content-type'][0])
      if (parsed[0]) {
        conType = parsed[0].toLowerCase()
        for (i = 0, len = parsed.length; i < len; ++i) {
          if (regex.charset.test(parsed[i][0])) {
            charset = parsed[i][1].toLowerCase()
            break
          }
        }
      }
    }
    if (conType === undefined) { conType = 'text/plain' }
    if (charset === undefined) { charset = this.charset }
    if (header['content-disposition']) {
      parsed = this.parseHeader(header['content-disposition'][0])
      if (!regex.field.test(parsed[0])) {
        return this.parserPartSkip(this.part)
      }
      for (i = 0, len = parsed.length; i < len; ++i) {
        if (regex.name.test(parsed[i][0])) {
          fieldname = parsed[i][1]
        } else if (regex.filename.test(parsed[i][0])) {
          filename = parsed[i][1]
          if (!this.preservePath) { filename = fs.path.basename(filename) }
        }
      }
    } else { return this.parserPartSkip(this.part) }
    if (header['content-transfer-encoding']) {
      encoding = header['content-transfer-encoding'][0].toLowerCase()
    } else {
      encoding = '7bit'
    }
    if (conType === 'application/octet-stream' || filename !== undefined) {
      if (this.nfiles === this.filesLimit) {
        if (!this.hitFilesLimit) {
          this.hitFilesLimit = true
          this.emit('filesLimit')
        }
        return this.parserPartSkip(this.part)
      }
      ++this.nfiles
      if (!this._events.file) {
        this.parser._ignore()
        return
      }
      ++this.nends
      const file = new StreamChunk(this.fileOpts)
      this.curFile = file
      file.on('end', () => {
        --this.nends
        this._pause = false
        this.checkFinished()
        if (this._cb && !this._needDrain) {
          const cb = this._cb
          this._cb = undefined
          cb()
        }
      })
      file._read = () => {
        if (!this._pause) { return }
        this._pause = false
        if (this._cb && !this._needDrain) {
          const cb = this._cb
          this._cb = undefined
          cb()
        }
      }
      this.emit('file', fieldname, file, filename, encoding, conType)
      onData = function (data) {
        if ((nsize += data.length) > this.fileSizeLimit) {
          const extraLen = (this.fileSizeLimit - (nsize - data.length))
          if (extraLen > 0) { file.push(data.slice(0, extraLen)) }
          file.emit('limit')
          file.truncated = true
          this.part.removeAllListeners('data')
        } else if (!file.push(data)) { this._pause = true }
      }.bind(this)
      onEnd = function () {
        this.curFile = undefined
        file.push(null)
      }.bind(this)
    } else {
      if (this.nfields === this.fieldsLimit) {
        if (!this.hitFieldsLimit) {
          this.hitFieldsLimit = true
          this.emit('fieldsLimit')
        }
        return this.parserPartSkip(this.part)
      }
      ++this.nfields
      ++this.nends
      let buffer = ''
      let truncated = false
      this.curField = this.part
      onData = function (data) {
        if ((nsize += data.length) > this.fieldSizeLimit) {
          const extraLen = (this.fieldSizeLimit - (nsize - data.length))
          buffer += data.toString('binary', 0, extraLen)
          truncated = true
          this.part.removeAllListeners('data')
        } else { buffer += data.toString('binary') }
      }.bind(this)
      onEnd = function () {
        this.curField = undefined
        if (buffer.length) {
          buffer = this.decodeText(buffer, 'binary', charset)
        }
        this.emit(
          'field', fieldname, buffer, false, truncated, encoding, conType
        )
        --this.nends
        this.checkFinished()
      }.bind(this)
    }
    this.part._readableState.sync = false
    this.part.on('data', onData)
    this.part.on('end', onEnd)
  }

  parserPartSkip (part) { part.resume() }

  parserPart (part) {
    if (++this._nparts > this.partsLimit) {
      this.parser.removeListener('part', this.parserPartSkip.bind(this))
      this.parser.on('part', this.parserPartSkip.bind(this))
      this.hitPartsLimit = true
      this.emit('partsLimit')
      return this.parserPartSkip(part)
    }
    if (this.curField) {
      const field = this.curField
      field.emit('end')
      field.removeAllListeners('end')
    }
    this.part = part
    part.on('header', this.parserPartHeader.bind(this))
    part.on('error', this.parserPartError.bind(this))
  }

  setupParser () {
    this.parser.on('drain', this.parserDrain.bind(this))
    this.parser.on('part', this.parserPart.bind(this))
    this.parser.on('error', this.parserError.bind(this))
    this.parser.on('finish', this.parserFinish.bind(this))
  }

  write (chunk, cb = () => {}) {
    const parseWrite = this.parser.write(chunk)
    if (parseWrite && !this._pause) return cb()
    this._needDrain = !parseWrite
    this._cb = cb
  }
}
Multipart.FormBuild = FormBuild
Multipart.FormData = FormData
module.exports = Multipart
