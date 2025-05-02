/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Module = require('../lib/Module')
class OurModule extends Module { }
const mod = new OurModule()
class Application {}
runner.suite('Module', (it) => {
  it('should instantiate', () => {
    Assert.isType('Module', new Module())
  })
  it('should have a db method', () => {
    Assert.isType('Function', mod.db)
    Assert.isType('undefined', mod.db(new Application()))
  })
  it('should have a search method', () => {
    Assert.isType('Function', mod.search)
    Assert.isType('Object', mod.search(new Application(), ['foo'], 0, 10))
  })
  it('should have a main method', () => {
    Assert.isType('Function', mod.main)
    Assert.isType('undefined', mod.main(new Application()))
  })
  it('should have a cli method', () => {
    Assert.isType('Function', mod.cli)
    Assert.isType('undefined', mod.cli(new Application()))
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
