/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Cron = require('../lib/Cron')
runner.suite('Cron', (it) => {
  const cron = new Cron()
  it('should construct', () => {
    Assert.isType('Cron', new Cron())
  })
  it('should be empty', () => {
    Assert.eq(Object.keys(cron.all()).length, 0)
  })
  it('should add a cron', () => {
    const job = Cron.newJob().setSchedule('* * * * *').addHandler(() => {})
    Assert.isType('CronJob', cron.add('test', job))
  })
  it('should show a cron exists', () => {
    Assert.isType('CronJob', cron.get('test'))
  })
  it('should show the cron in the list', () => {
    Assert.eq(Object.keys(cron.all()).length, 1)
  })
  it('should show the cron via count', () => {
    Assert.eq(cron.count(), 1)
  })
  it('should start the cron', () => {
    Assert.isType('Timeout', cron.start())
  })
  it('should stop the cron', () => {
    Assert.eq(cron.stop())
  })
  it('should destroy the cron', () => {
    Assert.eq(cron.removeAll(), 1)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
