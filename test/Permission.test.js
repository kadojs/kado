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
const { expect } = require('../lib/Assert')
const Permission = require('../lib/Permission')
runner.suite('Permission', (it) => {
  const permission = new Permission()
  it('should construct', () => {
    expect.isType('Permission', new Permission())
  })
  it('should be empty', () => {
    expect.eq(permission.all().length, 0)
  })
  it('should add a permission', () => {
    expect.eqDeep(
      permission.add('foo', 'foo'),
      { name: 'foo', description: 'foo' }
    )
  })
  it('should show the permission exists', () => {
    expect.eq(permission.exists('foo'), true)
  })
  it('should get the permission', () => {
    expect.eq(permission.get('foo').name, 'foo')
  })
  it('should be allowed', () => {
    expect.eq(permission.allowed('foo'), true)
  })
  it('should not be allowed against a set', () => {
    expect.eq(permission.allowed('foo', []), false)
  })
  it('should digest keys from per set', () => {
    expect.eq(permission.digest().length, 1)
  })
  it('should return all permissions', () => {
    expect.eq(permission.all().length, 1)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
