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
const inRange = (a, min, max) => min <= a && a <= max
const div = (n, d) => Math.floor(n / d)

const EOFByte = -1
const EOFCodePoint = -1

class ByteInputStream {
  constructor (bytes) {
    this.pos = 0
    this._bytes = bytes
  }

  offset (n) {
    this.pos += n
    if (this.pos < 0) {
      throw new Error('Seeking past start of the buffer')
    }
    if (this.pos > this._bytes.length) {
      throw new Error('Seeking past EOF')
    }
  }

  get () {
    return (this.pos >= this._bytes.length) ? EOFByte : Number(this._bytes[this.pos])
  }

  match (test) {
    if (test.length > this.pos + this._bytes.length) {
      return false
    }
    let i
    for (i = 0; i < test.length; i += 1) {
      if (Number(this._bytes[this.pos + i]) !== test[i]) {
        return false
      }
    }
    return true
  }
}

class ByteOutputStream {
  constructor (bytes) {
    this.pos = 0
    this._bytes = bytes
  }

  emit (varArgs) {
    let last = EOFByte
    let i
    for (i = 0; i < arguments.length; ++i) {
      last = Number(arguments[i])
      this._bytes[this.pos++] = last
    }
    return last
  }
}

class CodePointInputStream {
  constructor (string) {
    const stringToCodePoints = string => {
      const cps = []
      let i = 0; const n = string.length
      while (i < string.length) {
        const c = string.charCodeAt(i)
        if (!inRange(c, 0xD800, 0xDFFF)) {
          cps.push(c)
        } else if (inRange(c, 0xDC00, 0xDFFF)) {
          cps.push(0xFFFD)
        } else { // (inRange(cu, 0xD800, 0xDBFF))
          if (i === n - 1) {
            cps.push(0xFFFD)
          } else {
            const d = string.charCodeAt(i + 1)
            if (inRange(d, 0xDC00, 0xDFFF)) {
              const a = c & 0x3FF
              const b = d & 0x3FF
              i += 1
              cps.push(0x10000 + (a << 10) + b)
            } else {
              cps.push(0xFFFD)
            }
          }
        }
        i += 1
      }
      return cps
    }
    this.pos = 0
    this.cps = stringToCodePoints(string)
  }

  offset (n) {
    this.pos += n
    if (this.pos < 0) {
      throw new Error('Seeking past start of the buffer')
    }
    if (this.pos > this.cps.length) {
      throw new Error('Seeking past EOF')
    }
  }

  get () {
    if (this.pos >= this.cps.length) {
      return EOFCodePoint
    }
    return this.cps[this.pos]
  }
}

class CodePointOutputStream {
  constructor () {
    this._string = ''
  }

  string () {
    return this._string
  }

  emit (c) {
    if (c <= 0xFFFF) {
      this._string += String.fromCharCode(c)
    } else {
      c -= 0x10000
      this._string += String.fromCharCode(0xD800 + ((c >> 10) & 0x3ff))
      this._string += String.fromCharCode(0xDC00 + (c & 0x3ff))
    }
  }
}

class EncodingError extends Error {
  constructor (message) {
    super()

    this.name = 'EncodingError'
    this.message = message
    this.code = 0
  }
}

const decoderError = (fatal, optCodePoint) => {
  if (fatal) {
    throw new EncodingError('Decoder error')
  }
  return optCodePoint || 0xFFFD
}

const encoderError = codePoint => {
  throw new EncodingError(`The code point ${codePoint} could not be encoded.`)
}

const getEncoding = label => {
  label = String(label).trim().toLowerCase()
  if (Object.prototype.hasOwnProperty.call(labelToEncoding, label)) {
    return labelToEncoding[label]
  }
  return null
}

const zlib = require('zlib')
const fs = require('./FileSystem')
const eFile = fs.path.resolve(
  fs.path.join(__dirname, 'dist', 'Encodings.json.gz'))
const encodings = JSON.parse(zlib.gunzipSync(fs.readFileSync(eFile)))

const nameToEncoding = {}
const labelToEncoding = {}
encodings.forEach(category => {
  category.encodings.forEach(encoding => {
    nameToEncoding[encoding.name] = encoding
    encoding.labels.forEach(label => {
      labelToEncoding[label] = encoding
    })
  })
})

const indexCodePointFor = (pointer, index) => {
  if (!index) return null
  return index[pointer] || null
}

const indexPointerFor = (codePoint, index) => {
  const pointer = index.indexOf(codePoint)
  return pointer === -1 ? null : pointer
}

const eIndexFile = fs.path.resolve(
  fs.path.join(__dirname, 'dist', 'EncodingIndex.json.gz'))
const indexes = JSON.parse(zlib.gunzipSync(fs.readFileSync(eIndexFile)))

const DEFAULT_ENCODING = 'utf-8'

class TextDecoder {
  constructor (optEncoding, options) {
    if (!(this instanceof TextDecoder)) {
      return new TextDecoder(optEncoding, options)
    }
    optEncoding = optEncoding ? String(optEncoding) : DEFAULT_ENCODING
    options = Object(options)
    this._encoding = getEncoding(optEncoding)
    if (this._encoding === null || this._encoding.name === 'replacement') {
      throw new TypeError(`Unknown encoding: ${optEncoding}`)
    }

    this._streaming = false
    this._BOMseen = false
    this._decoder = null
    this._options = { fatal: Boolean(options.fatal) }

    if (Object.defineProperty) {
      Object.defineProperty(
        this, 'encoding',
        { get: () => this._encoding.name })
    } else {
      this.encoding = this._encoding.name
    }

    return this
  }

