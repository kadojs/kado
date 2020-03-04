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
 * GNU General Public License for more details.5
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Mime = require('../lib/Mime')
runner.suite('Mime', (it) => {
  it('should getType of text', () => {
    const rv = Mime.getType('test.text')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'text/plain')
    Assert.eq(rv.extension, 'txt')
  })
  it('should getType of log', () => {
    const rv = Mime.getType('test.log')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'text/plain')
    Assert.eq(rv.extension, 'txt')
  })
  it('should getType of zip', () => {
    const rv = Mime.getType('test.zip')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/zip')
    Assert.eq(rv.extension, 'zip')
  })
  it('should getType of exe', () => {
    const rv = Mime.getType('test.exe')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/x-msdownload')
    Assert.eq(rv.extension, 'exe')
  })
  it('should getType of php', () => {
    const rv = Mime.getType('test.php')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/x-httpd-php')
    Assert.eq(rv.extension, 'php')
  })
  it('should getType of js', () => {
    const rv = Mime.getType('test.js')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/javascript')
    Assert.eq(rv.extension, 'js')
  })
  it('should getType of msi', () => {
    const rv = Mime.getType('test.msi')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/x-msi')
    Assert.eq(rv.ext[0], 'msi')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
