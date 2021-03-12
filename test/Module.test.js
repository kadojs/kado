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
