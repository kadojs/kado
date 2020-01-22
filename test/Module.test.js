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
const { expect } = require('../lib/Assert')
const Module = require('../lib/Module')
const mod = new Module()
class Application {}
runner.suite('Module', (it) => {
  it('should instantiate', () => {
    expect.isType('Module', new Module())
  })
  it('should have a db method', () => {
    expect.isType('Function', mod.db)
    expect.isType('undefined', mod.db(new Application()))
  })
  it('should have a search method', () => {
    expect.isType('Function', mod.search)
    expect.isType('Object', mod.search(new Application(), ['foo'], 0, 10))
  })
  it('should have a main method', () => {
    expect.isType('Function', mod.main)
    expect.isType('undefined', mod.main(new Application()))
  })
  it('should have a cli method', () => {
    expect.isType('Function', mod.cli)
    expect.isType('undefined', mod.cli(new Application()))
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
