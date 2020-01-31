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
