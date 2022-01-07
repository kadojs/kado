const fs = require('./FileSystem')
const { EventEmitter } = require('events')
const { Transform, PassThrough, Writable, Readable } = require('stream')

const readAndAssertNoEof = (reader, buffer, offset, length, position, callback) => {
  if (length === 0) {
    return setImmediate(() => { callback(null, Buffer.alloc(0)) })
  }
  reader.read(buffer, offset, length, position, (err, bytesRead) => {
    if (err) return callback(err)
    if (bytesRead < length) {
      return callback(new Error('unexpected EOF'))
    }
    callback()
  })
}

const decodeBuffer = (buffer, start, end, isUtf8) => {
  const cp437 = '\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ '
  if (isUtf8) {
    return buffer.toString('utf8', start, end)
  } else {
    let result = ''
    for (let i = start; i < end; i++) {
      result += cp437[buffer[i]]
    }
    return result
  }
}

const readUInt64LE = (buffer, offset) => {
  const lower32 = buffer.readUInt32LE(offset)
  const upper32 = buffer.readUInt32LE(offset + 4)
  return upper32 * 0x100000000 + lower32
}

const defaultCallback = (err) => {
  if (err) throw err
}

class Unzip {
  static get ZipFile () { return ZipFile }
  static get Entry () { return Entry }
  static get RandomAccessReader () { return RandomAccessReader }
  static get dosDateTimeToDate () { return dosDateTimeToDate }
  static get validateFileName () { return validateFileName }

  static async open (path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }
    if (options == null) options = {}
    if (options.autoClose == null) options.autoClose = true
    try {
      const fd = await fs.open(path, 'r')
      await Unzip.fromFd(fd, options, (err, zipFile) => {
        if (err) fd.close()
        callback(err, zipFile)
      })
    } catch (err) {
      if (err) return callback(err)
    }
  }

  static async fromFd (fd, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }
    if (options == null) options = {}
    if (options.autoClose == null) options.autoClose = false
    if (options.lazyEntries == null) options.lazyEntries = false
    if (options.decodeStrings == null) options.decodeStrings = true
    if (options.validateEntrySizes == null) options.validateEntrySizes = true
    if (options.strictFileNames == null) options.strictFileNames = false
    if (callback == null) callback = defaultCallback
    try {
      const { size } = await fd.stat()
      const reader = new FdSlicer(fd, { autoClose: true })
      Unzip.fromRandomAccessReader(reader, size, options, callback)
    } catch (err) {
      if (err) return callback(err)
    }
  }

  static fromBuffer (buffer, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }
    if (options == null) options = {}
    options.autoClose = false
    if (options.lazyEntries == null) options.lazyEntries = false
    if (options.decodeStrings == null) options.decodeStrings = true
    if (options.validateEntrySizes == null) options.validateEntrySizes = true
    if (options.strictFileNames == null) options.strictFileNames = false
    const reader = new BufferSlicer(buffer, { maxChunkSize: 0x10000 })
    Unzip.fromRandomAccessReader(reader, buffer.length, options, callback)
  }

  static fromRandomAccessReader (reader, totalSize, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }
    if (options == null) options = {}
    if (options.autoClose == null) options.autoClose = true
    if (options.lazyEntries == null) options.lazyEntries = false
    if (options.decodeStrings == null) options.decodeStrings = true
    const decodeStrings = !!options.decodeStrings
    if (options.validateEntrySizes == null) options.validateEntrySizes = true
    if (options.strictFileNames == null) options.strictFileNames = false
    if (callback == null) callback = defaultCallback
    if (typeof totalSize !== 'number') throw new Error('expected totalSize parameter to be a number')
    if (totalSize > Number.MAX_SAFE_INTEGER) {
      throw new Error('zip file too large. only file sizes up to 2^52 are supported due to JavaScript\'s Number type being an IEEE 754 double.')
    }

    // the matching unref() call is in ZipFile.close()
    reader.ref()

    const eocdrWithoutCommentSize = 22
    const maxCommentSize = 0xffff // 2-byte size
    const bufferSize = Math.min(eocdrWithoutCommentSize + maxCommentSize, totalSize)
    const buffer = Buffer.alloc(bufferSize)
    const bufferReadStart = totalSize - buffer.length
    readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, (err) => {
      if (err) return callback(err)
      for (let i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
        if (buffer.readUInt32LE(i) !== 0x06054b50) continue
        const eocdrBuffer = buffer.slice(i)

        const diskNumber = eocdrBuffer.readUInt16LE(4)
        if (diskNumber !== 0) {
          return callback(new Error('multi-disk zip files are not supported: found disk number: ' + diskNumber))
        }
        let entryCount = eocdrBuffer.readUInt16LE(10)
        let centralDirectoryOffset = eocdrBuffer.readUInt32LE(16)
        const commentLength = eocdrBuffer.readUInt16LE(20)
        const expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize
        if (commentLength !== expectedCommentLength) {
          return callback(new Error('invalid comment length. expected: ' + expectedCommentLength + '. found: ' + commentLength))
        }
        const comment = decodeStrings
          ? decodeBuffer(eocdrBuffer, 22, eocdrBuffer.length, false)
          : eocdrBuffer.slice(22)

        if (!(entryCount === 0xffff || centralDirectoryOffset === 0xffffffff)) {
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames))
        }

        const eocdl64Buffer = Buffer.alloc(20)
        const eocdl64Offset = bufferReadStart + i - eocdl64Buffer.length
        readAndAssertNoEof(reader, eocdl64Buffer, 0, eocdl64Buffer.length, eocdl64Offset, (err) => {
          if (err) return callback(err)
          if (eocdl64Buffer.readUInt32LE(0) !== 0x07064b50) {
            return callback(new Error('invalid zip64 end of central directory locator signature'))
          }
          const zip64EocdrOffset = readUInt64LE(eocdl64Buffer, 8)
          const zip64EocdrBuffer = Buffer.alloc(56)
          readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, (err) => {
            if (err) return callback(err)
            if (zip64EocdrBuffer.readUInt32LE(0) !== 0x06064b50) {
              return callback(new Error('invalid zip64 end of central directory record signature'))
            }
            entryCount = readUInt64LE(zip64EocdrBuffer, 32)
            centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48)
            return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames))
          })
        })
        return
      }
      callback(new Error('end of central directory record signature not found'))
    })
  }
}

