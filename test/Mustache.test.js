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
const Validate = require('../lib/Validate')
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
      console.log('typeOf mustache', Validate.getType(mustache))
      console.log('typeOf render', Validate.getType(mustache.render))
      mustache.render(['dummy template'], ['foo', 'bar'])
    } catch (e) {
      Assert.isType('TypeError', e)
      Assert.match(/Invalid template! Template should be a "string" but "array" was given as the first argument for mustache#render\(template, view, partials\)/, e.message)
    }
  })

  it('uses tags argument instead of Mustache.tags when given', () => {
    const mustache = Mustache.getInstance()
    const template = '<<placeholder>>bar{{placeholder}}'
    mustache.tags = ['{{', '}}']
    Assert.eq(mustache.render(template, { placeholder: 'foo' }, {}, ['<<', '>>']), 'foobar{{placeholder}}')
  })

  it('uses tags argument instead of Mustache.tags when given, even when it previous rendered the template using Mustache.tags', () => {
    const mustache = Mustache.getInstance()
    var template = '((placeholder))bar{{placeholder}}'
    mustache.tags = ['{{', '}}']
    mustache.render(template, { placeholder: 'foo' })
    Assert.eq(mustache.render(template, { placeholder: 'foo' }, {}, ['((', '))']), 'foobar{{placeholder}}')
  })

  it('uses tags argument instead of Mustache.tags when given, even when it previous rendered the template using different tags', () => {
    const mustache = Mustache.getInstance()
    var template = '[[placeholder]]bar<<placeholder>>'
    mustache.render(template, { placeholder: 'foo' }, {}, ['<<', '>>'])
    Assert.eq(mustache.render(template, { placeholder: 'foo' }, {}, ['[[', ']]']), 'foobar<<placeholder>>')
  })

  it('does not mutate Mustache.tags when given tags argument', () => {
    const mustache = Mustache.getInstance()
    var correctMustacheTags = ['{{', '}}']
    mustache.tags = correctMustacheTags
    mustache.render('((placeholder))', { placeholder: 'foo' }, {}, ['((', '))'])
    Assert.eq(mustache.tags, correctMustacheTags)
    Assert.eqDeep(mustache.tags, ['{{', '}}'])
  })

  it('uses provided tags when rendering partials', () => {
    const mustache = Mustache.getInstance()
    var output = mustache.render('<%> partial %>', { name: 'Santa Claus' }, {
      partial: '<% name %>'
    }, ['<%', '%>'])
    Assert.eq(output, 'Santa Claus')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
