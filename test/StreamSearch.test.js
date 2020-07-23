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
const StreamSearch = require('../lib/StreamSearch')
const inspect = require('util').inspect
runner.suite('StreamSearch', (it) => {
  const needle = Buffer.from('\r\n')
  const streamSearch = new StreamSearch(needle)
  it('should construct', () => {
    Assert.isType('StreamSearch', streamSearch)
  })
  it('should search for needles', () => {
    const rv = []
    const chunks = [
      Buffer.from('foo'),
      Buffer.from(' bar'),
      Buffer.from('\r'),
      Buffer.from('\n'),
      Buffer.from('baz, hello\r'),
      Buffer.from('\n world.'),
      Buffer.from('\r\n Node.JS rules!!\r\n\r\n')
    ]
    streamSearch.on('info', (isMatch, data, start, end) => {
      const _d = { match: false }
      if (data) { _d.data = inspect(data.toString('ascii', start, end)) }
      if (isMatch) { _d.match = true }
      rv.push(_d)
    })
    for (let i = 0, len = chunks.length; i < len; ++i) {
      streamSearch.push(chunks[i])
    }
    Assert.eqDeep(rv, [
      { match: false, data: "'foo'" },
      { match: false, data: "' bar'" },
      { match: true },
      { match: false, data: "'baz, hello'" },
      { match: true },
      { match: false, data: "' world.'" },
      { match: true },
      { match: true, data: "' Node.JS rules!!'" },
      { match: true, data: "''" }
    ]
    )
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
