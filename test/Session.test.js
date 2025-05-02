/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Session = require('../lib/Session')
const agent = 'ie1'
const ip = '127.0.0.1'
const uid = 1
const storeMemory = new Session.SessionStoreMemory()
const session = new Session('test', ip, agent, uid, storeMemory)
runner.suite('Session', (it) => {
  it('should instantiate', () => {
    const inst = new Session('foo', ip, agent, uid, storeMemory)
    Assert.isType('Session', inst)
  })
  it('should generate a sid', () => {
    const rv = Session.generateId(ip, agent, 'foo')
    Assert.isType('string', rv)
    Assert.eq(rv.length, 40)
    Assert.eq(rv.match(/^[0-9a-f]+$/).length, 1)
  })
  it('should restore by sid', async () => {
    const rv = await session.restore()
    Assert.isType('Object', rv)
    Assert.eq(Object.keys(rv).length, 0)
  })
  it('should set and get a key', () => {
    Assert.isType('Session', session.set('foo', 'bar', { save: false }))
    Assert.eq(session.get('foo'), 'bar')
  })
  it('should set and save', async () => {
    const rv = session.set('foo', 'baz')
    Assert.isType('Promise', rv)
    await rv
    Assert.eq(session.get('foo'), 'baz')
  })
  it('should save the data to the store', async () => {
    const rv = await session.save()
    Assert.isType('SessionStoreMemory', rv)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
