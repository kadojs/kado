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
class DatabaseEngine extends ConnectEngine {
  connect () {
    this.checkEngine()
    throw new Error('DatabaseEngine.connect() must be extended')
  }

  close () {
    if (this.engine && typeof this.engine.close === 'function') {
      this.engine.close()
    }
    this.resetEngine()
  }
}
class Database extends Connect {
  static queryOptions (config, profiler) {
    let options
    if (config.dev === true) {
      options = {
        benchmark: true,
        logging: (sql, time) => {
          if (profiler) profiler.addQuery(sql, time)
        }
      }
    } else {
      options = {
        benchmark: false,
        logging: false
      }
    }
    return options
  }

  static getInstance () { return new Database() }
  queryOptions (profiler) {
    return Database._queryOptions(profiler)
  }

  connect (name, options) {
    return Connect.each(this, name, options, 'connect')
  }

  close (name) {
    return Connect.each(this, name, null, 'close')
  }
}
Database.DatabaseEngine = DatabaseEngine
module.exports = Database
