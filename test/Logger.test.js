'use strict';
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

describe('Logger',()=> {
  const { expect } = require('chai')
  const Logger = require('../lib/Logger')
  const loggerName = 'winston'
  //const LogHelper = require('../lib/logger/winston')
  const LogHelper = class {}
  const logger = new Logger()
  it('should construct',() => {
    let testLogger = new Logger()
    expect(testLogger).to.be.an('object')
  })
  it('should have no logger',() => {
    expect(logger.getLogger()).to.equal(null)
  })
  it('should have no handlers',()=>{
    expect(Object.keys(logger.allHandlers()).length).to.equal(0)
  })
  it('should add a handler',()=>{
    expect(logger.addHandler(loggerName,new LogHelper())).to.equal(loggerName)
  })
  it('should get the handler',()=>{
    expect(logger.getHandler(loggerName)).to.be.an('object')
  })
  it('should activate the handler',()=>{
    expect(logger.activateHandler(loggerName)).to.equal(loggerName)
  })
  it('should return the active handler',()=>{
    expect(logger.getLogger()).to.be.an('object')
  })
  it('should remove the handler',()=>{
    expect(logger.removeHandler(loggerName)).to.equal(loggerName)
  })
  it('should no longer have the handler',()=>{
    expect(logger.getHandler(loggerName)).to.equal(false)
  })
  it('should still have an activated instance',()=>{
    expect(logger.getLogger()).to.be.an('object')
  })
  it('should reset',() => {
    expect(logger.reset()).to.equal(true)
  })
  it('should now not have a logger',() => {
    expect(logger.getLogger()).to.equal(null)
  })
})
