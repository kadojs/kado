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
const dgram = require('dgram')
const Connect = require('./Connect')
const fs = require('./FileSystem')
const Stream = require('./Stream')
class Log extends Connect {
  static getInstance (options) { return new Log(options) }

  message (level, msg, opts) {
    this.listEngines().forEach((name) => {
      this.engine[name].message(level, msg, opts)
    })
  }

  error (msg = '', opts = {}) { this.message(Log.levels[0], msg, opts) }
  warning (msg = '', opts = {}) { this.message(Log.levels[1], msg, opts) }
  info (msg = '', opts = {}) { this.message(Log.levels[2], msg, opts) }
  verbose (msg = '', opts = {}) { this.message(Log.levels[3], msg, opts) }
  debug (msg = '', opts = {}) { this.message(Log.levels[4], msg, opts) }
  extra (msg = '', opts = {}) { this.message(Log.levels[5], msg, opts) }
  dump (msg) { this.message(Log.levels[3], msg, { wrap: false }) }

  start () {}
  stop () {}
}
class LogEngine extends Stream.Readable {
  static appendFile (path, data) {
    fs.appendFileSync(path, data)
    return data
  }

  static tailFile (path, lineCount = 20, options = {}) {
    let log = ''
    if (fs.exists(path)) {
      const fd = new FileByLine(path, options)
      let line; const lines = []
      while ((line = fd.next())) lines.push(line)
      let start = lines.length - lineCount
      if (start < 0) start = 0
      log = lines.splice(start, lines.length - 1).join('\n')
    }
    return log
  }

  static getInstance (options) { return new LogEngine(options) }

  static zlPad (str, length = 2) {
    if (typeof str === 'number') str = `${str}`
    while (str.length < length) str = `0${str}`
    return str
  }

  constructor (options = {}) {
    if (options === null) options = {}
    super(options)
    this.dateFormat = options.dateFormat
    this.encoding = options.encoding || 'utf-8'
    this.name = (options.name || 'Kado').toUpperCase()
    this.toConsole = true
    if (options.toConsole !== undefined) this.toConsole = options.toConsole
    if (this.toConsole === true) this.pipe(process.stdout)
  }

  // keep the stream open, even though we write to the consumer when we want
  _read () { this.push('') }

