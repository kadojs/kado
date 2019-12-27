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