const emitError = (self, err) => {
  if (self.emittedError) return
  self.emittedError = true
  self.emit('error', err)
}

const emitErrorAndAutoClose = (self, err) => {
  if (self.autoClose) self.close()
  emitError(self, err)
}

const validateFileName = (fileName) => {
  if (fileName.indexOf('\\') !== -1) {
    return 'invalid characters in fileName: ' + fileName
  }
  if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
    return 'absolute path: ' + fileName
  }
  if (fileName.split('/').indexOf('..') !== -1) {
    return 'invalid relative path: ' + fileName
  }
  return null
}

class ZipFile extends EventEmitter {
  constructor (reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
    super()
    const self = this
    self.reader = reader
    self.reader.on('error', (err) => {
      emitError(self, err)
    })
    self.reader.once('close', () => {
      self.emit('close')
    })
    self.readEntryCursor = centralDirectoryOffset
    self.fileSize = fileSize
    self.entryCount = entryCount
    self.comment = comment
    self.entriesRead = 0
    self.autoClose = !!autoClose
    self.lazyEntries = !!lazyEntries
    self.decodeStrings = !!decodeStrings
    self.validateEntrySizes = !!validateEntrySizes
    self.strictFileNames = !!strictFileNames
    self.isOpen = true
    self.emittedError = false
    if (!self.lazyEntries) self._readEntry()
  }

  close () {
    if (!this.isOpen) return
    this.isOpen = false
    this.reader.unref()
  }

  readEntry () {
    if (!this.lazyEntries) throw new Error('readEntry() called without lazyEntries:true')
    this._readEntry()
  }

