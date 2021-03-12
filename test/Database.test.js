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
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Database = require('../lib/Database')
runner.suite('Database', (it) => {
  const db = new Database()
  class SequelizeDb extends Database.DatabaseEngine {
    connect () {
      return new Promise((resolve, reject) => {
        reject(new Error('ECONNREFUSED'))
      })
    }
  }
  it('should construct', () => {
    Assert.isType('Database', new Database())
  })
  it('should accept a new database', () => {
    Assert.isType('SequelizeDb', db.addEngine('sequelize', new SequelizeDb())
    )
  })
  it('should have the new database instance', () => {
    Assert.isType('SequelizeDb', db.getEngine('sequelize'))
  })
  it('should remove database instance', () => {
    Assert.eq(db.removeEngine('sequelize'), true)
  })
  it('should no longer have the database handle', () => {
    Assert.eq(db.getEngine('sequelize'), false)
  })
  it('should accept a new database instance', () => {
    Assert.isType('SequelizeDb', db.addEngine(
      'sequelize',
      new SequelizeDb()
    ))
  })
  it('should attempt db connect and fail', () => {
    return db.connect('sequelize')
      .then(() => {
        throw new Error('should not have connected')
      })
      .catch((e) => {
        if (e.message.match(/access/i)) {
          Assert.match(/Access denied for user/, e.message)
        } else {
          Assert.match(/ECONNREFUSED/, e.message)
        }
      })
  })
  it('should have a MySQL engine', () => {
    Assert.isType('Function', Database.DatabaseMySQL)
    Assert.isType('Function', Database.MySQL)
    const rv = new Database.MySQL({ database: 'test' })
    Assert.isType('DatabaseMySQL', rv)
    Assert.isType('AsyncFunction', rv.start)
    Assert.isType('Function', rv.stop)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
