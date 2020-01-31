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
const Profiler = require('../lib/Profiler')
runner.suite('Profiler', (it) => {
  const profiler = new Profiler()
  it('should construct', () => {
    Assert.isType('Profiler', new Profiler())
  })
  it('should accept query addition', () => {
    Assert.eq(profiler.addQuery('SELECT * FROM FOO', 1001), 1)
  })
  it('should start the rendering timer', () => {
    const now = +new Date()
    Assert.maximum(profiler.startRender(), now)
  })
  it('should build a profile', () => {
    Assert.match(/<div id="kado-profiler">/, profiler.build().HTML)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
