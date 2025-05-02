/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Util = require('../lib/Util')
runner.suite('Util', (it) => {
  const render = (s) => { return s }
  it('should check for bool true', () => {
    Assert.eq(Util.is()('true,1,2', render), '1')
    Assert.eq(Util.is()('false,1,2', render), '2')
  })
  it('should check for comparison', () => {
    Assert.eq(Util.compare()('1,1,1,2', render), '1')
    Assert.eq(Util.compare()('1,2,1,2', render), '2')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