  formatDate (now) {
    if (typeof this.dateFormat === 'function') return this.dateFormat(now)
    const year = now.getFullYear()
    const month = LogEngine.zlPad(now.getMonth() + 1)
    const day = LogEngine.zlPad(now.getDay() + 1)
    const hour = LogEngine.zlPad(now.getHours())
    const minute = LogEngine.zlPad(now.getMinutes())
    const second = LogEngine.zlPad(now.getSeconds())
    const ms = LogEngine.zlPad(now.getMilliseconds(), 4)
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`
  }

  message (level = Log.levels[2], msg = '', opts = {}) {
    const now = new Date()
    const date = this.formatDate(now)
    let chunk = Buffer.from(
      `[${date} ${this.name}-${level.title}] ${msg}\n`
    )
    if (opts.wrap === false) chunk = msg
    this.push(chunk)
  }

  error (msg = '', opts = {}) { this.message(Log.levels[0], msg, opts) }
  warning (msg = '', opts = {}) { this.message(Log.levels[1], msg, opts) }
  info (msg = '', opts = {}) { this.message(Log.levels[2], msg, opts) }
  verbose (msg = '', opts = {}) { this.message(Log.levels[3], msg, opts) }
  debug (msg = '', opts = {}) { this.message(Log.levels[4], msg, opts) }
  extra (msg = '', opts = {}) { this.message(Log.levels[5], msg, opts) }
  dump (msg) { this.message(Log.levels[3], msg, { wrap: false }) }
}
class LogRelayUDP extends Stream.Writable {
  constructor (options = {}) {
    super(options)
    this.host = options.host || 'localhost'
    this.port = options.port || '5514'
    this.client = dgram.createSocket(options.protocol || 'udp4')
  }

  _write (chunk, encoding, done) {
    this.client.send(chunk, this.port, this.host, (err) => {
      if (err) return this.handleError(err)
    })
    done()
  }

  handleError (err) {
    console.log('LogRelayUDP Error', err)
  }
}
class FileByLine {
  constructor (file, options = {}) {
    options = options || {}
    if (!options.readChunk) options.readChunk = 1024
    if (!options.newLineCharacter) {
      options.newLineCharacter = 0x0a // linux line ending
    } else {
      options.newLineCharacter = options.newLineCharacter.charCodeAt(0)
    }
    if (typeof file === 'number') {
      this.fd = file
    } else {
      this.fd = fs.openSync(file, 'r')
    }
    this.options = options
    this.newLineCharacter = options.newLineCharacter
    this.reset()
  }

  _searchInBuffer (buffer, hexNeedle) {
    let found = -1
    for (let i = 0; i <= buffer.length; i++) {
      const bByte = buffer[i]
      if (bByte === hexNeedle) {
        found = i
        break
      }
    }
    return found
  }

  reset () {
    this.eofReached = false
    this.linesCache = []
    this.fdPosition = 0
  }

  close () {
    fs.closeSync(this.fd)
    this.fd = null
  }

  _extractLines (buffer) {
    let line
    const lines = []
    let bufferPosition = 0
    let lastNewLineBufferPosition = 0
    while (true) {
      const bufferPositionValue = buffer[bufferPosition++]
      if (bufferPositionValue === this.newLineCharacter) {
        line = buffer.slice(lastNewLineBufferPosition, bufferPosition)
        lines.push(line)
        lastNewLineBufferPosition = bufferPosition
      } else if (bufferPositionValue === undefined) {
        break
      }
    }
    const leftovers = buffer.slice(lastNewLineBufferPosition, bufferPosition)
    if (leftovers.length) {
      lines.push(leftovers)
    }
    return lines
  }

  _readChunk (lineLeftovers) {
    let totalBytesRead = 0
    let bytesRead
    const buffers = []
    do {
      const readBuffer = Buffer.alloc(this.options.readChunk)
      bytesRead = fs.readSync(
        this.fd, readBuffer, 0, this.options.readChunk, this.fdPosition)
      totalBytesRead = totalBytesRead + bytesRead
      this.fdPosition = this.fdPosition + bytesRead
      buffers.push(readBuffer)
    } while (
      bytesRead &&
      this._searchInBuffer(
        buffers[buffers.length - 1], this.options.newLineCharacter
      ) === -1
    )
    let bufferData = Buffer.concat(buffers)
    if (bytesRead < this.options.readChunk) {
      this.eofReached = true
      bufferData = bufferData.slice(0, totalBytesRead)
    }
    if (totalBytesRead) {
      this.linesCache = this._extractLines(bufferData)
      if (lineLeftovers) {
        this.linesCache[0] = Buffer.concat([lineLeftovers, this.linesCache[0]])
      }
    }
    return totalBytesRead
  }

  next () {
    if (!this.fd) return false
    let line = false
    if (this.eofReached && this.linesCache.length === 0) {
      return line
    }
    let bytesRead
    if (!this.linesCache.length) {
      bytesRead = this._readChunk()
    }
    if (this.linesCache.length) {
      line = this.linesCache.shift()
      const lastLineCharacter = line[line.length - 1]
      if (lastLineCharacter !== this.newLineCharacter) {
        bytesRead = this._readChunk(line)
        if (bytesRead) {
          line = this.linesCache.shift()
        }
      }
    }
    if (this.eofReached && this.linesCache.length === 0) {
      this.close()
    }
    if (line && line[line.length - 1] === this.newLineCharacter) {
      line = line.slice(0, line.length - 1)
    }
    return line
  }
}
Log.levels = {
  0: { name: 'error', title: 'ERROR', error: true },
  1: { name: 'warning', title: 'WARNING', warning: true },
  2: { name: 'info', title: 'INFO', info: true },
  3: { name: 'verbose', title: 'VERBOSE', verbose: true },
  4: { name: 'debug', title: 'DEBUG', debug: true },
  5: { name: 'extra', title: 'EXTRA', extra: true }
}
Log.LogEngine = LogEngine
Log.LogRelayUDP = LogRelayUDP
module.exports = Log