  decode (bytes, options) {
    options = Object(options)

    if (!this._streaming) {
      this._decoder = this._encoding.getDecoder(this._options)
      this._BOMseen = false
    }
    this._streaming = Boolean(options.stream)

    const inputStream = new ByteInputStream(bytes)

    const outputStream = new CodePointOutputStream()

    let codePoint

    while (inputStream.get() !== EOFByte) {
      codePoint = this._decoder.decode(inputStream)
      if (codePoint !== null && codePoint !== EOFCodePoint) {
        outputStream.emit(codePoint)
      }
    }
    if (!this._streaming) {
      do {
        codePoint = this._decoder.decode(inputStream)
        if (codePoint !== null && codePoint !== EOFCodePoint) {
          outputStream.emit(codePoint)
        }
      } while (codePoint !== EOFCodePoint &&
      inputStream.get() !== EOFByte)
      this._decoder = null
    }

    let result = outputStream.string()
    if (!this._BOMseen && result.length) {
      this._BOMseen = true
      const UTFs = ['utf-8', 'utf-16le', 'utf-16be']
      if (UTFs.indexOf(this.encoding) !== -1 &&
        result.charCodeAt(0) === 0xFEFF) {
        result = result.substring(1)
      }
    }

    return result
  }
}

class TextEncoder {
  constructor (optEncoding, options) {
    if (!(this instanceof TextEncoder)) {
      return new TextEncoder(optEncoding, options)
    }
    optEncoding = optEncoding ? String(optEncoding) : DEFAULT_ENCODING
    options = Object(options)
    this._encoding = getEncoding(optEncoding)
    if (this._encoding === null || (this._encoding.name !== 'utf-8' &&
      this._encoding.name !== 'utf-16le' &&
      this._encoding.name !== 'utf-16be')) {
      throw new TypeError('Unknown encoding: ' + optEncoding)
    }
    this._streaming = false
    this._encoder = null
    this._options = { fatal: Boolean(options.fatal) }

    if (Object.defineProperty) {
      Object.defineProperty(
        this, 'encoding',
        { get: () => this._encoding.name })
    } else {
      this.encoding = this._encoding.name
    }

    return this
  }

  encode (optString, options) {
    optString = optString ? String(optString) : ''
    options = Object(options)
    if (!this._streaming) {
      this._encoder = this._encoding.getEncoder(this._options)
    }
    this._streaming = Boolean(options.stream)

    const bytes = []
    const outputStream = new ByteOutputStream(bytes)
    const inputStream = new CodePointInputStream(optString)
    while (inputStream.get() !== EOFCodePoint) {
      this._encoder.encode(outputStream, inputStream)
    }
    if (!this._streaming) {
      let lastByte
      do {
        lastByte = this._encoder.encode(outputStream, inputStream)
      } while (lastByte !== EOFByte)
      this._encoder = null
    }
    return Buffer.from(bytes)
  }
}

class UTF8Decoder {
  constructor (options) {
    this.fatal = options.fatal
    this.utf8CodePoint = 0
    this.utf8BytesNeeded = 0
    this.utf8BytesSeen = 0
    this.utf8LowerBoundary = 0
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte) {
      if (this.utf8BytesNeeded !== 0) {
        return decoderError(this.fatal)
      }
      return EOFCodePoint
    }
    bytePointer.offset(1)

    if (this.utf8BytesNeeded === 0) {
      if (inRange(byte, 0x00, 0x7F)) {
        return byte
      }
      if (inRange(byte, 0xC2, 0xDF)) {
        this.utf8BytesNeeded = 1
        this.utf8LowerBoundary = 0x80
        this.utf8CodePoint = byte - 0xC0
      } else if (inRange(byte, 0xE0, 0xEF)) {
        this.utf8BytesNeeded = 2
        this.utf8LowerBoundary = 0x800
        this.utf8CodePoint = byte - 0xE0
      } else if (inRange(byte, 0xF0, 0xF4)) {
        this.utf8BytesNeeded = 3
        this.utf8LowerBoundary = 0x10000
        this.utf8CodePoint = byte - 0xF0
      } else {
        return decoderError(this.fatal)
      }
      this.utf8CodePoint = this.utf8CodePoint * Math.pow(64, this.utf8BytesNeeded)
      return null
    }
    if (!inRange(byte, 0x80, 0xBF)) {
      this.utf8CodePoint = 0
      this.utf8BytesNeeded = 0
      this.utf8BytesSeen = 0
      this.utf8LowerBoundary = 0
      bytePointer.offset(-1)
      return decoderError(this.fatal)
    }
    this.utf8BytesSeen += 1
    this.utf8CodePoint = this.utf8CodePoint + (byte - 0x80) *
      Math.pow(64, this.utf8BytesNeeded - this.utf8BytesSeen)
    if (this.utf8BytesSeen !== this.utf8BytesNeeded) {
      return null
    }
    const codePoint = this.utf8CodePoint
    const lowerBoundary = this.utf8LowerBoundary
    this.utf8CodePoint = 0
    this.utf8BytesNeeded = 0
    this.utf8BytesSeen = 0
    this.utf8LowerBoundary = 0
    if (inRange(codePoint, lowerBoundary, 0x10FFFF) &&
      !inRange(codePoint, 0xD800, 0xDFFF)) {
      return codePoint
    }
    return decoderError(this.fatal)
  }
}

