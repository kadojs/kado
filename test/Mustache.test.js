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
const Mustache = require('../lib/Mustache')
const format = runner.suite('Mustache')
// all static no constructor test needed
format.beforeEach(() => {
  console.log('beforeEach()')
  Mustache.getInstance().clearCache()
})
format.suite('.render()', (it) => {
  it('requires template to be a string', () => {
    try {
      const mustache = Mustache.getInstance()
      mustache.render(['dummy template'], ['foo', 'bar'])
    } catch (e) {
      Assert.isType('TypeError', e)
      const errorMessage = 'Invalid template! Template should be a "string" ' +
        'but "array" was given as the first argument for' +
        ' mustache#render(template, view, partials)'
      Assert.eq(errorMessage, e.message)
    }
  })

  it('uses tags argument instead of Mustache.tags when given', () => {
    const mustache = Mustache.getInstance()
    const template = '<<placeholder>>bar{{placeholder}}'
    const tags = ['<<', '>>']
    const rv = mustache.render(template, { placeholder: 'foo' }, {}, tags)
    Assert.eq(rv, 'foobar{{placeholder}}')
  })

  it('uses tags argument instead of Mustache.tags when given, even when it' +
    ' previous rendered the template using Mustache.tags', () => {
    const mustache = Mustache.getInstance({ tags: ['((', '))'] })
    const template = '((placeholder))bar{{placeholder}}'
    const rv = mustache.render(template, { placeholder: 'foo' }, {})
    Assert.eq(rv, 'foobar{{placeholder}}')
  })

  it('uses tags argument instead of Mustache.tags when given, even when it' +
    ' previous rendered the template using different tags', () => {
    const mustache = Mustache.getInstance({ tags: ['[[', ']]'] })
    const template = '[[placeholder]]bar<<placeholder>>'
    const rv = mustache.render(template, { placeholder: 'foo' })
    Assert.eq(rv, 'foobar<<placeholder>>')
  })

  it('does not mutate Mustache.tags when given tags argument', () => {
    const correctMustacheTags = ['{{', '}}']
    const mustache = Mustache.getInstance({ tags: correctMustacheTags })
    const rv = mustache.render(
      '((placeholder))',
      { placeholder: 'foo' },
      {},
      ['((', '))']
    )
    Assert.eq(mustache.tags, correctMustacheTags)
    Assert.eqDeep(Mustache.tags, ['{{', '}}'])
    Assert.eq(rv, 'foo')
  })

  it('uses provided tags when rendering partials', () => {
    const output = Mustache.render('<%> partial %>', { name: 'Santa Claus' }, {
      partial: '<% name %>'
    }, ['<%', '%>'])
    Assert.eq(output, 'Santa Claus')
  })

  it('supports sections with arrays of objects with number values', () => {
    const template = '{{#someList}}foo{{thing}}{{/someList}}'
    const view = { someList: [{ thing: 1 }, { thing: 2 }, { thing: 3 }] }
    const rv = Mustache.render(template, view)
    Assert.eq(rv, 'foo1foo2foo3')
  })

  it('supports sections with arrays of objects with string values', () => {
    const template = '{{#someList}}foo{{thing}}{{/someList}}'
    const view = { someList: [{ thing: 'A' }, { thing: 'B' }, { thing: 'C' }] }
    const rv = Mustache.render(template, view)
    Assert.eq(rv, 'fooAfooBfooC')
  })

  it('supports sections with arrays of objects with function return values', () => {
    const template = '{{#someList}}foo{{thing}}{{/someList}}'
    const view = {
      someList: [{ majig: 'x' }, { majig: 'y' }, { majig: 'z' }],
      thing: function () { return this.majig + '!' }
    }
    const rv = Mustache.render(template, view)
    Assert.eq(rv, 'foox!fooy!fooz!')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