  _readEntry () {
    const self = this
    if (self.entryCount === self.entriesRead) {
      setImmediate(() => {
        if (self.autoClose) self.close()
        if (self.emittedError) return
        self.emit('end')
      })
      return
    }
    if (self.emittedError) return
    let buffer = Buffer.alloc(46)
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, (err) => {
      if (err) return emitErrorAndAutoClose(self, err)
      if (self.emittedError) return
      const entry = new Entry()
      const signature = buffer.readUInt32LE(0)
      if (signature !== 0x02014b50) return emitErrorAndAutoClose(self, new Error('invalid central directory file header signature: 0x' + signature.toString(16)))
      entry.versionMadeBy = buffer.readUInt16LE(4)
      entry.versionNeededToExtract = buffer.readUInt16LE(6)
      entry.generalPurposeBitFlag = buffer.readUInt16LE(8)
      entry.compressionMethod = buffer.readUInt16LE(10)
      entry.lastModFileTime = buffer.readUInt16LE(12)
      entry.lastModFileDate = buffer.readUInt16LE(14)
      entry.crc32 = buffer.readUInt32LE(16)
      entry.compressedSize = buffer.readUInt32LE(20)
      entry.uncompressedSize = buffer.readUInt32LE(24)
      entry.fileNameLength = buffer.readUInt16LE(28)
      entry.extraFieldLength = buffer.readUInt16LE(30)
      entry.fileCommentLength = buffer.readUInt16LE(32)
      entry.internalFileAttributes = buffer.readUInt16LE(36)
      entry.externalFileAttributes = buffer.readUInt32LE(38)
      entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42)

      if (entry.generalPurposeBitFlag & 0x40) return emitErrorAndAutoClose(self, new Error('strong encryption is not supported'))

      self.readEntryCursor += 46

      buffer = Buffer.alloc(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength)
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, (err) => {
        if (err) return emitErrorAndAutoClose(self, err)
        if (self.emittedError) return
        const isUtf8 = (entry.generalPurposeBitFlag & 0x800) !== 0
        entry.fileName = self.decodeStrings
          ? decodeBuffer(buffer, 0, entry.fileNameLength, isUtf8)
          : buffer.slice(0, entry.fileNameLength)

        const fileCommentStart = entry.fileNameLength + entry.extraFieldLength
        const extraFieldBuffer = buffer.slice(entry.fileNameLength, fileCommentStart)
        entry.extraFields = []
        let i = 0
        while (i < extraFieldBuffer.length - 3) {
          const headerId = extraFieldBuffer.readUInt16LE(i)
          const dataSize = extraFieldBuffer.readUInt16LE(i + 2)
          const dataStart = i + 4
          const dataEnd = dataStart + dataSize
          if (dataEnd > extraFieldBuffer.length) return emitErrorAndAutoClose(self, new Error('extra field length exceeds extra field buffer size'))
          const dataBuffer = Buffer.alloc(dataSize)
          extraFieldBuffer.copy(dataBuffer, 0, dataStart, dataEnd)
          entry.extraFields.push({
            id: headerId,
            data: dataBuffer
          })
          i = dataEnd
        }

        entry.fileComment = self.decodeStrings
          ? decodeBuffer(buffer, fileCommentStart, fileCommentStart + entry.fileCommentLength, isUtf8)
          : buffer.slice(fileCommentStart, fileCommentStart + entry.fileCommentLength)
        entry.comment = entry.fileComment

        self.readEntryCursor += buffer.length
        self.entriesRead += 1

        if (entry.uncompressedSize === 0xffffffff ||
            entry.compressedSize === 0xffffffff ||
            entry.relativeOffsetOfLocalHeader === 0xffffffff) {
          let eief64Buffer = null
          for (let i = 0; i < entry.extraFields.length; i++) {
            const extraField = entry.extraFields[i]
            if (extraField.id === 0x0001) {
              eief64Buffer = extraField.data
              break
            }
          }
          if (eief64Buffer == null) {
            return emitErrorAndAutoClose(self, new Error('expected zip64 extended information extra field'))
          }
          let index = 0
          if (entry.uncompressedSize === 0xffffffff) {
            if (index + 8 > eief64Buffer.length) {
              return emitErrorAndAutoClose(self, new Error('zip64 extended information extra field does not include uncompressed size'))
            }
            entry.uncompressedSize = readUInt64LE(eief64Buffer, index)
          }
          if (entry.compressedSize === 0xffffffff) {
            if (index + 8 > eief64Buffer.length) {
              return emitErrorAndAutoClose(self, new Error('zip64 extended information extra field does not include compressed size'))
            }
            entry.compressedSize = readUInt64LE(eief64Buffer, index)
            index += 8
          }
          if (entry.relativeOffsetOfLocalHeader === 0xffffffff) {
            if (index + 8 > eief64Buffer.length) {
              return emitErrorAndAutoClose(self, new Error('zip64 extended information extra field does not include relative header offset'))
            }
            entry.relativeOffsetOfLocalHeader = readUInt64LE(eief64Buffer, index)
          }
        }

        if (self.decodeStrings) {
          for (let i = 0; i < entry.extraFields.length; i++) {
            const extraField = entry.extraFields[i]
            if (extraField.id === 0x7075) {
              if (extraField.data.length < 6) {
                continue
              }
              if (extraField.data.readUInt8(0) !== 1) {
                continue
              }
              const oldNameCrc32 = extraField.data.readUInt32LE(1)
              if ((new Crc32(buffer.slice(0, entry.fileNameLength))).unsigned !== oldNameCrc32) {
                continue
              }
              entry.fileName = decodeBuffer(extraField.data, 5, extraField.data.length, true)
              break
            }
          }
        }

        if (self.validateEntrySizes && entry.compressionMethod === 0) {
          let expectedCompressedSize = entry.uncompressedSize
          if (entry.isEncrypted()) {
            expectedCompressedSize += 12
          }
          if (entry.compressedSize !== expectedCompressedSize) {
            const msg = 'compressed/uncompressed size mismatch for stored file: ' + entry.compressedSize + ' != ' + entry.uncompressedSize
            return emitErrorAndAutoClose(self, new Error(msg))
          }
        }

        if (self.decodeStrings) {
          if (!self.strictFileNames) {
            entry.fileName = entry.fileName.replace(/\\/g, '/')
          }
          const errorMessage = validateFileName(entry.fileName)
          if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage))
        }
        self.emit('entry', entry)

