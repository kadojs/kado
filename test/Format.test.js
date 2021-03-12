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
const intlOk = require('../lib/Language').hasFullIntl()
const Format = require('../lib/Format')
const format = runner.suite('Format')
// all static no constructor test needed
format.suite('.cookie()', (it) => {
  const expireDate = 'Thu, 01 Jan 1970 00:00:00 GMT'
  it('should require a name', () => {
    try {
      Format.cookie()
    } catch (err) {
      Assert.eq('Name required', err.message)
    }
  })
  it('should build a blank cookie', () => {
    const cookie = Format.cookie('foo')
    Assert.eq('foo=', cookie)
  })
  it('should accept a string for a value', () => {
    const cookie = Format.cookie('foo', 'bar')
    Assert.eq('foo=bar', cookie)
  })
  it('should accept an object for a value', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' })
    Assert.eq('foo={"foo":"bar"}', cookie)
  })
  it('should add a domain', () => {
    const cookie = Format.cookie('foo', { foo: 'foo: bar' }, { domain: '/' })
    Assert.eq('foo={"foo":"foo: bar"}; Domain=/', cookie)
  })
  it('should add a expires', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { expires: expireDate })
    Assert.eq('foo={"foo":"bar"}; Expires=Thu, 01 Jan 1970 00:00:00 GMT', cookie)
  })
  it('should only accept UTC date string for expires', () => {
    try {
      Format.cookie('foo', { foo: 'bar' }, { expires: 'dog' })
    } catch (err) {
      Assert.eq('Invalid Expiration Date Format', err.message)
    }
  })
  it('should add a httpOnly', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { httpOnly: true })
    Assert.eq('foo={"foo":"bar"}; HttpOnly', cookie)
  })
  it('should add a maxAge', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { maxAge: 3600 })
    Assert.eq('foo={"foo":"bar"}; Max-Age=3600', cookie)
  })
  it('should only accept integer for maxAge', () => {
    try {
      Format.cookie('foo', { foo: 'bar' }, { maxAge: 'potato' })
    } catch (err) {
      Assert.eq('Invalid maxAge', err.message)
    }
  })
  it('should add a path', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { path: '/' })
    Assert.eq('foo={"foo":"bar"}; Path=/', cookie)
  })
  it('should accept sameSite', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { sameSite: 'strict' })
    Assert.eq('foo={"foo":"bar"}; SameSite=Strict', cookie)
  })
  it('should accept sameSite', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { sameSite: 'lax' })
    Assert.eq('foo={"foo":"bar"}; SameSite=Lax', cookie)
  })
  it('should accept sameSite', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { sameSite: 'none' })
    Assert.eq('foo={"foo":"bar"}; SameSite=None', cookie)
  })
  it('should error on sameSite', () => {
    try {
      Format.cookie('foo', { foo: 'bar' }, { sameSite: 'foo' })
    } catch (err) {
      Assert.eq('Invalid SameSite value', err.message)
    }
  })
  it('should add a secure', () => {
    const cookie = Format.cookie('foo', { foo: 'bar' }, { secure: true })
    Assert.eq('foo={"foo":"bar"}; Secure', cookie)
  })
  it('should add all options', () => {
    const options = {}
    options.domain = '/'
    options.expires = expireDate
    options.httpOnly = true
    options.maxAge = 3600
    options.path = '/'
    options.secure = true
    options.sameSite = 'Strict'
    const cookie = Format.cookie('foo', { foo: 'bar' }, options)
    Assert.eq(
      'foo={"foo":"bar"}; Domain=/; Expires=' +
      'Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly' +
      '; Max-Age=3600; Path=/; SameSite=Strict; Secure',
      cookie
    )
  })
})
format.suite('.toFixedFix()', (it) => {
  it('(1.236,2) === 1.24', () => {
    Assert.eq(Format.toFixedFix(1.236, 2), 1.24)
  })
  it('(1.234,2) === 1.23', () => {
    Assert.eq(Format.toFixedFix(1.234, 2), 1.23)
  })
  it('(1.234)   === 1', () => {
    Assert.eq(Format.toFixedFix(1.234), 1)
  })
})
format.suite('.number()', (it) => {
  it('(1234.5604)   === \'1,235\'', () => {
    Assert.eq(Format.number(1234.5604), '1,235')
  })
  it('(1234.5604,2) === \'1,234.56\'', () => {
    Assert.eq(Format.number(1234.5604, 2), '1,234.56')
  })
  it('(1234.5604,3) === \'1,234.560\'', () => {
    Assert.eq(Format.number(1234.5604, 3), '1,234.560')
  })
  it('(1234.5605,3) === \'1,234.561\'', () => {
    Assert.eq(Format.number(1234.5605, 3), '1,234.561')
  })
})
format.suite('.magnitude()', (it) => {
  it('(1000000000000000000000000000) === \'1,000YB\'', () => {
    Assert.eq(Format.magnitude(1000000000000000000000000000), '1,000YB')
  })
  it('(1000000000000000000000000)    === \'1,000ZB\'', () => {
    Assert.eq(Format.magnitude(1000000000000000000000000), '1,000ZB')
  })
  it('(1000000000000000000000)       === \'1,000EB\'', () => {
    Assert.eq(Format.magnitude(1000000000000000000000), '1,000EB')
  })
  it('(1000000000000000000)          === \'1,000PB\'', () => {
    Assert.eq(Format.magnitude(1000000000000000000), '1,000PB')
  })
  it('(1000000000000000)             === \'1,000TB\'', () => {
    Assert.eq(Format.magnitude(1000000000000000), '1,000TB')
  })
  it('(1000000000000)                === \'1,000GB\'', () => {
    Assert.eq(Format.magnitude(1000000000000), '1,000GB')
  })
  it('(1000000000)                   === \'1,000MB\'', () => {
    Assert.eq(Format.magnitude(1000000000), '1,000MB')
  })
  it('(1000000)                      === \'1,000KB\'', () => {
    Assert.eq(Format.magnitude(1000000), '1,000KB')
  })
  it('(1000)                         === \'1,000B\'', () => {
    Assert.eq(Format.magnitude(1000), '1,000B')
  })
  it('(999,{force:\'k\'})              === \'1KB\'', () => {
    Assert.eq(Format.magnitude(999, { force: 'k' }), '1KB')
  })
  it('(999,{force:\'k\',suffix:\'bit\'}) === \'1Kbit\'', () => {
    Assert.eq(Format.magnitude(999, { force: 'k', suffix: 'bit' }), '1Kbit')
  })
})
format.suite('.bytes()', (it) => {
  it('(1337)               === \'1.34 kB\'', () => {
    Assert.eq(Format.bytes(1337), '1.34 kB')
  })
  it('(100)                === \'100 B\'', () => {
    Assert.eq(Format.bytes(100), '100 B')
  })
  it('(1337,{bits:true})   === \'1.34 kbit\'', () => {
    Assert.eq(Format.bytes(1337, { bits: true }), '1.34 kbit')
  })
  it('(42,{signed:true})   === \'+42 B\'', () => {
    Assert.eq(Format.bytes(42, { signed: true }), '+42 B')
  })
  function intlTest () {
    Assert.eq(Format.bytes(1337, { locale: 'de' }), '1,34 kB')
  }
  it('(1337,{locale:\'de\'}) === \'1,34 kB\'',
    // international does not work when small_icu used in nodejs build
    (!intlOk)
      ? undefined
      : intlTest
  )
})
format.suite('.inetPtoN()', (it) => {
  it('(\'1.2.3.4\')  === \'\\u0001\\u0002\\u0003\\u0004\'', () => {
    Assert.eq(Format.inetPtoN('1.2.3.4'), '\u0001\u0002\u0003\u0004')
  })
  it('(\'1:2:3::4\') === \'\\u0000\\u0001\\u0000\\u0002\\u0000\\u0003\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0004\'', () => {
    Assert.eq(Format.inetPtoN('1:2:3::4'), '\u0000\u0001\u0000\u0002\u0000\u0003\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0004')
  })
  it('(\'::1\')      === \'\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0001\'', () => {
    Assert.eq(Format.inetPtoN('::1'), '\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001')
  })
})
format.suite('.inetNtoP()', (it) => {
  it('(\'\\u0001\\u0002\\u0003\\u0004\')  === \'1.2.3.4\'', () => {
    Assert.eq(Format.inetNtoP('\u0001\u0002\u0003\u0004'), '1.2.3.4')
  })
  it('(\'\\u0000\\u0001\\u0000\\u0002\\u0000\\u0003\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0004\') === \'1:2:3::4\'', () => {
    Assert.eq(Format.inetNtoP('\u0000\u0001\u0000\u0002\u0000\u0003\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0004'), '1:2:3::4')
  })
  it('(\'\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0001\') === \'::1\'', () => {
    Assert.eq(Format.inetNtoP('\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001'), '::1')
  })
  it('(\'\\u0020\\u0001\\u001c\\u0004\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0001\') === \'2001:1c04:400::1\'', () => {
    Assert.eq(Format.inetNtoP('\u0020\u0001\u001c\u0004\u0004\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001'), '2001:1c04:400::1')
  })
  it('(\'\\u0020\\u0001\\u0048\\u0060\\u00b0\\u0002\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0068\') === \'2001:4860:b002::68\'', () => {
    Assert.eq(Format.inetNtoP('\u0020\u0001\u0048\u0060\u00b0\u0002\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0068'), '2001:4860:b002::68')
  })
})
format.suite('.ip()', (it) => {
  it('(\'1.2.3.4\')          === \'001.002.003.004\'', () => {
    Assert.eq(Format.ip('1.2.3.4'), '001.002.003.004')
  })
  it('(\'1.2.3.4\',\' \')      === \'  1.  2.  3.  4\'', () => {
    Assert.eq(Format.ip('1.2.3.4', ' '), '  1.  2.  3.  4')
  })
  it('(\'1.2.3.4\',\' \',true) === \'&nbsp;&nbsp;1.&nbsp;&nbsp;2.&nbsp;&nbsp;3.&nbsp;&nbsp;4\'', () => {
    Assert.eq(Format.ip('1.2.3.4', ' ', true), '&nbsp;&nbsp;1.&nbsp;&nbsp;2.&nbsp;&nbsp;3.&nbsp;&nbsp;4')
  })
  it('(\'1.2.3.4\',\'\')       === \'1.2.3.4\'', () => {
    Assert.eq(Format.ip('1.2.3.4', ''), '1.2.3.4')
  })
  it('(\'1:2:3::4\')         === \'0001:0002:0003:0000:0000:0000:0000:0004\'', () => {
    Assert.eq(Format.ip('1:2:3::4'), '0001:0002:0003:0000:0000:0000:0000:0004')
  })
  it('(\'1:2:3::4\',\' \')     === \'   1:   2:   3:   0:   0:   0:   0:   4\'', () => {
    Assert.eq(Format.ip('1:2:3::4', ' '), '   1:   2:   3:   0:   0:   0:   0:   4')
  })
  it('(\'1:2:3::4\',\'\')      === \'1:2:3:0:0:0:0:4\'', () => {
    Assert.eq(Format.ip('1:2:3::4', ''), '1:2:3:0:0:0:0:4')
  })
})
format.suite('.color()', (it) => {
  it('(\'foo\')                         === \'\\u001b[0;49;39mfoo\\u001b[0m\'', () => {
    Assert.eq(Format.color('foo'), '\u001b[0;49;39mfoo\u001b[0m')
  })
  it('(\'foo\',\'Cyan\')                  === \'\\u001b[0;49;36mfoo\\u001b[0m\'', () => {
    Assert.eq(Format.color('foo', 'Cyan'), '\u001b[0;49;36mfoo\u001b[0m')
  })
  it('(\'foo\',\'Green\',\'Red\')           === \'\\u001b[0;41;32mfoo\\u001b[0m\'', () => {
    Assert.eq(Format.color('foo', 'Green', 'Red'), '\u001b[0;41;32mfoo\u001b[0m')
  })
  it('(\'foo\',\'Blue\',\'Magenta\',\'Bold\') === \'\\u001b[1;45;34mfoo\\u001b[0m\'', () => {
    Assert.eq(Format.color('foo', 'Blue', 'Magenta', 'Bold'), '\u001b[1;45;34mfoo\u001b[0m')
  })
  it('(\'foo\',0,0,0,\'Blink\')           === \'\\u001b[0;49;39mfoo\\u001b[25m\'', () => {
    Assert.eq(Format.color('foo', 0, 0, 0, 'Blink'), '\u001b[0;49;39mfoo\u001b[25m')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
