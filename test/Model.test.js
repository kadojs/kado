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
  it('model should assert a date', () => {
    // these pass
    Model.assertDate(new Date())
    Model.assertDate('1960-05-04')
    Model.assertDate('1960-05-04 00')
    Model.assertDate('1960-05-04 00:00')
    Model.assertDate('1960-05-04 00:00:00')
    Model.assertDate('1960-05-04 00:00:00')
    Model.assertDate('1960-05-04 00:00:00Z')
    Model.assertDate('1960-05-04 00:00:00Z+6')
    Model.assertDate('1960-05-04 00:00:00Z-03:10')
    Model.assertDate('1960-05-04 00:00:0000Z+23:59')
    Model.assertDate('1-1-1 0:0:0')
    Model.assertDate('0-0-0 0:0:0')
    // these should fail
    const errorMessage = 'Invalid date'
    let caught = 0
    try { Model.assertDate('July 15th') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertDate('-202-04-20') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertDate('100-040-20') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertDate('00:12') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    Assert.isOk(caught === 4, 'An invalid date passed')
  })
  it('should assert an email', () => {
    // these pass
    Model.assertEmail('foo@foo.com')
    Model.assertEmail('noreply@gmail.com')
    Model.assertEmail('email@online.online')
    Model.assertEmail('mailme-1234@foo-run.tech')
    // these fail
    const errorMessage = 'Invalid email'
    let caught = 0
    try { Model.assertEmail('@foo') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertEmail('foo@') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertEmail('foo@foo.') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertEmail('foo@foo.b') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    try { Model.assertEmail('#@foo.com') } catch (e) {
      Assert.isOk(e.message === errorMessage); caught++
    }
    Assert.isOk(caught === 5, 'An invalid email passed')
  })
  it('should assert an id', () => {
    Model.assertId(0x01)
    Model.assertId(0xFF)
    Model.assertId(1)
    Model.assertId(0)
    Model.assertId('5')
    Model.assertId('#15')
    try {
      Model.assertId('; SELECT password FROM staff')
    } catch (err) {
      Assert.isOk(err.message === 'Invalid id', 'Unknown error')
    }
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
  it('should have fieldString', () => {
    const rv = Model.fieldString()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'VARCHAR')
  })
  it('should have fieldText', () => {
    const rv = Model.fieldText()
    Assert.isType('Object', rv)
    Assert.eq(rv.type, 'TEXT')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