        if (!self.lazyEntries) self._readEntry()
      })
    })
  }

  openReadStream (entry, options, callback) {
    const self = this
    let relativeStart = 0
    let relativeEnd = entry.compressedSize
    if (callback == null) {
      callback = options
      options = {}
    } else {
      if (options.decrypt != null) {
        if (!entry.isEncrypted()) {
          throw new Error('options.decrypt can only be specified for encrypted entries')
        }
        if (options.decrypt !== false) throw new Error('invalid options.decrypt value: ' + options.decrypt)
        if (entry.isCompressed()) {
          if (options.decompress !== false) throw new Error('entry is encrypted and compressed, and options.decompress !== false')
        }
      }
      if (options.decompress != null) {
        if (!entry.isCompressed()) {
          throw new Error('options.decompress can only be specified for compressed entries')
        }
        if (!(options.decompress === false || options.decompress === true)) {
          throw new Error('invalid options.decompress value: ' + options.decompress)
        }
      }
      if (options.start != null || options.end != null) {
        if (entry.isCompressed() && options.decompress !== false) {
          throw new Error('start/end range not allowed for compressed entry without options.decompress === false')
        }
        if (entry.isEncrypted() && options.decrypt !== false) {
          throw new Error('start/end range not allowed for encrypted entry without options.decrypt === false')
        }
      }
      if (options.start != null) {
        relativeStart = options.start
        if (relativeStart < 0) throw new Error('options.start < 0')
        if (relativeStart > entry.compressedSize) throw new Error('options.start > entry.compressedSize')
      }
      if (options.end != null) {
        relativeEnd = options.end
        if (relativeEnd < 0) throw new Error('options.end < 0')
        if (relativeEnd > entry.compressedSize) throw new Error('options.end > entry.compressedSize')
        if (relativeEnd < relativeStart) throw new Error('options.end < options.start')
      }
    }
    if (!self.isOpen) return callback(new Error('closed'))
    if (entry.isEncrypted()) {
      if (options.decrypt !== false) return callback(new Error('entry is encrypted, and options.decrypt !== false'))
    }
    self.reader.ref()
    const buffer = Buffer.alloc(30)
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, (err) => {
      try {
        if (err) return callback(err)
        const signature = buffer.readUInt32LE(0)
        if (signature !== 0x04034b50) {
          return callback(new Error('invalid local file header signature: 0x' + signature.toString(16)))
        }
        const fileNameLength = buffer.readUInt16LE(26)
        const extraFieldLength = buffer.readUInt16LE(28)
        const localFileHeaderEnd = entry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength
        let decompress
        if (entry.compressionMethod === 0) {
          decompress = false
        } else if (entry.compressionMethod === 8) {
          decompress = options.decompress != null ? options.decompress : true
        } else {
          return callback(new Error('unsupported compression method: ' + entry.compressionMethod))
        }
        const fileDataStart = localFileHeaderEnd
        const fileDataEnd = fileDataStart + entry.compressedSize
        if (entry.compressedSize !== 0) {
          if (fileDataEnd > self.fileSize) {
            return callback(new Error('file data overflows file bounds: ' +
                fileDataStart + ' + ' + entry.compressedSize + ' > ' + self.fileSize))
          }
        }
        const readStream = self.reader.createReadStream({
          start: fileDataStart + relativeStart,
          end: fileDataStart + relativeEnd
        })
        let endpointStream = readStream
        if (decompress) {
          let destroyed = false
          const inflateFilter = fs.zlib.createInflateRaw()
          readStream.on('error', (err) => {
            setImmediate(() => {
              if (!destroyed) inflateFilter.emit('error', err)
            })
          })
          readStream.pipe(inflateFilter)

          if (self.validateEntrySizes) {
            endpointStream = new AssertByteCountStream(entry.uncompressedSize)
            inflateFilter.on('error', (err) => {
              setImmediate(() => {
                if (!destroyed) endpointStream.emit('error', err)
              })
            })
            inflateFilter.pipe(endpointStream)
          } else {
            endpointStream = inflateFilter
          }
          endpointStream.destroy = () => {
            destroyed = true
            if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream)
            readStream.unpipe(inflateFilter)
            // TODO: the inflateFilter may cause a memory leak. see Issue #27.
            readStream.destroy()
          }
        }
        callback(null, endpointStream)
      } finally {
        self.reader.unref()
      }
    })
  }
}

