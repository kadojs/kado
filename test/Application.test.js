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
const libSizeTargetKB = 384
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Application = require('../lib/Application')
const fs = require('../lib/FileSystem')
const Module = require('../lib/Module')
const app = new Application()
class OurModule extends Module {
  constructor () {
    super()
    this.name = 'foo'
  }
}
runner.suite('Application', (it) => {
  it('should instantiate', () => {
    Assert.isType('Application', new Application())
  })
  it('should set the name', () => {
    Assert.eq(app.setName('foo').name, 'foo')
  })
  it('should set the version', () => {
    Assert.eq(app.setVersion('1.2.3').version, '1.2.3')
  })
  it('should set the config', () => {
    Assert.eq(app.setConfig({ name: 'bar' }).config.get('name'), 'bar')
  })
  it('should add a module', () => {
    Assert.isType('Application', app.addModule(new OurModule()))
  })
  it('should get a module', () => {
    Assert.isType('Module', Object.getPrototypeOf(app.getModule('foo')))
  })
  it('should remove a module', () => {
    Assert.isType('Module', Object.getPrototypeOf(app.removeModule('foo')))
  })
  it('should load a library', () => {
    app.library.addPath(fs.path.join(__dirname, '/../lib'))
    const Asset = app.lib('Asset')
    Assert.isType('Asset', new Asset())
  })
  it('should start', async () => {
    const rv = await app.start()
    Assert.isType('undefined', rv)
    Assert.isType('string', app.INTERFACE_ROOT)
    Assert.isType('Asset', app.asset)
    Assert.isType('Cron', app.cron)
    Assert.isType('History', app.history)
    Assert.isType('Permission', app.permission)
    Assert.isType('Router', app.router)
    Assert.isType('Util', app.util)
  })
  it('should listen', async () => {
    const rv = await app.listen()
    Assert.isType('undefined', rv)
  })
  it('should stop', async () => {
    const rv = await app.stop()
    Assert.isType('undefined', rv)
  })
  it('should map acl routing', () => {
    Assert.isType('Function', app.acl)
  })
  it('should map bind routing', () => {
    Assert.isType('Function', app.bind)
  })
  it('should map checkout routing', () => {
    Assert.isType('Function', app.checkout)
  })
  it('should map copy routing', () => {
    Assert.isType('Function', app.copy)
  })
  it('should map delete routing', () => {
    Assert.isType('Function', app.delete)
  })
  it('should map get routing', () => {
    Assert.isType('Function', app.get)
  })
  it('should map head routing', () => {
    Assert.isType('Function', app.head)
  })
  it('should map link routing', () => {
    Assert.isType('Function', app.link)
  })
  it('should map lock routing', () => {
    Assert.isType('Function', app.lock)
  })
  it('should map msearch routing', () => {
    Assert.isType('Function', app.msearch)
  })
  it('should map merge routing', () => {
    Assert.isType('Function', app.merge)
  })
  it('should map mkactivity routing', () => {
    Assert.isType('Function', app.mkactivity)
  })
  it('should map mkcalendar routing', () => {
    Assert.isType('Function', app.mkcalendar)
  })
  it('should map mkcol routing', () => {
    Assert.isType('Function', app.mkcol)
  })
  it('should map move routing', () => {
    Assert.isType('Function', app.move)
  })
  it('should map notify routing', () => {
    Assert.isType('Function', app.notify)
  })
  it('should map options routing', () => {
    Assert.isType('Function', app.options)
  })
  it('should map patch routing', () => {
    Assert.isType('Function', app.patch)
  })
  it('should map post routing', () => {
    Assert.isType('Function', app.post)
  })
  it('should map propfind routing', () => {
    Assert.isType('Function', app.propfind)
  })
  it('should map proppatch routing', () => {
    Assert.isType('Function', app.proppatch)
  })
  it('should map purge routing', () => {
    Assert.isType('Function', app.purge)
  })
  it('should map put routing', () => {
    Assert.isType('Function', app.put)
  })
  it('should map rebind routing', () => {
    Assert.isType('Function', app.rebind)
  })
  it('should map report routing', () => {
    Assert.isType('Function', app.report)
  })
  it('should map source routing', () => {
    Assert.isType('Function', app.source)
  })
  it('should map subscribe routing', () => {
    Assert.isType('Function', app.subscribe)
  })
  it('should map trace routing', () => {
    Assert.isType('Function', app.trace)
  })
  it('should map unbind routing', () => {
    Assert.isType('Function', app.unbind)
  })
  it('should map unlink routing', () => {
    Assert.isType('Function', app.unlink)
  })
  it('should map unlock routing', () => {
    Assert.isType('Function', app.unlock)
  })
  it('should map unsubscribe routing', () => {
    Assert.isType('Function', app.unsubscribe)
  })
  it(`should have lib size below ${libSizeTargetKB}KB`, async () => {
    let libSize = 0
    async function walk (dir, fileList = []) {
      const files = await fs.readdir(dir)
      for (const file of files) {
        const stat = await fs.stat(fs.path.join(dir, file))
        if (stat.isDirectory()) fileList = await walk(fs.path.join(dir, file), fileList)
        else {
          fileList.push(fs.path.join(dir, file))
          libSize += stat.size
        }
      }
      return fileList
    }
    await walk(fs.path.join(__dirname, '../lib/'))
    Assert.maximum(libSizeTargetKB, libSize / 1024)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
