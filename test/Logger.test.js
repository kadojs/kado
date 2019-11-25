'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Logger = require('../lib/Logger')
let logger = new Logger()

describe('Logger',()=> {
  it('should construct',() => {
    let testLogger = new Logger()
    expect(testLogger).to.be.an('object')
  })
  it('should have no logger',() => {
    expect(logger.getLogger()).to.equal(null)
  })
  it('should setup a logger',() => {
    expect(logger.setup('kado','mm:hh:ss MM-DD-YYY')).to.be.an('object')
  })
  it('should have a logger',() => {
    expect(logger.getLogger()).to.be.an('object')
  })
  it('should reset',() => {
    expect(logger.reset()).to.equal(true)
  })
  it('should now not have a logger',() => {
    expect(logger.getLogger()).to.equal(null)
  })
})
