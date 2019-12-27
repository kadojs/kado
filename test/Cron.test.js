'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('Cron',()=>{
  const { expect } = require('chai')
  const Cron = require('../lib/Cron')
  let cron = new Cron()
  it('should construct',()=>{
    let testCron = new Cron()
    expect(testCron).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(Object.keys(cron.all()).length).to.equal(0)
  })
  it('should add a cron',()=>{
    expect(cron.create('test','0 * * * *',()=>{},{})).to.be.an('object')
  })
  it('should show a cron exists',()=>{
    expect(cron.get('test')).to.be.an('object')
  })
  it('should show the cron in the list',()=>{
    expect(Object.keys(cron.all()).length).to.equal(1)
  })
  it('should show the cron via count',()=>{
    expect(cron.count()).to.equal(1)
  })
  it('should start the cron',()=>{
    expect(cron.start()).to.equal(1)
  })
  it('should stop the cron',()=>{
    expect(cron.stop()).to.equal(1)
  })
  it('should destroy the cron',()=>{
    expect(cron.destroy()).to.equal(1)
  })
})
