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
const Schema = require('../lib/Schema')
const SchemaSQL = Schema.SQL
runner.suite('Schema', (it) => {
  it('should construct', () => {
    Assert.isType('Schema', new Schema())
  })
  it('should create a table', () => {
    const rv = SchemaSQL.create('User')
    rv.field('id', {
      type: 'INT',
      length: '11',
      nullable: false,
      signed: false,
      autoIncrement: true
    })
    rv.field('email', { length: '191', nullable: false })
    rv.field('password', { nullable: false })
    rv.field('embedTemplate', { nullable: true, default: null })
    rv.field('filePriority', {
      type: 'INT', length: '11', nullable: false, default: '5', signed: false
    })
    rv.field('active', {
      type: 'TINYINT', length: '1', nullable: false, signed: false, default: '1'
    })
    rv.field('dateSeen', { type: 'datetime', default: null })
    rv.field('dateFail', { type: 'datetime', default: null })
    rv.field('createdAt', { type: 'datetime', nullable: false })
    rv.field('updatedAt', { type: 'datetime', nullable: false })
    rv.primary('id')
    rv.index('email_unique', ['email'], { unique: true })
    rv.index('active_index', ['active'])
    rv.index('dateSeen_index', ['dateSeen'])
    rv.index('dateFail_index', ['dateFail'])
    rv.index('createdAt_index', ['createdAt'])
    rv.index('updatedAt_index', ['updatedAt'])
    Assert.eq(rv.toString(),
      'CREATE TABLE IF NOT EXISTS `User` (\n' +
      ' `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,\n' +
      ' `email` VARCHAR(191) NOT NULL,\n' +
      ' `password` VARCHAR(255) NOT NULL,\n' +
      ' `embedTemplate` VARCHAR(255) DEFAULT NULL,\n' +
      ' `filePriority` INT(11) UNSIGNED NOT NULL DEFAULT \'5\',\n' +
      ' `active` TINYINT(1) UNSIGNED NOT NULL DEFAULT \'1\',\n' +
      ' `dateSeen` datetime DEFAULT NULL,\n' +
      ' `dateFail` datetime DEFAULT NULL,\n' +
      ' `createdAt` datetime NOT NULL,\n' +
      ' `updatedAt` datetime NOT NULL,\n' +
      ' PRIMARY KEY (`id`),\n' +
      ' UNIQUE KEY `email_unique` (`email`),\n' +
      ' INDEX `active_index` (`active`),\n' +
      ' INDEX `dateSeen_index` (`dateSeen`),\n' +
      ' INDEX `dateFail_index` (`dateFail`),\n' +
      ' INDEX `createdAt_index` (`createdAt`),\n' +
      ' INDEX `updatedAt_index` (`updatedAt`)\n' +
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
    )
    const result = rv.toArray()
    Assert.isType('Array', result)
    Assert.eq(result.length, 3)
  })
  it('should alter a table', () => {
    const rv = SchemaSQL.alter('User')
    Assert.eq(rv.toString(),
      'ALTER TABLE IF EXISTS `User` (\n' +
      'null\n' +
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
    )
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