class UTF8Encoder {
  constructor (options) {
    this.fatal = options.fatal
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0xD800, 0xDFFF)) {
      return encoderError(codePoint)
    }
    if (inRange(codePoint, 0x0000, 0x007f)) {
      return outputByteStream.emit(codePoint)
    }
    let count, offset
    if (inRange(codePoint, 0x0080, 0x07FF)) {
      count = 1
      offset = 0xC0
    } else if (inRange(codePoint, 0x0800, 0xFFFF)) {
      count = 2
      offset = 0xE0
    } else if (inRange(codePoint, 0x10000, 0x10FFFF)) {
      count = 3
      offset = 0xF0
    }
    let result = outputByteStream.emit(
      div(codePoint, Math.pow(64, count)) + offset)
    while (count > 0) {
      const temp = div(codePoint, Math.pow(64, count - 1))
      result = outputByteStream.emit(0x80 + (temp % 64))
      count -= 1
    }
    return result
  }
}
nameToEncoding['utf-8'].getEncoder = options => new UTF8Encoder(options)
nameToEncoding['utf-8'].getDecoder = options => new UTF8Decoder(options)

class SingleByteDecoder {
  constructor (index, options) {
    this.fatal = options.fatal
    this._index = index
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte) {
      return EOFCodePoint
    }
    bytePointer.offset(1)
    if (inRange(byte, 0x00, 0x7F)) {
      return byte
    }
    const codePoint = this._index[byte - 0x80]
    if (codePoint === null) {
      return decoderError(this.fatal)
    }
    return codePoint
  }
}

class SingleByteEncoder {
  constructor (index, options) {
    this.fatal = options.fatal
    this._index = index
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    const pointer = indexPointerFor(codePoint, this._index)
    if (pointer === null) {
      encoderError(codePoint)
    }
    return outputByteStream.emit(pointer + 0x80)
  }
}

((() => {
  encodings.forEach(category => {
    if (category.heading !== 'Legacy single-byte encodings') { return }
    category.encodings.forEach(encoding => {
      const idx = indexes[encoding.name]
      encoding.getDecoder = options => new SingleByteDecoder(idx, options)
      encoding.getEncoder = options => new SingleByteEncoder(idx, options)
    })
  })
})())

class GBKDecoder {
  constructor (gb18030, options) {
    this.fatal = options.fatal
    this.gbkFirst = 0x00
    this.gbkSecond = 0x00
    this.gbkThird = 0x00
    this._gb18030 = gb18030
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte && this.gbkFirst === 0x00 &&
      this.gbkSecond === 0x00 && this.gbkThird === 0x00) {
      return EOFCodePoint
    }
    if (byte === EOFByte &&
      (this.gbkFirst !== 0x00 || this.gbkSecond !== 0x00 || this.gbkThird !== 0x00)) {
      this.gbkFirst = 0x00
      this.gbkSecond = 0x00
      this.gbkThird = 0x00
      decoderError(this.fatal)
    }
    bytePointer.offset(1)
    let codePoint
    if (this.gbkThird !== 0x00) {
      codePoint = null
      if (inRange(byte, 0x30, 0x39)) {
        const indexGB18030CodePointFor = pointer => {
          if ((pointer > 39419 && pointer < 189000) || (pointer > 1237575)) {
            return null
          }
          let offset = 0
          let codePointOffset = 0
          const idx = indexes.gb18030
          let i
          for (i = 0; i < idx.length; ++i) {
            const entry = idx[i]
            if (entry[0] <= pointer) {
              offset = entry[0]
              codePointOffset = entry[1]
            } else {
              break
            }
          }
          return codePointOffset + pointer - offset
        }
        codePoint = indexGB18030CodePointFor(
          (((this.gbkFirst - 0x81) * 10 + (this.gbkSecond - 0x30)) * 126 +
            (this.gbkThird - 0x81)) * 10 + byte - 0x30)
      }
      this.gbkFirst = 0x00
      this.gbkSecond = 0x00
      this.gbkThird = 0x00
      if (codePoint === null) {
        bytePointer.offset(-3)
        return decoderError(this.fatal)
      }
      return codePoint
    }
    if (this.gbkSecond !== 0x00) {
      if (inRange(byte, 0x81, 0xFE)) {
        this.gbkThird = byte
        return null
      }
      bytePointer.offset(-2)
      this.gbkFirst = 0x00
      this.gbkSecond = 0x00
      return decoderError(this.fatal)
    }
    if (this.gbkFirst !== 0x00) {
      if (inRange(byte, 0x30, 0x39) && this._gb18030) {
        this.gbkSecond = byte
        return null
      }
      const lead = this.gbkFirst
      let pointer = null
      this.gbkFirst = 0x00
      const offset = byte < 0x7F ? 0x40 : 0x41
      if (inRange(byte, 0x40, 0x7E) || inRange(byte, 0x80, 0xFE)) {
        pointer = (lead - 0x81) * 190 + (byte - offset)
      }
      codePoint = pointer === null ? null
        : indexCodePointFor(pointer, indexes.gbk)
      if (pointer === null) {
        bytePointer.offset(-1)
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint
    }
    if (inRange(byte, 0x00, 0x7F)) {
      return byte
    }
    if (byte === 0x80) {
      return 0x20AC
    }
    if (inRange(byte, 0x81, 0xFE)) {
      this.gbkFirst = byte
      return null
    }
    return decoderError(this.fatal)
  }
}

