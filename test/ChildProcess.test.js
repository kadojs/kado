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
const fs = require('../lib/FileSystem')
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const ChildProcess = require('../lib/ChildProcess')
const child = new ChildProcess({
  path: fs.path.join(__dirname, '/fixture/childProcess.js'),
  fork: { silent: true }
})
child.setEnv({ test: 'test' })
runner.suite('ChildProcess', (it) => {
  it('should instantiate', () => {
    Assert.isType('ChildProcess', new ChildProcess())
  })
  it('should have our env setting', () => {
    const env = child.getEnv()
    Assert.isType('Object', env)
    Assert.eq(env.test, 'test')
  })
  it('should start', async () => {
    const rv = await child.start()
    Assert.isType('ChildProcess', rv)
    Assert.isType('number', rv.pid)
  })
  it('should stop', () => {
    return child.stop()
      .then((rv) => {
        Assert.isType('Array', rv)
        Assert.eq(rv[0], 0)
      })
      .catch((e) => { console.log(e) })
  })
  it('should respawn', () => {
    return child.start()
      .then(() => {
        child.once('child', (pid) => { Assert.isType('number', pid) })
        child.kill()
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
