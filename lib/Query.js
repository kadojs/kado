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
const Validate = require('./Validate')
class Query {
  static addBase (table, selection, construct, tableConstruct) {
    if (!construct && construct !== '') construct = 'SELECT'
    if (!tableConstruct && tableConstruct !== '') tableConstruct = 'FROM'
    if (!selection && selection !== '') selection = '*'
    if (construct) construct += ' '
    if (selection) selection += ' '
    if (tableConstruct) tableConstruct += ' '
    Assert.isType('string', table)
    Assert.isType('string', selection)
    Assert.isType('string', construct)
    Assert.isType('string', tableConstruct)
    return `${construct}${selection}${tableConstruct}\`${table}\``
  }

  static addComparison (context, construct, item, operator, value, joiner) {
    if (value === undefined) {
      value = operator
      operator = '='
    }
    if (!(item instanceof Array)) item = [[item, operator, value]]
    if (!joiner) joiner = 'AND'
    if (!construct) construct = 'WHERE'
    let rv = context || ` ${construct} `
    item.forEach((v, i) => {
      if (context && i === 0) i = 1
      if (v instanceof Array && v.length === 2) v = [v[0], '=', v[1]]
      if (!(v instanceof Array) || v.length < 3) return
      if (!v[2]) v[2] = '?'
      if (!`${v[2]}`.match(/^[(:?]+/)) {
        throw new Error('Comparisons work only with prepared statements. ' +
          'Pass a :label or ? instead.')
      }
      rv += `${i > 0 ? ` ${joiner} ` : ''}\`${v[0]}\` ${v[1]} ${v[2]}`
    })
    return rv
  }

  static addLimit (construct, start, limit) {
    if (limit === undefined) {
      limit = start
      start = null
    }
    if (Validate.isType('number', limit)) limit = `${limit}`
    if (start !== null && Validate.isType('number', start)) start = `${start}`
    Assert.isType('string', limit)
    Assert.match(/^[0-9]+$/, limit)
    if (start !== null) {
      Assert.isType('string', start)
      Assert.match(/^[0-9]+$/, start)
    }
    return ` ${construct} ${start ? `${start},` : ''}${limit}`
  }

  static addOrder (context, construct, by, direction = 'ASC', joiner = ',') {
    const allowedDirection = ['ASC', 'DESC']
    if (!(by instanceof Array)) by = [[by, direction]]
    if (!construct) construct = 'ORDER BY'
    let rv = context || ` ${construct} `
    by.forEach((v, i) => {
      if (context && i === 0) i = 1
      if (typeof v === 'string') v = [v, direction]
      if (!(v instanceof Array) || v.length < 2) return
      if (!v[1]) v[1] = 'ASC'
      if (allowedDirection.indexOf(v[1]) === -1) v[1] = 'ASC'
      rv += `${i > 0 ? ` ${joiner} ` : ''}\`${v[0]}\` ${v[1]}`
    })
    return rv
  }

  static addJoin (query, direction = 'Left') {
    Assert.isType('Query', Object.getPrototypeOf(query))
    const method = `to${direction}Join`
    Assert.isType('Function', query[method])
    return query[method]()
  }

  static printJoin (table, condition, construct) {
    if (!condition) return ''
    if (!construct) construct = 'LEFT JOIN'
    return ` ${construct} \`${table}\`${condition}`
  }

  static print (base, join, where, order, limit) {
    if (!base) throw new Error('Missing query base')
    if (!join) join = ''
    if (!where) where = ''
    if (!order) order = ''
    if (!limit) limit = ''
    Assert.isType('string', base)
    Assert.isType('string', join)
    Assert.isType('string', where)
    Assert.isType('string', order)
    Assert.isType('string', limit)
    return `${base}${join}${where}${order}${limit}`
  }

  constructor (tableName) {
    this.table = tableName
  }

  toString () {
    throw new Error('The toString method of Query must be extended')
  }

  execute () {
    throw new Error('The execute method of Query must be extended')
  }

  run () {
    throw new Error('The run method of Query must be extended')
  }
}
class QuerySQL extends Query {
  static from (tableName) {
    return new QuerySQL(tableName)
  }

  static into (tableName) {
    return new QuerySQL(tableName)
  }

  constructor (tableName) {
    super(tableName)
    this.values = []
    this.qbase = null
    this.qinsert = null
    this.qlimit = null
    this.qljoin = null
    this.qon = null
    this.qorder = null
    this.qupdate = null
    this.qwhere = null
  }

  on (item, operator, value, joiner) {
    this.qon = Query.addComparison(
      this.qon, 'ON', item, operator, value, joiner
    )
    return this
  }

  select (selection = '*') {
    this.qbase = Query.addBase(this.table, selection)
    return this
  }

  insert (fields) {
    if (!fields || !(fields instanceof Array)) fields = []
    Assert.isType('Array', fields)
    this.qbase = Query.addBase(this.table, '', 'INSERT INTO', '')
    fields = fields instanceof Array ? `(\`${fields.join('`, `')}\`)` : ''
    this.qinsert = `${fields} VALUES\n`
    return this
  }

  value (row) {
    if (this.qinsert) {
      const joiner = this.qinsert.match(/VALUES\n$/) ? '' : ',\n'
      let insert = ''
      Object.keys(row).forEach((v, i) => {
        insert += `${i > 0 ? ', ' : ''}?`
      })
      this.qinsert += `${joiner}(${insert})`
    }
    // correct date string to match SQL standards
    if (row instanceof Array) {
      row.forEach((v) => {
        if (v instanceof Date) {
          v = v.toISOString().slice(0, 19).replace('T', ' ')
        }
        this.values.push(v)
      })
    } else {
      if (row instanceof Date) {
        row = row.toISOString().slice(0, 19).replace('T', ' ')
      }
      this.values = this.values.concat(row)
    }
    return this
  }

  update (fields) {
    if (!fields || !(fields instanceof Array)) fields = []
    Assert.isType('Array', fields)
    this.qbase = Query.addBase(this.table, '', 'UPDATE', '')
    fields = fields instanceof Array ? `\`${fields.join('` = ?, `')}\` = ?` : ''
    this.qupdate = `SET ${fields}`
    return this
  }

  delete () {
    this.qbase = Query.addBase(this.table, '', 'DELETE')
    return this
  }

  leftJoin (query) {
    this.qljoin = Query.addJoin(query, 'Left')
    return this
  }

  log () {
    console.log(this.toString(), this.toArray())
  }

  where (item, operator, value, joiner) {
    this.qwhere = Query.addComparison(
      this.qwhere, 'WHERE', item, operator, value, joiner
    )
    return this
  }

  limit (start, limit) {
    this.qlimit = Query.addLimit('LIMIT', start, limit)
    return this
  }

  order (by, direction, joiner) {
    this.qorder = Query.addOrder(this.qorder, 'ORDER BY', by, direction, joiner)
    return this
  }

  toArray () {
    return this.values
  }

  toLeftJoin () {
    return Query.printJoin(this.table, this.qon)
  }

  toString () {
    if (this.qinsert) return `${this.qbase} ${this.qinsert}`
    if (this.qupdate) return `${this.qbase} ${this.qupdate}${this.qwhere}`
    return Query.print(
      this.qbase, this.qljoin, this.qwhere, this.qorder, this.qlimit
    )
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

Query.QuerySQL = QuerySQL
Query.SQL = QuerySQL
module.exports = Query