class GBKEncoder {
  constructor (gb18030, options) {
    this.fatal = options.fatal
    this._gb18030 = gb18030
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    let pointer = indexPointerFor(codePoint, indexes.gbk)
    if (pointer !== null) {
      const lead = div(pointer, 190) + 0x81
      const trail = pointer % 190
      const offset = trail < 0x3F ? 0x40 : 0x41
      return outputByteStream.emit(lead, trail + offset)
    } else if (this._gb18030) {
      const indexGB18030PointerFor = codePoint => {
        let offset = 0
        let pointerOffset = 0
        const idx = indexes.gb18030
        let i
        for (i = 0; i < idx.length; ++i) {
          const entry = idx[i]
          if (entry[1] <= codePoint) {
            offset = entry[1]
            pointerOffset = entry[0]
          } else {
            break
          }
        }
        return pointerOffset + codePoint - offset
      }
      pointer = indexGB18030PointerFor(codePoint)
      const byte1 = div(div(div(pointer, 10), 126), 10)
      pointer = pointer - byte1 * 10 * 126 * 10
      const byte2 = div(div(pointer, 10), 126)
      pointer = pointer - byte2 * 10 * 126
      const byte3 = div(pointer, 10)
      const byte4 = pointer - byte3 * 10
      return outputByteStream.emit(byte1 + 0x81,
        byte2 + 0x30,
        byte3 + 0x81,
        byte4 + 0x30)
    }
    return encoderError(codePoint)
  }
}
nameToEncoding.gbk.getEncoder = options => new GBKEncoder(false, options)
nameToEncoding.gbk.getDecoder = options => new GBKDecoder(false, options)
nameToEncoding.gb18030.getEncoder = options => new GBKEncoder(true, options)
nameToEncoding.gb18030.getDecoder = options => new GBKDecoder(true, options)

class HZGB2312Decoder {
  constructor (options) {
    this.fatal = options.fatal
    this.hzgb2312 = false
    this.hzgb2312Lead = 0x00
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte && this.hzgb2312Lead === 0x00) {
      return EOFCodePoint
    }
    if (byte === EOFByte && this.hzgb2312Lead !== 0x00) {
      this.hzgb2312Lead = 0x00
      return decoderError(this.fatal)
    }
    bytePointer.offset(1)
    if (this.hzgb2312Lead === 0x7E) {
      this.hzgb2312Lead = 0x00
      if (byte === 0x7B) {
        this.hzgb2312 = true
        return null
      }
      if (byte === 0x7D) {
        this.hzgb2312 = false
        return null
      }
      if (byte === 0x7E) {
        return 0x007E
      }
      if (byte === 0x0A) {
        return null
      }
      bytePointer.offset(-1)
      return decoderError(this.fatal)
    }
    if (this.hzgb2312Lead !== 0x00) {
      const lead = this.hzgb2312Lead
      this.hzgb2312Lead = 0x00
      let codePoint = null
      if (inRange(byte, 0x21, 0x7E)) {
        codePoint = indexCodePointFor((lead - 1) * 190 +
          (byte + 0x3F), indexes.gbk)
      }
      if (byte === 0x0A) {
        this.hzgb2312 = false
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint
    }
    if (byte === 0x7E) {
      this.hzgb2312Lead = 0x7E
      return null
    }
    if (this.hzgb2312) {
      if (inRange(byte, 0x20, 0x7F)) {
        this.hzgb2312Lead = byte
        return null
      }
      if (byte === 0x0A) {
        this.hzgb2312 = false
      }
      return decoderError(this.fatal)
    }
    if (inRange(byte, 0x00, 0x7F)) {
      return byte
    }
    return decoderError(this.fatal)
  }
}

class HZGB2312Encoder {
  constructor (options) {
    this.fatal = options.fatal
    this.hzgb2312 = false
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x007F) && this.hzgb2312) {
      codePointPointer.offset(-1)
      this.hzgb2312 = false
      return outputByteStream.emit(0x7E, 0x7D)
    }
    if (codePoint === 0x007E) {
      return outputByteStream.emit(0x7E, 0x7E)
    }
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    if (!this.hzgb2312) {
      codePointPointer.offset(-1)
      this.hzgb2312 = true
      return outputByteStream.emit(0x7E, 0x7B)
    }
    const pointer = indexPointerFor(codePoint, indexes.gbk)
    if (pointer === null) {
      return encoderError(codePoint)
    }
    const lead = div(pointer, 190) + 1
    const trail = pointer % 190 - 0x3F
    if (!inRange(lead, 0x21, 0x7E) || !inRange(trail, 0x21, 0x7E)) {
      return encoderError(codePoint)
    }
    return outputByteStream.emit(lead, trail)
  }
}
nameToEncoding['hz-gb-2312'].getEncoder = options => new HZGB2312Encoder(options)
nameToEncoding['hz-gb-2312'].getDecoder = options => new HZGB2312Decoder(options)

