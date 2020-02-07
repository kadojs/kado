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
const Parser = require('../lib/Parser')
const cookieString = '_ga=GA1.2.637651231.1575923282;' +
  ' mm2_cookieA=06bad8dd-ecda-4e00-abbe-1e641adde6f0; _ym_d=1586356006;' +
  ' _ym_uid=1576356006128031579; __qca=P0-1332394709-1576356006094'
runner.suite('Parser', (it) => {
  it('should parse cookies', () => {
    const rv = Parser.cookie(cookieString)
    Assert.isType('Object', rv)
    Assert.eq(rv._ga, 'GA1.2.637651231.1575923282')
    Assert.eq(rv.mm2_cookieA, '06bad8dd-ecda-4e00-abbe-1e641adde6f0')
    Assert.eq(rv._ym_d, '1586356006')
    Assert.eq(rv._ym_uid, '1576356006128031579')
    Assert.eq(rv.__qca, 'P0-1332394709-1576356006094')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
