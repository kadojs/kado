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
const FileSystem = require('../lib/FileSystem')
runner.suite('FileSystem', (it) => {
  it('should have access', () => {
    Assert.isType('Function', FileSystem.access)
  })
  it('should have accessSync', () => {
    Assert.isType('Function', FileSystem.accessSync)
  })
  it('should have appendFile', () => {
    Assert.isType('Function', FileSystem.appendFile)
  })
  it('should have appendFileSync', () => {
    Assert.isType('Function', FileSystem.appendFileSync)
  })
  it('should have chmod', () => {
    Assert.isType('Function', FileSystem.chmod)
  })
  it('should have chmodSync', () => {
    Assert.isType('Function', FileSystem.chmodSync)
  })
  it('should have chown', () => {
    Assert.isType('Function', FileSystem.chown)
  })
  it('should have chownSync', () => {
    Assert.isType('Function', FileSystem.chownSync)
  })
  it('should have closeSync', () => {
    Assert.isType('Function', FileSystem.closeSync)
  })
  it('should have copyFile', () => {
    Assert.isType('Function', FileSystem.copyFile)
  })
  it('should have copyFileSync', () => {
    Assert.isType('Function', FileSystem.copyFileSync)
  })
  it('should have createReadStream', () => {
    Assert.isType('Function', FileSystem.createReadStream)
  })
  it('should have createWriteStream', () => {
    Assert.isType('Function', FileSystem.createWriteStream)
  })
  it('should have exists', () => {
    Assert.isType('Function', FileSystem.exists)
  })
  it('should have gunzipFile', () => {
    Assert.isType('Function', FileSystem.gunzipFile)
  })
  it('should have gzipFile', () => {
    Assert.isType('Function', FileSystem.gzipFile)
  })
  it('should have fchmodSync', () => {
    Assert.isType('Function', FileSystem.fchmodSync)
  })
  it('should have fchownSync', () => {
    Assert.isType('Function', FileSystem.fchownSync)
  })
  it('should have fdatasyncSync', () => {
    Assert.isType('Function', FileSystem.fdatasyncSync)
  })
  it('should have fsyncSync', () => {
    Assert.isType('Function', FileSystem.fsyncSync)
  })
  it('should have ftruncateSync', () => {
    Assert.isType('Function', FileSystem.ftruncateSync)
  })
  it('should have futimesSync', () => {
    Assert.isType('Function', FileSystem.futimesSync)
  })
  it('should have lchmod', () => {
    Assert.isType('Function', FileSystem.lchmod)
  })
  it('should have lchown', () => {
    Assert.isType('Function', FileSystem.lchown)
  })
  it('should have link', () => {
    Assert.isType('Function', FileSystem.link)
  })
  it('should have linkSync', () => {
    Assert.isType('Function', FileSystem.linkSync)
  })
  it('should have lstat', () => {
    Assert.isType('Function', FileSystem.lstat)
  })
  it('should have lstatSync', () => {
    Assert.isType('Function', FileSystem.lstatSync)
  })
  it('should have mkdir', () => {
    Assert.isType('Function', FileSystem.mkdir)
  })
  it('should have mkdirSync', () => {
    Assert.isType('Function', FileSystem.mkdirSync)
  })
  it('should have mkdtemp', () => {
    Assert.isType('Function', FileSystem.mkdtemp)
  })
  it('should have mkdtempSync', () => {
    Assert.isType('Function', FileSystem.mkdtempSync)
  })
  it('should have open', () => {
    Assert.isType('Function', FileSystem.open)
  })
  it('should have opendir', () => {
    Assert.isType('Function', FileSystem.opendir)
  })
  it('should have opendirSync', () => {
    Assert.isType('Function', FileSystem.opendirSync)
  })
  it('should have openSync', () => {
    Assert.isType('Function', FileSystem.openSync)
  })
  it('should have readdir', () => {
    Assert.isType('Function', FileSystem.readdir)
  })
  it('should have readdirSync', () => {
    Assert.isType('Function', FileSystem.readdirSync)
  })
  it('should have readFile', () => {
    Assert.isType('Function', FileSystem.readFile)
  })
  it('should have readFileSync', () => {
    Assert.isType('Function', FileSystem.readFileSync)
  })
  it('should have readlink', () => {
    Assert.isType('Function', FileSystem.readlink)
  })
  it('should have readlinkSync', () => {
    Assert.isType('Function', FileSystem.readlinkSync)
  })
  it('should have readSync', () => {
    Assert.isType('Function', FileSystem.readSync)
  })
  it('should have realpath', () => {
    Assert.isType('Function', FileSystem.realpath)
  })
  it('should have realpathSync', () => {
    Assert.isType('Function', FileSystem.realpathSync)
  })
  it('should have rename', () => {
    Assert.isType('Function', FileSystem.rename)
  })
  it('should have renameSync', () => {
    Assert.isType('Function', FileSystem.renameSync)
  })
  it('should have rmdir', () => {
    Assert.isType('Function', FileSystem.rmdir)
  })
  it('should have rmdirSync', () => {
    Assert.isType('Function', FileSystem.rmdirSync)
  })
  it('should have stat', () => {
    Assert.isType('Function', FileSystem.stat)
  })
  it('should have statSync', () => {
    Assert.isType('Function', FileSystem.statSync)
  })
  it('should have symlink', () => {
    Assert.isType('Function', FileSystem.symlink)
  })
  it('should have symlinkSync', () => {
    Assert.isType('Function', FileSystem.symlinkSync)
  })
  it('should have truncate', () => {
    Assert.isType('Function', FileSystem.truncate)
  })
  it('should have truncateSync', () => {
    Assert.isType('Function', FileSystem.truncateSync)
  })
  it('should have unlink', () => {
    Assert.isType('Function', FileSystem.unlink)
  })
  it('should have unlinkSync', () => {
    Assert.isType('Function', FileSystem.unlinkSync)
  })
  it('should have unwatchFile', () => {
    Assert.isType('Function', FileSystem.unwatchFile)
  })
  it('should have utimes', () => {
    Assert.isType('Function', FileSystem.utimes)
  })
  it('should have utimesSync', () => {
    Assert.isType('Function', FileSystem.utimesSync)
  })
  it('should have watch', () => {
    Assert.isType('Function', FileSystem.watch)
  })
  it('should have watchFile', () => {
    Assert.isType('Function', FileSystem.watchFile)
  })
  it('should have writeFile', () => {
    Assert.isType('Function', FileSystem.writeFile)
  })
  it('should have writeFileSync', () => {
    Assert.isType('Function', FileSystem.writeFileSync)
  })
  it('should have writeSync', () => {
    Assert.isType('Function', FileSystem.writeSync)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