const dosDateTimeToDate = (date, time) => {
  const day = date & 0x1f // 1-31
  const month = (date >> 5 & 0xf) - 1 // 1-12, 0-11
  const year = (date >> 9 & 0x7f) + 1980 // 0-128, 1980-2108

  const millisecond = 0
  const second = (time & 0x1f) * 2 // 0-29, 0-58 (even numbers)
  const minute = time >> 5 & 0x3f // 0-59
  const hour = time >> 11 & 0x1f // 0-23

  return new Date(year, month, day, hour, minute, second, millisecond)
}

class Entry {
  getLastModDate () {
    return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime)
  }

  isEncrypted () {
    return (this.generalPurposeBitFlag & 0x1) !== 0
  }

  isCompressed () {
    return this.compressionMethod === 8
  }
}

class AssertByteCountStream extends Transform {
  constructor (byteCount) {
    super()
    this.actualByteCount = 0
    this.expectedByteCount = byteCount
  }

  _transform (chunk, encoding, cb) {
    this.actualByteCount += chunk.length
    if (this.actualByteCount > this.expectedByteCount) {
      const msg = 'too many bytes in the stream.' +
        ` expected ${this.expectedByteCount}.` +
        ` got at least ${this.actualByteCount}`
      return cb(new Error(msg))
    }
    cb(null, chunk)
  }

  _flush (cb) {
    if (this.actualByteCount < this.expectedByteCount) {
      const msg = 'not enough bytes in the stream.' +
        ` expected ${this.expectedByteCount}.` +
        ` got only ${this.actualByteCount}`
      return cb(new Error(msg))
    }
    cb()
  }
}

