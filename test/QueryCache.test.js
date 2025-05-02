/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const QueryCache = require('../lib/QueryCache')
runner.suite('Query', (it) => {
  it('should construct', () => {
    Assert.isType('QueryCache', new QueryCache({ db: {}, model: {} }))
  })
  it('should generate a key', () => {
    Assert.isType('string', QueryCache.generateKey())
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
