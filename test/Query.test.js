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
const Query = require('../lib/Query')
const QuerySQL = Query.SQL
runner.suite('Query', (it) => {
  it('should construct', () => {
    Assert.isType('Query', new Query())
  })
  it('should select without a condition', () => {
    const rv = QuerySQL.from('testTable').select()
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable`')
  })
  it('should select with a condition', () => {
    const rv = QuerySQL.from('testTable').select().where('id')
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable` WHERE `id` = ?')
  })
  it('should select with two conditions', () => {
    const rv = QuerySQL.from('testTable').select().where('id').where('name')
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable` WHERE `id` = ?' +
      ' AND `name` = ?')
  })
  it('should delete from a table', () => {
    const rv = QuerySQL.from('testTable').delete()
    Assert.eq(rv.toString(), 'DELETE FROM `testTable`')
  })
  it('should delete from a table with a condition', () => {
    const rv = QuerySQL.from('testTable').delete().where('id')
    Assert.eq(rv.toString(), 'DELETE FROM `testTable` WHERE `id` = ?')
  })
  it('should select with a limit', () => {
    const rv = QuerySQL.from('testTable').select().limit(5)
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable` LIMIT 5')
  })
  it('should select with a limit and offset', () => {
    const rv = QuerySQL.from('testTable').select().limit(10, 5)
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable` LIMIT 10,5')
  })
  it('should select with a limit and order', () => {
    const rv = QuerySQL.from('testTable').select().order('id').limit(5)
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable` ORDER BY `id`' +
      ' ASC LIMIT 5')
  })
  it('should select with a limit, order and offset', () => {
    const rv = QuerySQL.from('testTable')
    rv.select()
    rv.where('id')
    rv.order('name')
    rv.limit(1, 5)
    Assert.eq(rv.toString(), 'SELECT * FROM `testTable` WHERE `id` = ?' +
      ' ORDER BY `name` ASC LIMIT 1,5')
  })
  it('should insert a record', () => {
    const rv = QuerySQL.into('test').insert(['id', 'name', 'email'])
    rv.value([1, 'foo', 'foo@foo.com'])
    rv.value([2, 'bar', 'bar@bar.org'])
    Assert.eq(rv.toString(),
      'INSERT INTO `test` (`id`, `name`, `email`) VALUES\n' +
      '(?, ?, ?),\n' +
      '(?, ?, ?)'
    )
    Assert.eqDeep(rv.toArray(), [
      1, 'foo', 'foo@foo.com',
      2, 'bar', 'bar@bar.org'
    ])
  })
  it('should update a record', () => {
    const rv = QuerySQL.from('test').update(['name']).where('id').value(['foo2', 1])
    Assert.eq(rv.toString(), 'UPDATE `test` SET `name` = ? WHERE `id` = ?')
    Assert.eqDeep(rv.toArray(), ['foo2', 1])
  })
  it('should support a left join', () => {
    const jt = QuerySQL.from('test2').on('id')
    Assert.eq(jt.toLeftJoin(), ' LEFT JOIN `test2` ON `id` = ?')
    const rv = QuerySQL.from('test').select().leftJoin(jt).where('name')
    rv.value([1, 'foo'])
    Assert.eq(rv.toString(), 'SELECT * FROM `test` LEFT JOIN `test2` ON' +
      ' `id` = ? WHERE `name` = ?')
    Assert.eqDeep(rv.toArray(), [1, 'foo'])
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
