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
const { expect } = require('../lib/Assert')
const Log = require('../lib/Log')
runner.suite('Log', (it) => {
  const logger = new Log()
  const loggerName = 'winston'
  // const LogHelper = require('../lib/logger/winston')
  const LogHelper = class {}
  it('should construct', () => {
    expect.isType('Log', new Log())
  })
  it('should have no logger', () => {
    expect.eq(logger.getLog(), null)
  })
  it('should have no handlers', () => {
    expect.eq(Object.keys(logger.allHandlers()).length, 0)
  })
  it('should add a handler', () => {
    expect.eq(logger.addHandler(loggerName, new LogHelper()), loggerName)
  })
  it('should get the handler', () => {
    expect.isType('LogHelper', logger.getHandler(loggerName))
  })
  it('should activate the handler', () => {
    expect.eq(logger.activateHandler(loggerName), loggerName)
  })
  it('should return the active handler', () => {
    expect.isType('LogHelper', logger.getLog())
  })
  it('should remove the handler', () => {
    expect.eq(logger.removeHandler(loggerName), loggerName)
  })
  it('should no longer have the handler', () => {
    expect.eq(logger.getHandler(loggerName), false)
  })
  it('should still have an activated instance', () => {
    expect.isType('LogHelper', logger.getLog())
  })
  it('should reset', () => {
    expect.eq(logger.reset(), true)
  })
  it('should now not have a logger', () => {
    expect.eq(logger.getLog(), null)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