class Big5Decoder {
  constructor (options) {
    this.fatal = options.fatal
    this.big5Lead = 0x00
    this.big5Pending = null
  }

  decode (bytePointer) {
    if (this.big5Pending !== null) {
      const pending = this.big5Pending
      this.big5Pending = null
      return pending
    }
    const byte = bytePointer.get()
    if (byte === EOFByte && this.big5Lead === 0x00) {
      return EOFCodePoint
    }
    if (byte === EOFByte && this.big5Lead !== 0x00) {
      this.big5Lead = 0x00
      return decoderError(this.fatal)
    }
    bytePointer.offset(1)
    if (this.big5Lead !== 0x00) {
      const lead = this.big5Lead
      let pointer = null
      this.big5Lead = 0x00
      const offset = byte < 0x7F ? 0x40 : 0x62
      if (inRange(byte, 0x40, 0x7E) || inRange(byte, 0xA1, 0xFE)) {
        pointer = (lead - 0x81) * 157 + (byte - offset)
      }
      if (pointer === 1133) {
        this.big5Pending = 0x0304
        return 0x00CA
      }
      if (pointer === 1135) {
        this.big5Pending = 0x030C
        return 0x00CA
      }
      if (pointer === 1164) {
        this.big5Pending = 0x0304
        return 0x00EA
      }
      if (pointer === 1166) {
        this.big5Pending = 0x030C
        return 0x00EA
      }
      const codePoint = (pointer === null) ? null
        : indexCodePointFor(pointer, indexes.big5)
      if (pointer === null) {
        bytePointer.offset(-1)
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint
    }
    if (inRange(byte, 0x00, 0x7F)) {
      return byte
    }
    if (inRange(byte, 0x81, 0xFE)) {
      this.big5Lead = byte
      return null
    }
    return decoderError(this.fatal)
  }
}

class Big5Encoder {
  constructor (options) {
    this.fatal = options.fatal
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    const pointer = indexPointerFor(codePoint, indexes.big5)
    if (pointer === null) {
      return encoderError(codePoint)
    }
    const lead = div(pointer, 157) + 0x81
    const trail = pointer % 157
    const offset = trail < 0x3F ? 0x40 : 0x62
    return outputByteStream.emit(lead, trail + offset)
  }
}
nameToEncoding.big5.getEncoder = options => new Big5Encoder(options)
nameToEncoding.big5.getDecoder = options => new Big5Decoder(options)

class EUCJPDecoder {
  constructor (options) {
    this.fatal = options.fatal
    this.eucjpFirst = 0x00
    this.eucjpSecond = 0x00
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte) {
      if (this.eucjpFirst === 0x00 && this.eucjpSecond === 0x00) {
        return EOFCodePoint
      }
      this.eucjpFirst = 0x00
      this.eucjpSecond = 0x00
      return decoderError(this.fatal)
    }
    bytePointer.offset(1)

