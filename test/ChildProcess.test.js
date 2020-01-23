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
const path = require('path')
const runner = require('../lib/TestRunner').getInstance('Kado')
const { expect } = require('../lib/Assert')
const ChildProcess = require('../lib/ChildProcess')
const child = new ChildProcess({
  path: path.join(__dirname, '/fixture/childProcess.js'),
  fork: { silent: true }
})
runner.suite('ChildProcess', (it) => {
  it('should instantiate', () => {
    expect.isType('ChildProcess', new ChildProcess())
  })
  it('should start', async () => {
    const rv = await child.start()
    expect.isType('ChildProcess', rv)
    expect.isType('number', rv.pid)
  })
  it('should stop', () => {
    return child.stop()
      .then((rv) => {
        expect.isType('Array', rv)
        expect.eq(rv[0], 0)
      })
      .catch((e) => { console.log(e) })
  })
  it('should respawn', () => {
    return child.start()
      .then(() => {
        child.once('child', (pid) => { expect.isType('number', pid) })
        child.kill()
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
