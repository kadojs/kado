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
const Connect = require('./Connect')
const ConnectEngine = Connect.ConnectEngine
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
    return Database.queryOptions(profiler)
  }

  connect (name, options) {
    return Connect.each(this, name, options, 'connect')
  }

  close (name) {
    return Connect.each(this, name, null, 'close')
  }
}

// const _IANAzoneUTC = 'Etc/GMT0'
// conform to newer server standards for working with timezones
const _IANAzoneUTC = '+00:00'
const _setConnectionUTC = async (conn) => {
  await conn.query('SET time_zone=\'+00:00\';', (error) => {
    if (error) {
      throw error
    }
  })
}

class DatabaseMySQL extends DatabaseEngine {
  constructor (options = {}) {
    super()
    Assert.isType('Object', options)
    if (!options.host) options.host = 'localhost'
    if (!options.port) options.port = null
    if (!options.user) options.user = 'root'
    if (!options.driver) options.driver = 'mysql2'
    Assert.isType('string', options.user)
    Assert.isType('string', options.database)
    this.options = options
  }

  async connectMariaDB () {
    try { require.resolve('mariadb') } catch (e) {
      if (e instanceof Error) {
        throw new Error('MariaDB Engine requires the NPM mariadb package')
      }
    }
    const db = await require('mariadb').createPool({
      timezone: _IANAzoneUTC,
      host: this.options.host,
      user: this.options.user,
      password: this.options.password,
      database: this.options.database
    })
    db.on('connection', _setConnectionUTC)
    db.execute = async (sql, values, options) => {
      const rv = await db.query(sql, values, options)
      const result = [rv, rv.meta]
      delete result[0].meta
      return result
    }
    this.setEngine(db)
  }

  async connectMySQL2 () {
    try { require.resolve('mysql2/promise') } catch (e) {
      if (e instanceof Error) {
        throw new Error('MySQL Engine requires the NPM mysql2 package')
      }
    }
    const db = await require('mysql2/promise').createConnection({
      timezone: _IANAzoneUTC,
      host: this.options.host,
      user: this.options.user,
      password: this.options.password,
      database: this.options.database
    })
    db.on('connection', _setConnectionUTC)
    this.setEngine(db)
  }

  async start () {
    if (this.options.driver === 'mariadb') {
      return this.connectMariaDB()
    } else if (this.options.driver === 'mysql2') {
      return this.connectMySQL2()
    } else {
      throw new Error('Please set a supported MySQL driver (mariadb|mysql2)')
    }
  }

  stop () {
    return this.getEngine().end()
  }
}
Database.DatabaseEngine = DatabaseEngine
Database.DatabaseMySQL = DatabaseMySQL
Database.MySQL = DatabaseMySQL
module.exports = Database
