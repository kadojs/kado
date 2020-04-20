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
const ConnectEngine = require('./ConnectEngine')
const fs = require('./FileSystem')
class LogEngine extends ConnectEngine {

}
class Log extends Connect {
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

  static getInstance () { return new Log() }
}
Log.LogEngine = LogEngine
module.exports = Log
