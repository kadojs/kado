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
const BigInt = require('../lib/BigInteger')
runner.suite('BigInteger', (it, suite) => {
  const two = BigInt(2)
  it('should construct', () => {
    Assert.isType('BigInteger', two)
  })
  it('should .toJSON()', () => {
    Assert.eq(two.toJSON(), '@BigInteger(2)')
  })
  it('should JSON.stringify()', () => {
    Assert.eq(JSON.stringify({ two: two }), '{"two":"@BigInteger(2)"}')
  })
  suite.suite('.pow()', (it) => {
    const fullBits = 340282366920938463463374607431768211456n
    it('should .pow() with Number input', () => {
      Assert.eq(two.pow(128), fullBits)
    })
    it('should .pow() with native BigInt input', () => {
      Assert.eq(two.pow(128n), fullBits)
    })
    it('should .pow() with BigInteger input', () => {
      Assert.eq(two.pow(BigInt(128)), fullBits)
    })
    it('should .pow() with String input', () => {
      Assert.eq(two.pow('128'), fullBits)
    })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
