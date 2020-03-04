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
const ETag = require('../lib/ETag')
const fs = require('../lib/FileSystem')
runner.suite('ETag', (it) => {
  it('should have a getTag method', () => {
    Assert.isType('Function', ETag.getTag)
  })
  it('should get a tag from a null string', () => {
    const rv = ETag.getTag('')
    Assert.eq(rv, '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"')
  })
  it('should tag the fox is brown', () => {
    const rv = ETag.getTag('the fox is brown')
    Assert.eq(rv, '"16-dI3kDDfUtoFbgMbtu5syLNqcBw0"')
  })
  it('should work on special charaters', () => {
    const rv = ETag.getTag('$#&*:;/<>?^@!(+)%')
    Assert.eq(rv, '"17-9jcJkuUIqG6OxJBOU+E3PX/LZwo"')
  })
  it('should work on file stat objects', () => {
    const statPath = fs.path.join(__dirname, '../.eslintrc')
    const rv = ETag.getTag(fs.statSync(statPath))
    Assert.isOk(rv.match(/W\/"30-[0-9]+"/))
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
