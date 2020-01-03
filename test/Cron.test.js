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
const runner = require('../lib/TestRunner').getInstance('Kado')
const { expect } = require('../lib/Validate')
const Cron = require('../lib/Cron')
runner.suite('Cron',(it)=>{
  let cron = new Cron()
  it('should construct',()=>{
    expect.isType('Cron',new Cron())
  })
  it('should be empty',()=>{
    expect.eq(Object.keys(cron.all()).length,0)
  })
  it('should add a cron',()=>{
    const job = Cron.newJob().setSchedule('* * * * *').addHandler(()=>{})
    expect.isType('CronJob',cron.add('test',job))
  })
  it('should show a cron exists',()=>{
    expect.isType('CronJob',cron.get('test'))
  })
  it('should show the cron in the list',()=>{
    expect.eq(Object.keys(cron.all()).length,1)
  })
  it('should show the cron via count',()=>{
    expect.eq(cron.count(),1)
  })
  it('should start the cron',()=>{
    expect.isType('Timeout',cron.start())
  })
  it('should stop the cron',()=>{
    expect.eq(cron.stop())
  })
  it('should destroy the cron',()=>{
    expect.eq(cron.removeAll(),1)
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
