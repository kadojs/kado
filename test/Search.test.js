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
const Search = require('../lib/Search')
runner.suite('Search', (it) => {
  const search = new Search()
  const ourModule = () => {
    return new Promise((resolve) => {
      resolve([
        {
          uri: '/foo',
          title: 'foo',
          description: 'some Foo',
          updatedAt: new Date()
        },
        {
          uri: '/foo1',
          title: 'foo1',
          description: 'some Foo1',
          updatedAt: new Date()
        }
      ])
    })
  }
  it('should construct', () => {
    expect.isType('Search', new Search())
  })
  it('should have no modules', () => {
    expect.eq(Object.keys(search.allModules()).length, 0)
  })
  it('should add a module', () => {
    expect.eq(search.addModule('test', ourModule).title, 'test')
  })
  it('should get the module', () => {
    expect.eq(search.getModule('test').title, 'test')
  })
  it('should remove the module', () => {
    expect.eq(search.removeModule('test'), 'test')
  })
  it('should the module as removed', () => {
    expect.eq(Object.keys(search.allModules()).length, 0)
  })
  it('should add a new module', () => {
    expect.eq(search.addModule('test', ourModule).title, 'test')
  })
  it('should search by phrase', () => {
    return search.byPhrase({}, 'some foo', { start: 0, limit: 10 })
      .then((result) => {
        expect.eq(result.resultCount, 2)
        expect.eq(result.results.length, 1)
        expect.eq(result.results[0].moduleTitle, 'test')
        expect.eq(result.results[0].moduleResults[0].uri, '/foo')
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
