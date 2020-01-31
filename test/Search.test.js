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
const Search = require('../lib/Search')
class OurSearch extends Search.SearchEngine {
  search (options) {
    Assert.isType('Object', options)
    Assert.isType('Object', options.app)
    return [
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
    ]
  }
}
runner.suite('Search', (it) => {
  const search = new Search()
  it('should construct', () => {
    Assert.isType('Search', new Search())
  })
  it('should have no modules', () => {
    Assert.eq(search.listEngines().length, 0)
  })
  it('should add a module', () => {
    Assert.isType('OurSearch', search.addEngine('test', new OurSearch()))
  })
  it('should get the module', () => {
    Assert.isType('OurSearch', search.getEngine('test'))
  })
  it('should remove the module', () => {
    Assert.eq(search.removeEngine('test'), true)
  })
  it('should the module as removed', () => {
    Assert.eq(search.listEngines().length, 0)
  })
  it('should add a new module', () => {
    Assert.isType('OurSearch', search.addEngine('test', new OurSearch()))
  })
  it('should search by phrase', () => {
    return search.byPhrase({}, 'some foo', { start: 0, limit: 10 })
      .then((result) => {
        Assert.eq(result.resultCount, 2)
        Assert.eq(Object.keys(result.results).length, 1)
        Assert.eq(Object.keys(result.results)[0], 'test')
        Assert.eq(result.results.test[0].uri, '/foo')
      })
  })
  it('should throw for non-string phrase', () => {
    try {
      search.byPhrase({}, ['not-a-string'], {})
    } catch (e) {
      Assert.match(/phrase must be string/, e.message)
    }
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
