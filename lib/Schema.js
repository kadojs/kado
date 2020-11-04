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
const Query = require('./Query')
class Schema extends Query { }
class SchemaSQL extends Schema {
  static create (tableName, options = {}) {
    return new SchemaSQL(tableName).createTable(options)
  }

  static alter (tableName, options = {}) {
    return new SchemaSQL(tableName).alterTable(options)
  }

  constructor (tableName) {
    super(tableName)
    this.charset = 'utf8'
    this.conditional = true
    this.engine = 'InnoDB'
    this.fields = []
    this.indexes = []
    this.foreignKeys = []
    this.primaryKey = null
    this.qfields = null
    this.qindexes = null
    this.qforeignKeys = null
    this.temporary = false
  }

  alterTable (options = {}) {
    Assert.isType('Object', options)
    if (options.charset) this.charset = options.charset
    if (options.conditional) this.conditional = options.conditional
    if (options.engine) this.engine = options.engine
    if (options.temporary) this.temporary = options.temporary
    let construct = this.temporary ? 'ALTER TEMPORARY TABLE' : 'ALTER TABLE'
    if (this.conditional) construct += ' IF EXISTS'
    this.qbase = Schema.addBase(this.table, '', construct, '')
    return this
  }

  createTable (options = {}) {
    Assert.isType('Object', options)
    if (options.charset) this.charset = options.charset
    if (options.conditional) this.conditional = options.conditional
    if (options.engine) this.engine = options.engine
    if (options.temporary) this.temporary = options.temporary
    let construct = this.temporary ? 'CREATE TEMPORARY TABLE' : 'CREATE TABLE'
    if (this.conditional) construct += ' IF NOT EXISTS'
    this.qbase = Schema.addBase(this.table, '', construct, '')
    return this
  }

  field (name, options = {}) {
    const joiner = ',\n'
    let fields
    if (!(name instanceof Array)) {
      if (typeof options === 'string') { options = { type: options } }
      fields = [{
        name: name,
        type: options.type,
        length: options.length,
        nullable: options.nullable,
        signed: options.signed,
        default: options.default,
        autoIncrement: options.autoIncrement
      }]
    } else { fields = name }
    fields.forEach((v, i) => {
      if (this.qfields && i === 0) i = 1
      if (!this.qfields) this.qfields = ''
      // establish defaults
      if (v.type === undefined) v.type = 'VARCHAR'
      if (v.length === undefined && v.type === 'VARCHAR') v.length = '255'
      if (v.signed === undefined) v.signed = null
      if (v.nullable === undefined) v.nullable = true
      if (v.default === null) v.default = 'NULL'
      if (v.autoIncrement === undefined) v.autoIncrement = false
      this.fields.push(v)
      this.qfields += `${i > 0 ? `${joiner} ` : ' '}\`${v.name}\` ` +
        `${v.type}${v.length ? `(${v.length})` : ''}` +
        `${v.signed === false ? ' UNSIGNED' : ''}` +
        `${v.nullable === true ? '' : ' NOT NULL'}` +
        `${v.default
          ? ` DEFAULT ${
          v.default === 'NULL'
            ? 'NULL'
            : `'${v.default}'`
          }`
          : ''}` +
        `${v.autoIncrement ? ' AUTO_INCREMENT' : ''}`
    })
    return this
  }

  index (name, fields, options = {}) {
    const joiner = ',\n'
    let indexes
    if (!(name instanceof Array)) {
      indexes = [{
        name: name,
        fields: fields,
        options: options
      }]
    } else { indexes = name }
    indexes.forEach((v, i) => {
      if (this.qindexes && i === 0) i = 1
      if (!this.qindexes) this.qindexes = ''
      if ((!(fields instanceof Array))) fields = []
      if ((!(options instanceof Object))) options = {}
      this.indexes.push(v)
      this.qindexes += `${i > 0 ? `${joiner} ` : ''}` +
        `${v.options.unique === true ? 'UNIQUE KEY' : 'INDEX'} ` +
        `\`${v.name}\` ` +
        `(\`${v.fields.join('`, `')}\`)`
    })
    return this
  }

  foreignKey (name, table = '', columns = [], reference = [], options = {}) {
    const joiner = ',\n'
    let keys
    if (!(name instanceof Array)) {
      keys = [{
        name: name,
        table: table,
        columns: columns,
        reference: reference,
        options: options
      }]
    } else { keys = name }
    keys.forEach((v, i) => {
      if (this.qforeignKeys && i === 0) i = 1
      if (!this.qforeignKeys) this.qforeignKeys = ''
      if (!(v.columns instanceof Array)) v.columns = []
      if (!(v.reference instanceof Array)) v.reference = []
      if (!(v.options instanceof Object)) v.options = {}
      if (v.options.onUpdate) v.onUpdate = v.options.onUpdate
      if (v.options.onDelete) v.onDelete = v.options.onDelete
      this.foreignKeys.push(v)
      this.qforeignKeys += `${i > 0 ? `${joiner} ` : ''}` +
        `FOREIGN KEY ${v.name} (\`${v.columns.join('`, `')}\`) ` +
        `REFERENCES \`${v.table}\`(\`${v.reference.join('`, `')}\`)` +
        `${v.onUpdate ? ` ON UPDATE ${v.onUpdate.toUpperCase()}` : ''}` +
        `${v.onDelete ? ` ON DELETE ${v.onUpdate.toUpperCase()}` : ''}`
    })
    return this
  }

  primary (fieldName) {
    this.primaryKey = fieldName
    return this
  }

  toArray () {
    return [this.fields, this.indexes, this.primaryKey]
  }

  toString () {
    return `${this.qbase} (\n` +
      `${this.qfields}` +
      `${this.primaryKey ? `,\n PRIMARY KEY (\`${this.primaryKey}\`)` : ''}` +
      `${this.qindexes ? `,\n ${this.qindexes}` : ''}` +
      `${this.qforeignKeys ? `,\n ${this.qforeignKeys}` : ''}` +
      `\n) ENGINE=${this.engine} DEFAULT CHARSET=${this.charset}`
  }

  log () {
    console.log(this.toString(), this.toArray())
  }

  execute (db, options = {}) {
    if (typeof db.getEngine === 'function') {
      return this.execute(db.getEngine(), options)
    }
    return db.execute(this.toString(), this.toArray(), options)
  }

  run (db, options = {}) {
    if (typeof db.getEngine === 'function') {
      return this.run(db.getEngine(), options)
    }
    return db.query(this.toString(), this.toArray(), options)
  }
}
Schema.QuerySQL = SchemaSQL
Schema.SQL = SchemaSQL
module.exports = Schema
