/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
  it('should getType of zip', () => {
    const rv = Mime.getType('test.zip')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/zip')
    Assert.eq(rv.extension, 'zip')
  })
  it('should getType of zip with literal mimetype', () => {
    const rv = Mime.getType('application/zip')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/zip')
    Assert.eq(rv.extension, 'zip')
  })
  it('should getType of zip with literal extension', () => {
    const rv = Mime.getType('zip')
    Assert.isType('MimeType', rv)
    Assert.isType('Array', rv.magic)
    Assert.isType('Array', rv.ext)
    Assert.eq(rv.type, 'application/zip')
    Assert.eq(rv.extension, 'zip')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