class RandomAccessReader extends EventEmitter {
  constructor () {
    super()
    this.refCount = 0
  }

  ref () {
    this.refCount += 1
  }

  unref () {
    const self = this
    const onCloseDone = (err) => {
      if (err) return self.emit('error', err)
      self.emit('close')
    }

    self.refCount -= 1

    if (self.refCount > 0) return
    if (self.refCount < 0) throw new Error('invalid unref')

    self.close(onCloseDone)
  }

  createReadStream (options) {
    const start = options.start
    const end = options.end
    if (start === end) {
      const emptyStream = new PassThrough()
      setImmediate(() => {
        emptyStream.end()
      })
      return emptyStream
    }
    const stream = this._readStreamForRange(start, end)

    let destroyed = false
    const refUnrefFilter = new RefUnrefFilter(this)
    stream.on('error', (err) => {
      setImmediate(() => {
        if (!destroyed) refUnrefFilter.emit('error', err)
      })
    })
    refUnrefFilter.destroy = () => {
      stream.unpipe(refUnrefFilter)
      refUnrefFilter.unref()
      stream.destroy()
    }

    const byteCounter = new AssertByteCountStream(end - start)
    refUnrefFilter.on('error', (err) => {
      setImmediate(() => {
        if (!destroyed) byteCounter.emit('error', err)
      })
    })
    byteCounter.destroy = () => {
      destroyed = true
      refUnrefFilter.unpipe(byteCounter)
      refUnrefFilter.destroy()
    }

    return stream.pipe(refUnrefFilter).pipe(byteCounter)
  }

  _readStreamForRange (start, end) {
    throw new Error('not implemented')
  }

  read (buffer, offset, length, position, callback) {
    const readStream = this.createReadStream({ start: position, end: position + length })
    const writeStream = new Writable()
    let written = 0
    writeStream._write = (chunk, encoding, cb) => {
      chunk.copy(buffer, offset + written, 0, chunk.length)
      written += chunk.length
      cb()
    }
    writeStream.on('finish', callback)
    readStream.on('error', (err) => {
      callback(err)
    })
    readStream.pipe(writeStream)
  }

  close (callback) {
    setImmediate(callback)
  }
}

class RefUnrefFilter extends PassThrough {
  constructor (context) {
    super()
    this.context = context
    this.context.ref()
    this.unreffedYet = false
  }

  _flush (cb) {
    this.unref()
    cb()
  }

  unref () {
    if (this.unreffedYet) return
    this.unreffedYet = true
    this.context.unref()
  }
}

class FdSlicer extends EventEmitter {
  constructor (fd, options) {
    super()
    options = options || {}

    this.fd = fd
    this.pend = new Pend()
    this.pend.max = 1
    this.refCount = 0
    this.autoClose = !!options.autoClose
  }

  read (buffer, offset, length, position, callback) {
    const self = this
    self.pend.go(async (cb) => {
      let result = { bytesRead: 0, buffer: Buffer.alloc(0) }
      let error
      try {
        result = await self.fd.read(buffer, offset, length, position)
      } catch (err) {
        error = err
      }
      cb()
      callback(error, result.bytesRead, result.buffer)
    })
  }

  write (buffer, offset, length, position, callback) {
    const self = this
    self.pend.go(async (cb) => {
      let result = { bytesWritten: 0, buffer: Buffer.alloc(0) }
      let error
      try {
        result = await self.fd.write(buffer, offset, length, position)
      } catch (err) {
        error = err
      }
      cb()
      callback(error, result.bytesWritten, result.buffer)
    })
  }

  createReadStream (options) {
    return new ReadStream(this, options)
  }

  createWriteStream (options) {
    return new WriteStream(this, options)
  }

  ref () {
    this.refCount += 1
  }

  async unref () {
    const self = this
    self.refCount -= 1

    if (self.refCount > 0) return
    if (self.refCount < 0) throw new Error('invalid unref')

    if (self.autoClose) {
      try {
        await self.fd.close()
      } catch (err) {
        if (err) {
          self.emit('error', err)
          return
        }
      }
      self.emit('close')
    }
  }
}

