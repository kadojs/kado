/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Message = require('../lib/Message')
class OurMessage extends Message.MessageEngine {
  send (options) { return options }
}
runner.suite('Message', (it) => {
  const message = new Message()
  it('should construct', () => {
    Assert.isType('Message', new Message())
  })
  it('should have no engines', () => {
    Assert.eq(message.listEngines().length, 0)
  })
  it('should add a engine', () => {
    Assert.isType('OurMessage', message.addEngine('test', new OurMessage()))
  })
  it('should have a engine', () => {
    Assert.isType('OurMessage', message.getEngine('test'))
  })
  it('should remove a engine', () => {
    Assert.eq(message.removeEngine('test'), true)
  })
  it('should have no engines', () => {
    Assert.eq(message.listEngines().length, 0)
  })
  it('should accept a new engine', () => {
    Assert.isType('OurMessage', message.addEngine('test', new OurMessage()))
  })
  it('should send a message and see it in the handler', () => {
    return message.send('foo@foo.com', 'something to do')
      .then((result) => {
        result = result.test
        Assert.eq(result.to, 'foo@foo.com')
        Assert.eq(result.text, 'something to do')
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
