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
const dateRegex = new RegExp(
  // calendar date (0000-00-00)
  '^[0-9]{1,}-[0-9]{1,2}-[0-9]{1,2}' +
  // hours and minutes (00:00)
  '(| [0-9]{1,2}(|:[0-9]{1,2}' +
  // seconds and timezone (.0000z+00:00)
  '(|:[0-9]{1,4}(|z(|[+-]{1}[0-9]{1,2}(|:[0-9]{1,2)))))+)',
  'i'
)
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
const idRegex = /^[0-9a-z]+$/i
class Model extends Mapper {
  static assertId (id, msg = 'Invalid id') {
    if (Assert.getType(id) === 'number') id = `${id}`
    if (id[0] === '#') id = id.slice(1)
    Assert.isOk(id && id.match && id.match(idRegex), msg)
  }

  static assertDate (date, msg = 'Invalid date') {
    if (date instanceof Date) return true
    Assert.isOk(Assert.getType(date) === 'string', msg)
    Assert.isOk(date && date.match && date.match(dateRegex), msg)
  }

  static assertEmail (email, msg = 'Invalid email') {
    Assert.isOk(Assert.getType(email) === 'string', msg)
    Assert.isOk(email && email.match && email.match(emailRegex), msg)
  }

  static byIdQuery (table, id, fields = null, idField = 'id') {
    Model.assertId(id)
    Assert.isType('string', table)
    Assert.isType('string', idField)
    id = `${id}`
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

  static fieldDate (
    nullable = false, writable = true, defaultValue = undefined
  ) {
    return {
      type: 'DATETIME',
      nullable: nullable,
      writable: writable,
      default: defaultValue
    }
  }

  static fieldNumber (
    defaultValue = '0', signed = true, nullable = false, length = undefined
  ) {
    return {
      type: 'INT',
      length: length,
      nullable: nullable,
      signed: signed,
      default: defaultValue
    }
  }

  static fieldPositiveNumber (
    defaultValue = '0', nullable = false, length = undefined
  ) {
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

  static fieldString (
    defaultValue = null, nullable = true, length = undefined
  ) {
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

  static async save (
    Model, db, id = 0, fields = [], data = {}, idField = 'id'
  ) {
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