class BufferSlicer extends EventEmitter {
  constructor (buffer, options) {
    super()

    options = options || {}
    this.refCount = 0
    this.buffer = buffer
    this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER
  }

  read (buffer, offset, length, position, callback) {
    const end = position + length
    const delta = end - this.buffer.length
    const written = (delta > 0) ? delta : length
    this.buffer.copy(buffer, offset, position, end)
    setImmediate(() => {
      callback(null, written)
    })
  }

  write (buffer, offset, length, position, callback) {
    buffer.copy(this.buffer, position, offset, offset + length)
    setImmediate(() => {
      callback(null, length, buffer)
    })
  }

  createReadStream (options) {
    options = options || {}
    const readStream = new PassThrough(options)
    readStream.destroyed = false
    readStream.start = options.start || 0
    readStream.endOffset = options.end
    readStream.pos = readStream.endOffset || this.buffer.length

    const entireSlice = this.buffer.slice(readStream.start, readStream.pos)
    let offset = 0
    while (true) {
      const nextOffset = offset + this.maxChunkSize
      if (nextOffset >= entireSlice.length) {
        if (offset < entireSlice.length) {
          readStream.write(entireSlice.slice(offset, entireSlice.length))
        }
        break
      }
      readStream.write(entireSlice.slice(offset, nextOffset))
      offset = nextOffset
    }

    readStream.end()
    readStream.destroy = () => {
      readStream.destroyed = true
    }
    return readStream
  }

  createWriteStream (options) {
    const bufferSlicer = this
    options = options || {}
    const writeStream = new Writable(options)
    writeStream.start = options.start || 0
    writeStream.endOffset = (options.end == null) ? this.buffer.length : +options.end
    writeStream.bytesWritten = 0
    writeStream.pos = writeStream.start
    writeStream.destroyed = false
    writeStream._write = (buffer, encoding, callback) => {
      if (writeStream.destroyed) return

      const end = writeStream.pos + buffer.length
      if (end > writeStream.endOffset) {
        const err = new Error('maximum file length exceeded')
        err.code = 'ETOOBIG'
        writeStream.destroyed = true
        callback(err)
        return
      }
      buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length)

      writeStream.bytesWritten += buffer.length
      writeStream.pos = end
      writeStream.emit('progress')
      callback()
    }
    writeStream.destroy = () => {
      writeStream.destroyed = true
    }
    return writeStream
  }

  ref () {
    this.refCount += 1
  }

  unref () {
    this.refCount -= 1

    if (this.refCount < 0) {
      throw new Error('invalid unref')
    }
  }
}

class Pend {
  constructor () {
    this.pending = 0
    this.max = Infinity
    this.listeners = []
    this.waiting = []
    this.error = null
  }

  go (fn) {
    if (this.pending < this.max) {
      this._pendGo(fn)
    } else {
      this.waiting.push(fn)
    }
  }

  wait (cb) {
    if (this.pending === 0) {
      cb(this.error)
    } else {
      this.listeners.push(cb)
    }
  }

  hold () {
    return this._pendHold()
  }

  _pendHold () {
    this.pending += 1
    let called = false
    return (err) => {
      if (called) throw new Error('callback called twice')
      called = true
      this.error = this.error || err
      this.pending -= 1
      if (this.waiting.length > 0 && this.pending < this.max) {
        this._pendGo(this, this.waiting.shift())
      } else if (this.pending === 0) {
        const listeners = this.listeners
        this.listeners = []
        listeners.forEach((listener) => listener(this.error))
      }
    }
  }

  _pendGo (fn) {
    fn(this._pendHold(this))
  }
}

class ReadStream extends Readable {
  constructor (context, options) {
    super()
    options = options || {}

    this.context = context
    this.context.ref()

    this.start = options.start || 0
    this.endOffset = options.end
    this.pos = this.start
    this.destroyed = false
  }

