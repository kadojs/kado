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
format.suite('.render()', (it) => {
  it('requires template to be a string', () => {
    try {
      Mustache.render(['dummy template'], ['foo', 'bar'])
    } catch (e) {
      Assert.isType('TypeError', e)
      Assert.match(/Invalid template! Template should be a "string" but "array" was given as the first argument for mustache#render\(template, view, partials\)/, e.message)
    }
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
