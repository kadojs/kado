/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
