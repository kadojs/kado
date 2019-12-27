'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
