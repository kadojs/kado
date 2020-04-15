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
const crypto = require('crypto')
const Model = require('./Model')
const Query = require('./Query')
const Schema = require('./Schema')
class QueryCacheModel extends Model {
  static fieldList () {
    return {
      id: {
        type: 'INT',
        length: '11',
        nullable: false,
        signed: false,
        autoIncrement: true
      },
      key: {},
      value: { type: 'LONGTEXT' },
      ttl: { type: 'INT', length: '11', signed: false, nullable: false },
      createdAt: { type: 'datetime', nullable: false, writable: false },
      updatedAt: { type: 'datetime', nullable: false }
    }
  }

  static createTable () {
    const table = Schema.SQL.create(Query.QueryCacheTableName)
    const fields = QueryCacheModel.fieldList()
    for (const name in fields) {
      if (!Object.prototype.hasOwnProperty.call(fields, name)) continue
      table.field(name, fields[name])
    }
    table.primary('id')
    table.index('key_unique', ['key'], { unique: true })
    table.index('ttl_index', ['ttl'])
    table.index('createdAt_index', ['createdAt'])
    table.index('updatedAt_index', ['updatedAt'])
    return table
  }

  static insert (fields) {
    if (fields === null) {
      fields = Model.filterFields(QueryCacheModel.fieldList(), {
        insert: false
      })
    }
    return Model.insertQuery(Query.QueryCacheTableName, fields)
  }

  static byId (id) {
    return Model.byIdQuery(Query.QueryCacheTableName, id)
  }

  static byKey (key) {
    return Model.byIdQuery(Query.QueryCacheTableName, key, null, 'key')
  }

  static pruneCache (boundary) {
    const query = Model.deleteQuery(Query.QueryCacheTableName)
    query.where('updatedAt', '<=', '?')
    query.value(new Date(boundary))
    return query
  }

  static flushCache () {
    return Model.deleteQuery(Query.QueryCacheTableName)
  }
}
class QueryCache {
  static generateKey (sql = '', values = [], options = {}) {
    const sha = crypto.createHash('sha1')
    sha.update(`${sql}${JSON.stringify(values)}${JSON.stringify(options)}`)
    return sha.digest('hex')
  }

  static getInstance (options) { return new QueryCache(options) }
  constructor (options = {}) {
    this.db = options.db
    if (!this.db) throw new Error('Database connection required for QueryCache')
    this.model = options.model
    if (!this.model) throw new Error('Model required for QueryCache')
    this.defaultTTL = options.defaultTTL || 60000 // in milliseconds
    this.minimumTTL = options.minimumTTL || 60000 // in milliseconds
  }

  getModel () { return this.model }

  async read (key) {
    const query = this.model.byKey(key)
    const rv = await query.execute(this.db.getEngine())
    const row = rv[0] && rv[0][0] ? rv[0][0] : { value: '{}' }
    return JSON.parse(row.value.match(/^{/) ? row.value : '{}')
  }

  async write (key, value, ttl) {
    if (value instanceof Object) value = JSON.stringify(value)
    const now = new Date()
    const query = this.model.insert(
      ['key', 'value', 'ttl', 'createdAt', 'updatedAt']
    )
    query.value([key, value, ttl, now, now])
    const rv = await query.execute(this.db.getEngine())
    const row = rv[0] && rv[0][0] ? rv[0][0] : { value: '{}' }
    return JSON.parse(row.value.match(/^{/) ? row.value : '{}')
  }

  async execute (sql, values, options = {}) {
    const db = this.db.getEngine()
    const key = QueryCache.generateKey(sql, values, options)
    let rv = await this.read(key)
    if (rv) return rv
    rv = await db.execute(sql, values, options)
    await this.write(key, rv)
    return rv
  }

  async prune () {
    const now = new Date()
    const boundary = new Date(now - this.minimumTTL)
    const query = this.model.pruneCache(boundary)
    return query.execute(this.db.getEngine())
  }

  flush () {
    const query = this.model.flushCache()
    return query.execute(this.db.getEngine())
  }
}
QueryCache.QueryCacheTableName = 'QueryCache'
QueryCache.QueryCache = QueryCache
QueryCache.QueryCacheModel = QueryCacheModel
module.exports = QueryCache
