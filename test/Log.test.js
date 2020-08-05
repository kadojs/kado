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
const Log = require('../lib/Log')
runner.suite('Log', (it) => {
  const logName = 'kado'
  const log = new Log.LogEngine({ name: logName })
  const logEngine = new Log(null, log)
  it('should construct', () => {
    Assert.isType('Log', new Log())
  })
  it('should have no logger', () => {
    console.log(logEngine.listEngines())
    Assert.eq(logEngine.listEngines().length, 0)
  })
  it('should have no handlers', () => {
    Assert.eq(logEngine.listEngines().length, 0)
  })
  it('should add an engine', () => {
    Assert.isType('LogEngine', logEngine.addEngine(logName, log))
  })
  it('should get the handler', () => {
    Assert.isType('LogEngine', logEngine.getEngine(logName))
  })
  it('should activate the handler', () => {
    Assert.isType('LogEngine', logEngine.activateEngine(logName))
  })
  it('should return the active handler', () => {
    Assert.isType('LogEngine', logEngine.getActiveEngine())
  })
  it('should remove the handler', () => {
    Assert.eq(logEngine.removeEngine(logName), true)
  })
  it('should no longer have the handler', () => {
    Assert.eq(logEngine.getEngine(logName), false)
  })
  it('should now not have a logger', () => {
    Assert.eq(logEngine.getActiveEngine(), null)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
