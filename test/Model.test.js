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
const Model = require('../lib/Model')
runner.suite('Model', (it) => {
  it('should construct', () => {
    Assert.isType('Model', new Model())
  })
  it('should have fieldBoolean', () => {
    const rv = Model.fieldBoolean()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'TINYINT')
  })
  it('should have fieldDate', () => {
    const rv = Model.fieldDate()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'DATETIME')
  })
  it('should have fieldNumber', () => {
    const rv = Model.fieldNumber()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'INT')
  })
  it('should have fieldPositiveNumber', () => {
    const rv = Model.fieldPositiveNumber()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'INT')
    Assert.eq(rv.signed, false)
  })
  it('should have fieldPrimary', () => {
    const rv = Model.fieldPrimary()
    Assert.isType('Object', rv)
    Assert.eq(rv.autoIncrement, true)
  })
  it('should have fieldText', () => {
    const rv = Model.fieldText()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'TEXT')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