    let lead, codePoint
    if (this.eucjpSecond !== 0x00) {
      lead = this.eucjpSecond
      this.eucjpSecond = 0x00
      codePoint = null
      if (inRange(lead, 0xA1, 0xFE) && inRange(byte, 0xA1, 0xFE)) {
        codePoint = indexCodePointFor((lead - 0xA1) * 94 + byte - 0xA1,
          indexes.jis0212)
      }
      if (!inRange(byte, 0xA1, 0xFE)) {
        bytePointer.offset(-1)
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint
    }
    if (this.eucjpFirst === 0x8E && inRange(byte, 0xA1, 0xDF)) {
      this.eucjpFirst = 0x00
      return 0xFF61 + byte - 0xA1
    }
    if (this.eucjpFirst === 0x8F && inRange(byte, 0xA1, 0xFE)) {
      this.eucjpFirst = 0x00
      this.eucjpSecond = byte
      return null
    }
    if (this.eucjpFirst !== 0x00) {
      lead = this.eucjpFirst
      this.eucjpFirst = 0x00
      codePoint = null
      if (inRange(lead, 0xA1, 0xFE) && inRange(byte, 0xA1, 0xFE)) {
        codePoint = indexCodePointFor((lead - 0xA1) * 94 + byte - 0xA1,
          indexes.jis0208)
      }
      if (!inRange(byte, 0xA1, 0xFE)) {
        bytePointer.offset(-1)
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint
    }
    if (inRange(byte, 0x00, 0x7F)) {
      return byte
    }
    if (byte === 0x8E || byte === 0x8F || (inRange(byte, 0xA1, 0xFE))) {
      this.eucjpFirst = byte
      return null
    }
    return decoderError(this.fatal)
  }
}

class EUCJPEncoder {
  constructor (options) {
    this.fatal = options.fatal
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    if (codePoint === 0x00A5) {
      return outputByteStream.emit(0x5C)
    }
    if (codePoint === 0x203E) {
      return outputByteStream.emit(0x7E)
    }
    if (inRange(codePoint, 0xFF61, 0xFF9F)) {
      return outputByteStream.emit(0x8E, codePoint - 0xFF61 + 0xA1)
    }

    const pointer = indexPointerFor(codePoint, indexes.jis0208)
    if (pointer === null) {
      return encoderError(codePoint)
    }
    const lead = div(pointer, 94) + 0xA1
    const trail = pointer % 94 + 0xA1
    return outputByteStream.emit(lead, trail)
  }
}
nameToEncoding['euc-jp'].getEncoder = options => new EUCJPEncoder(options)
nameToEncoding['euc-jp'].getDecoder = options => new EUCJPDecoder(options)

class ISO2022JPDecoder {
  constructor (options) {
    this.fatal = options.fatal
    this.state = {
      ASCII: 0,
      escape_start: 1,
      escape_middle: 2,
      escape_final: 3,
      lead: 4,
      trail: 5,
      Katakana: 6
    }
    this.iso2022jpState = this.state.ASCII
    this.iso2022jpJis0212 = false
    this.iso2022jpLead = 0x00
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    let lead = 0x00
    let codePoint = null
    let pointer = 0x00
    if (byte !== EOFByte) {
      bytePointer.offset(1)
    }
    switch (this.iso2022jpState) {
    default:
    case this.state.ASCII:
      if (byte === 0x1B) {
        this.iso2022jpState = this.state.escape_start
        return null
      }
      if (inRange(byte, 0x00, 0x7F)) {
        return byte
      }
      if (byte === EOFByte) {
        return EOFCodePoint
      }
      return decoderError(this.fatal)

    case this.state.escape_start:
      if (byte === 0x24 || byte === 0x28) {
        this.iso2022jpLead = byte
        this.iso2022jpState = this.state.escape_middle
        return null
      }
      if (byte !== EOFByte) {
        bytePointer.offset(-1)
      }
      this.iso2022jpState = this.state.ASCII
      return decoderError(this.fatal)

    case this.state.escape_middle:
      lead = this.iso2022jpLead
      this.iso2022jpLead = 0x00
      if (lead === 0x24 && (byte === 0x40 || byte === 0x42)) {
        this.iso2022jpJis0212 = false
        this.iso2022jpState = this.state.lead
        return null
      }
      if (lead === 0x24 && byte === 0x28) {
        this.iso2022jpState = this.state.escape_final
        return null
      }
      if (lead === 0x28 && (byte === 0x42 || byte === 0x4A)) {
        this.iso2022jpState = this.state.ASCII
        return null
      }
      if (lead === 0x28 && byte === 0x49) {
        this.iso2022jpState = this.state.Katakana
        return null
      }
      if (byte === EOFByte) {
        bytePointer.offset(-1)
      } else {
        bytePointer.offset(-2)
      }
      this.iso2022jpState = this.state.ASCII
      return decoderError(this.fatal)

    case this.state.escape_final:
      if (byte === 0x44) {
        this.iso2022jpJis0212 = true
        this.iso2022jpState = this.state.lead
        return null
      }
      if (byte === EOFByte) {
        bytePointer.offset(-2)
      } else {
        bytePointer.offset(-3)
      }
      this.iso2022jpState = this.state.ASCII
      return decoderError(this.fatal)

    case this.state.lead:
      if (byte === 0x0A) {
        this.iso2022jpState = this.state.ASCII
        return decoderError(this.fatal, 0x000A)
      }
      if (byte === 0x1B) {
        this.iso2022jpState = this.state.escape_start
        return null
      }
      if (byte === EOFByte) {
        return EOFCodePoint
      }
      this.iso2022jpLead = byte
      this.iso2022jpState = this.state.trail
      return null

    case this.state.trail:
      this.iso2022jpState = this.state.lead
      if (byte === EOFByte) {
        return decoderError(this.fatal)
      }
      codePoint = null
      pointer = (this.iso2022jpLead - 0x21) * 94 + byte - 0x21
      if (inRange(this.iso2022jpLead, 0x21, 0x7E) &&
        inRange(byte, 0x21, 0x7E)) {
        codePoint = (this.iso2022jpJis0212 === false)
          ? indexCodePointFor(pointer, indexes.jis0208)
          : indexCodePointFor(pointer, indexes.jis0212)
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint

    case this.state.Katakana:
      if (byte === 0x1B) {
        this.iso2022jpState = this.state.escape_start
        return null
      }
      if (inRange(byte, 0x21, 0x5F)) {
        return 0xFF61 + byte - 0x21
      }
      if (byte === EOFByte) {
        return EOFCodePoint
      }
      return decoderError(this.fatal)
    }
  }
}

class ISO2022JPEncoder {
  constructor (options) {
    this.fatal = options.fatal
    this.state = {
      ASCII: 0,
      lead: 1,
      Katakana: 2
    }
    this.iso2022jpState = this.state.ASCII
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if ((inRange(codePoint, 0x0000, 0x007F) ||
      codePoint === 0x00A5 || codePoint === 0x203E) &&
      this.iso2022jpState !== this.state.ASCII) {
      codePointPointer.offset(-1)
      this.iso2022jpState = this.state.ASCII
      return outputByteStream.emit(0x1B, 0x28, 0x42)
    }
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    if (codePoint === 0x00A5) {
      return outputByteStream.emit(0x5C)
    }
    if (codePoint === 0x203E) {
      return outputByteStream.emit(0x7E)
    }
    if (inRange(codePoint, 0xFF61, 0xFF9F) &&
      this.iso2022jpState !== this.state.Katakana) {
      codePointPointer.offset(-1)
      this.iso2022jpState = this.state.Katakana
      return outputByteStream.emit(0x1B, 0x28, 0x49)
    }
    if (inRange(codePoint, 0xFF61, 0xFF9F)) {
      return outputByteStream.emit(codePoint - 0xFF61 - 0x21)
    }
    if (this.iso2022jpState !== this.state.lead) {
      codePointPointer.offset(-1)
      this.iso2022jpState = this.state.lead
      return outputByteStream.emit(0x1B, 0x24, 0x42)
    }
    const pointer = indexPointerFor(codePoint, indexes.jis0208)
    if (pointer === null) {
      return encoderError(codePoint)
    }
    const lead = div(pointer, 94) + 0x21
    const trail = pointer % 94 + 0x21
    return outputByteStream.emit(lead, trail)
  }
}
nameToEncoding['iso-2022-jp'].getEncoder = options => new ISO2022JPEncoder(options)
nameToEncoding['iso-2022-jp'].getDecoder = options => new ISO2022JPDecoder(options)

class ShiftJISDecoder {
  constructor (options) {
    this.fatal = options.fatal
    this.shiftjisLead = 0x00
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte && this.shiftjisLead === 0x00) {
      return EOFCodePoint
    }
    if (byte === EOFByte && this.shiftjisLead !== 0x00) {
      this.shiftjisLead = 0x00
      return decoderError(this.fatal)
    }
    bytePointer.offset(1)
    if (this.shiftjisLead !== 0x00) {
      const lead = this.shiftjisLead
      this.shiftjisLead = 0x00
      if (inRange(byte, 0x40, 0x7E) || inRange(byte, 0x80, 0xFC)) {
        const offset = (byte < 0x7F) ? 0x40 : 0x41
        const leadOffset = (lead < 0xA0) ? 0x81 : 0xC1
        const codePoint = indexCodePointFor((lead - leadOffset) * 188 +
          byte - offset, indexes.jis0208)
        if (codePoint === null) {
          return decoderError(this.fatal)
        }
        return codePoint
      }
      bytePointer.offset(-1)
      return decoderError(this.fatal)
    }
    if (inRange(byte, 0x00, 0x80)) {
      return byte
    }
    if (inRange(byte, 0xA1, 0xDF)) {
      return 0xFF61 + byte - 0xA1
    }
    if (inRange(byte, 0x81, 0x9F) || inRange(byte, 0xE0, 0xFC)) {
      this.shiftjisLead = byte
      return null
    }
    return decoderError(this.fatal)
  }
}

class ShiftJISEncoder {
  constructor (options) {
    this.fatal = options.fatal
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x0080)) {
      return outputByteStream.emit(codePoint)
    }
    if (codePoint === 0x00A5) {
      return outputByteStream.emit(0x5C)
    }
    if (codePoint === 0x203E) {
      return outputByteStream.emit(0x7E)
    }
    if (inRange(codePoint, 0xFF61, 0xFF9F)) {
      return outputByteStream.emit(codePoint - 0xFF61 + 0xA1)
    }
    const pointer = indexPointerFor(codePoint, indexes.jis0208)
    if (pointer === null) {
      return encoderError(codePoint)
    }
    const lead = div(pointer, 188)
    const leadOffset = lead < 0x1F ? 0x81 : 0xC1
    const trail = pointer % 188
    const offset = trail < 0x3F ? 0x40 : 0x41
    return outputByteStream.emit(lead + leadOffset, trail + offset)
  }
}
nameToEncoding.shift_jis.getEncoder = options => new ShiftJISEncoder(options)
nameToEncoding.shift_jis.getDecoder = options => new ShiftJISDecoder(options)

