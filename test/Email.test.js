/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Email = require('../lib/Email')
runner.suite('Email', (it) => {
  const email = new Email()
  class OurEmail extends Email.EmailEngine {
    connect () {
      this.server = {
        ready: false,
        send: (options, cb) => { cb(null, true) },
        sending: false,
        smtp: {}
      }
      return this.server
    }
  }
  it('should construct', () => {
    Assert.isType('Email', new Email())
  })
  it('should accept a new engine', () => {
    Assert.isType('OurEmail', email.addEngine('test', new OurEmail()))
  })
  it('should have the new engine instance', () => {
    Assert.isType('OurEmail', email.getEngine('test'))
  })
  it('should remove the engine', () => {
    Assert.eq(email.removeEngine('test'), true)
  })
  it('should no longer have the engine', () => {
    Assert.eq(email.getEngine('test'), false)
  })
  it('should accept a new engine instance', () => {
    Assert.isType('OurEmail', email.addEngine('test', new OurEmail()))
  })
  it('should attempt connect and fail', () => {
    const result = email.getEngine('test').connect()
    Assert.eq(result.sending, false)
    Assert.eq(result.ready, false)
    Assert.isType('Object', result.smtp)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
