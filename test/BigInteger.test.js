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
runner.suite('BigInteger', (it, bigint) => {
  const strNumber = '91823918239182398123'
  const bi = new BigInt(strNumber)
  it(`should construct with ('${strNumber}')`, () => {
    Assert.isType('BigInteger', bi)
  })
  bigint.suite('.toString()', (it) => {
    const binNumber = '1001111101001010000000101110010001001110010111110101010001010101011'
    const hexNumber = '4fa50172272faa2ab'
    const octNumber = '11751200562116276521253'
    it(`.toString()   === '${strNumber}'`, () => {
      Assert.eq(bi.toString(), strNumber)
    })
    it('.toString(10) === .toString()', () => {
      Assert.eq(bi.toString(10), bi.toString())
    })
    it(`.toString(16) === '${hexNumber}'`, () => {
      Assert.eq(bi.toString(16), hexNumber)
    })
    it(`.toString(2)  === '${binNumber}'`, () => {
      Assert.eq(bi.toString(2), binNumber)
    })
    it(`.toString(8)  === '${octNumber}'`, () => {
      Assert.eq(bi.toString(8), octNumber)
    })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