class EUCKRDecoder {
  constructor (options) {
    this.fatal = options.fatal
    this.euckrLead = 0x00
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte && this.euckrLead === 0) {
      return EOFCodePoint
    }
    if (byte === EOFByte && this.euckrLead !== 0) {
      this.euckrLead = 0x00
      return decoderError(this.fatal)
    }
    bytePointer.offset(1)
    if (this.euckrLead !== 0x00) {
      const lead = this.euckrLead
      let pointer = null
      this.euckrLead = 0x00

      if (inRange(lead, 0x81, 0xC6)) {
        const temp = (26 + 26 + 126) * (lead - 0x81)
        if (inRange(byte, 0x41, 0x5A)) {
          pointer = temp + byte - 0x41
        } else if (inRange(byte, 0x61, 0x7A)) {
          pointer = temp + 26 + byte - 0x61
        } else if (inRange(byte, 0x81, 0xFE)) {
          pointer = temp + 26 + 26 + byte - 0x81
        }
      }

      if (inRange(lead, 0xC7, 0xFD) && inRange(byte, 0xA1, 0xFE)) {
        pointer = (26 + 26 + 126) * (0xC7 - 0x81) + (lead - 0xC7) * 94 +
          (byte - 0xA1)
      }

      const codePoint = (pointer === null) ? null
        : indexCodePointFor(pointer, indexes['euc-kr'])
      if (pointer === null) {
        bytePointer.offset(-1)
      }
      if (codePoint === null) {
        return decoderError(this.fatal)
      }
      return codePoint
    }

