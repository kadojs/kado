/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
