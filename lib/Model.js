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
const Mapper = require('./Mapper')
const Query = require('./Query')
const Validate = require('./Validate')
class Model extends Mapper {
  static byIdQuery (table, id, fields = null, idField = 'id') {
    Assert.isType('string', table)
    if (Validate.isType('number', id)) id = `${id}`
    Assert.isType('string', id)
    Assert.isType('string', idField)
    Assert.match(/^[0-9]+$/, id)
    return Query.SQL.from(table).select(fields).where(idField).value(id)
  }

  static deleteQuery (table) {
    return Query.SQL.from(table).delete()
  }

  static fieldBoolean (defaultValue = false) {
    return {
      type: 'TINYINT',
      length: '1',
      nullable: false,
      signed: false,
      default: defaultValue ? '1' : '0'
    }
  }

  static fieldDate (nullable = false, writable = true, defaultValue = null) {
    return {
      type: 'DATETIME',
      nullable: nullable,
      writable: writable,
      default: defaultValue
    }
  }

  static fieldNumber (
    defaultValue = '0', signed = true, nullable = false, length
  ) {
    return {
      type: 'INT',
      length: length,
      nullable: nullable,
      signed: signed,
      default: defaultValue
    }
  }

  static fieldPositiveNumber (defaultValue = '0', nullable = false, length) {
    return Model.fieldNumber(defaultValue, false, nullable, length)
  }

  static fieldPrimary (autoIncrement = true, nullable = false) {
    return {
      type: 'INT',
      length: '11',
      nullable: nullable,
      signed: false,
      autoIncrement: autoIncrement
    }
  }

  static fieldString (defaultValue = null, nullable = true, length) {
    return {
      type: 'VARCHAR',
      length: length,
      nullable: nullable,
      default: defaultValue
    }
  }

  static fieldText (defaultValue = '', nullable = false) {
    return { type: 'TEXT', nullable: nullable, default: defaultValue }
  }

  static filterFields (fields = {}, options = {}) {
    const rv = []
    for (const name in fields) {
      if (!Object.prototype.hasOwnProperty.call(fields, name)) continue
      if (options.insert === false && fields[name].insert === false) continue
      if (options.writable === false && fields[name].writable === false) {
        continue
      }
      rv.push(name)
    }
    return rv
  }

  static insertQuery (table, fields = null) {
    return Query.SQL.into(table).insert(fields)
  }

  static listQuery (table) {
    Assert.isType('string', table)
    return Query.SQL.from(table).select()
  }

  static async save (Model, db, id = 0, fields = [], data = {}, idField) {
    if (!idField) idField = 'id'
    const now = new Date()
    const fieldData = {}
    let query = Model.byIdQuery(Model.tableName(), id, null, idField)
    let rv = await query.execute(db)
    Assert.isType('Array', rv[0])
    if (rv[0].length) {
      const help = new Model(rv[0].shift())
      Model.mergeObject(help, data)
      query = Model.update(fields.concat(['updatedAt']))
      fields.forEach((key) => { fieldData[key] = data[key] })
      fieldData.updatedAt = now
      query.value(Object.values(fieldData))
      query.where(idField).value(id)
      rv = await query.execute(db)
      Assert.isType('Array', rv)
    } else {
      query = Model.insert(fields.concat(['createdAt', 'updatedAt']))
      fields.forEach((key) => { fieldData[key] = data[key] })
      fieldData.createdAt = now
      fieldData.updatedAt = now
      query.value(Object.values(fieldData))
      rv = await query.execute(db)
      Assert.isType('Array', rv)
      id = rv[0].insertId
    }
    return id
  }

  static searchQuery (table, phrase, fields = []) {
    Assert.isType('string', table)
    Assert.isType('string', phrase)
    const query = Query.SQL.from(table).select()
    fields.forEach((v) => {
      query.where(v, 'LIKE').value(phrase)
    })
    return query
  }

  static updateQuery (table, fields = null) {
    return Query.SQL.from(table).update(fields)
  }
}
module.exports = Model
