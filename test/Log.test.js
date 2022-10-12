'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2022 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
  const log = new Log()
  const logEngine = new Log.LogEngine({ name: logName, toConsole: false })
  log.addEngine('test', logEngine)
  /* additional test code
  const l = new Log()
  const engine = new Log.LogEngine()
  l.addEngine('test', engine)
  l.info('foo')
  l.error('bad')
  const err = new Error('test')
  l.dump(err)
  l.dump(2)
  l.dump(false)
  l.dump({ foo: 'foo' })
   */
  it('should construct', () => {
    Assert.isType('Log', log)
  })
  it('should dump variables', () => {
    log.dump(true)
  })
  it('should dump errors', () => {
    const error = new Error('testing')
    log.dump(error)
  })
  it('should dump objects', () => {
    const obj = { foo: 'foo' }
    log.dump(obj)
  })
  it('should dump null', () => {
    log.dump(null)
  })
  it('should dump numbers', () => {
    log.dump(35)
  })
  it('should print', () => {
    log.print('foo')
  })
  it('should log', () => {
    log.log('foo')
  })
  it('should have no logger', () => {
    Assert.eq(log.listEngines().length, 1)
  })
  it('should have no handlers', () => {
    Assert.eq(log.listEngines().length, 1)
  })
  it('should add an engine', () => {
    Assert.isType('LogEngine', log.addEngine(logName, logEngine))
  })
  it('should get the handler', () => {
    Assert.isType('LogEngine', log.getEngine(logName))
  })
  it('should activate the handler', () => {
    Assert.isType('LogEngine', log.activateEngine(logName))
  })
  it('should return the active handler', () => {
    Assert.isType('LogEngine', log.getActiveEngine())
  })
  it('should remove the handler', () => {
    Assert.eq(log.removeEngine(logName), true)
  })
  it('should no longer have the handler', () => {
    Assert.eq(log.getEngine(logName), false)
  })
  it('should now not have a logger', () => {
    Assert.eq(log.getActiveEngine(), null)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