  _read (n) {
    const self = this
    if (self.destroyed) return

    let toRead = Math.min(self.readableHighWaterMark, n)
    if (self.endOffset != null) {
      toRead = Math.min(toRead, self.endOffset - self.pos)
    }
    if (toRead <= 0) {
      self.destroyed = true
      self.push(null)
      self.context.unref()
      return
    }
    self.context.pend.go(async (cb) => {
      if (self.destroyed) return cb()
      const buffer = Buffer.alloc(toRead)
      let result = { bytesRead: 0, buffer: Buffer.alloc(0) }
      let error
      try {
        result = await self.context.fd.read(buffer, 0, toRead, self.pos)
      } catch (err) {
        error = err
      }
      if (error) {
        self.destroy(error)
      } else if (result.bytesRead === 0) {
        self.destroyed = true
        self.push(null)
        self.context.unref()
      } else {
        self.pos += result.bytesRead
        self.push(buffer.slice(0, result.bytesRead))
      }
      cb()
    })
  }

  destroy (err) {
    if (this.destroyed) return
    err = err || new Error('stream destroyed')
    this.destroyed = true
    this.emit('error', err)
    this.context.unref()
  }
}

class WriteStream extends Writable {
  constructor (context, options) {
    super()
    options = options || {}

    this.context = context
    this.context.ref()

    this.start = options.start || 0
    this.endOffset = (options.end == null) ? Infinity : +options.end
    this.bytesWritten = 0
    this.pos = this.start
    this.destroyed = false

    this.on('finish', this.destroy.bind(this))
  }

  _write (buffer, encoding, callback) {
    const self = this
    if (self.destroyed) return

    if (self.pos + buffer.length > self.endOffset) {
      const err = new Error('maximum file length exceeded')
      err.code = 'ETOOBIG'
      self.destroy()
      callback(err)
      return
    }
    self.context.pend.go(async (cb) => {
      if (self.destroyed) return cb()
      let result = { bytesRead: 0, buffer: Buffer.alloc(0) }
      let error
      try {
        result = await self.context.fd.write(buffer, 0, buffer.length, self.pos)
      } catch (err) {
        error = err
      }
      if (error) {
        self.destroy()
        cb()
        callback(error)
      } else {
        self.bytesWritten += result.bytesRead
        self.pos += result.bytesRead
        self.emit('progress')
        cb()
        callback()
      }
    })
  }

  destroy (error) {
    if (error) return
    if (this.destroyed) return
    this.destroyed = true
    this.context.unref()
  }
}

class Crc32 {
  constructor (buf, previous) {
    if (!Buffer.isBuffer(buf)) {
      const inputType = typeof buf
      switch (inputType) {
        case 'number':
          buf = Buffer.alloc(buf)
          break
        case 'string':
          buf = Buffer.from(buf)
          break
        default:
          throw new Error(
          `input must be buffer, number, or string, received ${inputType}`
          )
      }
    }
    if (Buffer.isBuffer(previous)) {
      previous = previous.readUInt32BE(0)
    }
    const CRC_TABLE = new Int32Array([
      0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419,
      0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4,
      0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07,
      0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
      0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856,
      0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
      0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4,
      0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
      0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3,
      0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a,
      0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599,
      0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
      0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190,
      0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f,
      0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e,
      0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
      0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed,
      0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
      0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3,
      0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
      0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a,
      0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5,
      0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010,
      0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
      0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17,
      0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6,
      0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615,
      0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
      0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344,
      0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
      0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a,
      0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
      0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1,
      0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c,
      0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef,
      0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
      0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe,
      0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31,
      0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c,
      0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
      0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b,
      0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
      0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1,
      0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
      0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278,
      0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7,
      0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66,
      0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
      0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605,
      0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8,
      0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b,
      0x2d02ef8d
    ])
    let crc = ~~previous ^ -1
    for (let n = 0; n < buf.length; n++) {
      crc = CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8)
    }
    this.value = (crc ^ -1)
  }

  get buffer () {
    const tmp = Buffer.alloc(4)
    tmp.writeInt32BE(this.value, 0)
    return tmp
  }

  get signed () {
    return this.value
  }

  get unsigned () {
    return this.value >>> 0
  }
}

exports.Unzip = Unzip
