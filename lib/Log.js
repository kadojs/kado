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
const Connect = require('./Connect')
const fs = require('./FileSystem')
const Stream = require('./Stream')
class Log extends Connect {
  static getInstance (options) { return new Log(options) }

  start () {}
  stop () {}
}
class LogEngine extends Stream.Readable {
  static appendFile (path, data) {
    fs.appendFileSync(path, data)
    return data
  }

  static tailFile (path, lineCount = 20) {
    try {
      require.resolve('n-readlines')
    } catch (e) {
      throw new Error('Missing the n-readlines package for tailing, ' +
        'try npm install n-readlines --save')
    }
    const LineByLine = require('n-readlines')
    let log = ''
    if (fs.exists(path)) {
      const fd = new LineByLine(path)
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
    this.buffer = ''
    console.log(options)
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
    const month = Log.zlPad(now.getMonth() + 1)
    const day = Log.zlPad(now.getDay() + 1)
    const hour = Log.zlPad(now.getHours())
    const minute = Log.zlPad(now.getMinutes())
    const second = Log.zlPad(now.getSeconds())
    const ms = Log.zlPad(now.getMilliseconds(), 4)
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`
  }

  message (level = Log.levels[2], msg = '', opts = {}) {
    const now = new Date()
    const date = this.formatDate(now)
    let chunk = Buffer.from(
      `[${date} ${this.name}-${level.title}] ${msg}\n`
    )
    if (opts.wrap === false) chunk = msg
    this.buffer += chunk
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
Log.levels = {
  0: { name: 'error', title: 'ERROR', error: true },
  1: { name: 'warning', title: 'WARNING', warning: true },
  2: { name: 'info', title: 'INFO', info: true },
  3: { name: 'verbose', title: 'VERBOSE', verbose: true },
  4: { name: 'debug', title: 'DEBUG', debug: true },
  5: { name: 'extra', title: 'EXTRA', extra: true }
}
Log.LogEngine = LogEngine
module.exports = Log
