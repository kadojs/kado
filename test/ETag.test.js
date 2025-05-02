/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