    if (inRange(byte, 0x00, 0x7F)) {
      return byte
    }

    if (inRange(byte, 0x81, 0xFD)) {
      this.euckrLead = byte
      return null
    }

    return decoderError(this.fatal)
  }
}

class EUCKREncoder {
  constructor (options) {
    this.fatal = options.fatal
  }

  encode (outputByteStream, codePointPointer) {
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0x0000, 0x007F)) {
      return outputByteStream.emit(codePoint)
    }
    let pointer = indexPointerFor(codePoint, indexes['euc-kr'])
    if (pointer === null) {
      return encoderError(codePoint)
    }
    let lead, trail
    if (pointer < ((26 + 26 + 126) * (0xC7 - 0x81))) {
      lead = div(pointer, (26 + 26 + 126)) + 0x81
      trail = pointer % (26 + 26 + 126)
      const offset = trail < 26 ? 0x41 : trail < 26 + 26 ? 0x47 : 0x4D
      return outputByteStream.emit(lead, trail + offset)
    }
    pointer = pointer - (26 + 26 + 126) * (0xC7 - 0x81)
    lead = div(pointer, 94) + 0xC7
    trail = pointer % 94 + 0xA1
    return outputByteStream.emit(lead, trail)
  }
}
nameToEncoding['euc-kr'].getEncoder = options => new EUCKREncoder(options)
nameToEncoding['euc-kr'].getDecoder = options => new EUCKRDecoder(options)

class UTF16Decoder {
  constructor (utf16Be, options) {
    this.fatal = options.fatal
    this.utf16LeadByte = null
    this.utf16LeadSurrogate = null
    this._utf16Be = utf16Be
  }

  decode (bytePointer) {
    const byte = bytePointer.get()
    if (byte === EOFByte && this.utf16LeadByte === null &&
      this.utf16LeadSurrogate === null) {
      return EOFCodePoint
    }
    if (byte === EOFByte && (this.utf16LeadByte !== null ||
      this.utf16LeadSurrogate !== null)) {
      return decoderError(this.fatal)
    }
    bytePointer.offset(1)
    if (this.utf16LeadByte === null) {
      this.utf16LeadByte = byte
      return null
    }
    let codePoint
    if (this._utf16Be) {
      codePoint = (this.utf16LeadByte << 8) + byte
    } else {
      codePoint = (byte << 8) + this.utf16LeadByte
    }
    this.utf16LeadByte = null
    if (this.utf16LeadSurrogate !== null) {
      const leadSurrogate = this.utf16LeadSurrogate
      this.utf16LeadSurrogate = null
      if (inRange(codePoint, 0xDC00, 0xDFFF)) {
        return 0x10000 + (leadSurrogate - 0xD800) * 0x400 +
          (codePoint - 0xDC00)
      }
      bytePointer.offset(-2)
      return decoderError(this.fatal)
    }
    if (inRange(codePoint, 0xD800, 0xDBFF)) {
      this.utf16LeadSurrogate = codePoint
      return null
    }
    if (inRange(codePoint, 0xDC00, 0xDFFF)) {
      return decoderError(this.fatal)
    }
    return codePoint
  }
}

class UTF16Encoder {
  constructor (utf16Be, options) {
    this.fatal = options.fatal
    this._utf16Be = utf16Be
  }

  encode (outputByteStream, codePointPointer) {
    const convertToBytes = (codeUnit) => {
      const byte1 = codeUnit >> 8
      const byte2 = codeUnit & 0x00FF
      if (this._utf16Be) {
        return outputByteStream.emit(byte1, byte2)
      }
      return outputByteStream.emit(byte2, byte1)
    }
    const codePoint = codePointPointer.get()
    if (codePoint === EOFCodePoint) {
      return EOFByte
    }
    codePointPointer.offset(1)
    if (inRange(codePoint, 0xD800, 0xDFFF)) {
      encoderError(codePoint)
    }
    if (codePoint <= 0xFFFF) {
      return convertToBytes(codePoint)
    }
    const lead = div((codePoint - 0x10000), 0x400) + 0xD800
    const trail = ((codePoint - 0x10000) % 0x400) + 0xDC00
    convertToBytes(lead)
    return convertToBytes(trail)
  }
}
nameToEncoding['utf-16be'].getEncoder = options => new UTF16Encoder(true, options)
nameToEncoding['utf-16be'].getDecoder = options => new UTF16Decoder(true, options)
nameToEncoding['utf-16le'].getEncoder = options => new UTF16Encoder(false, options)
nameToEncoding['utf-16le'].getDecoder = options => new UTF16Decoder(false, options)

exports.TextEncoder = TextEncoder
exports.TextDecoder = TextDecoder
exports.encodingExists = getEncoding
