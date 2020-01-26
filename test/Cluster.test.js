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
const Cluster = require('../lib/Cluster')
const cluster = new Cluster()
runner.suite('Cluster', (it) => {
  it('should instantiate', () => {
    expect.isType('Cluster', new Cluster())
  })
  it('should set env', () => {
    const rv = cluster.setEnv({ test: 'test' })
    expect.isType('Cluster', rv)
  })
  it('should have the set env', () => {
    const rv = cluster.getEnv()
    expect.isType('Object', rv)
    expect.eq(rv.test, 'test')
  })
  it('should set path', () => {
    const newPath = path.join(__dirname, '/fixture/worker.js')
    const rv = cluster.setPath(newPath)
    expect.isType('Cluster', rv)
    expect.eq(rv.path, newPath)
  })
  it('should start')
  it('should send messages')
  it('should respawn crashed workers')
  it('should stop')
  it('should start again')
  it('should restart')
  it('should kill')
  it('should exit')
})
if (require.main === module) runner.execute().then(code => process.exit(code))
