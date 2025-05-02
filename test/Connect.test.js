/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Connect = require('../lib/Connect')
const ConnectEngine = Connect.ConnectEngine
runner.suite('Connect', (it) => {
  class CDN extends Connect {
    connect (name, options) {
      return Connect.each(this, name, options, 'connect')
    }
  }
  const cdn = new CDN()
  class Prism extends ConnectEngine {
    connect (opt) {
      if (!opt.user || !opt.pass || !opt.host) {
        throw new Error('missing parameters')
      }
      return Promise.resolve('cdn.stretchfs.com')
    }
  }
  it('should construct', () => {
    Assert.isType('Connect', new Connect())
  })
  it('should accept a new engine', () => {
    Assert.isType('Prism', cdn.addEngine(
      'stretchfs',
      new Prism('test', 'test', 'localhost')
    ))
  })
  it('should have the new engine instance', () => {
    Assert.isType('Prism', cdn.getEngine('stretchfs'))
  })
  it('should have no active engine', () => {
    Assert.eq(cdn.getActiveEngine(), null)
  })
  it('should activate an engine', () => {
    Assert.isType('Prism', cdn.activateEngine('stretchfs'))
  })
  it('should get active engine', () => {
    Assert.isType('Prism', cdn.getActiveEngine())
  })
  it('should deactivate engine', () => {
    Assert.eq(cdn.deactivateEngine())
  })
  it('should have no active engine again', () => {
    Assert.eq(cdn.getActiveEngine(), null)
  })
  it('should remove engine instance', () => {
    Assert.eq(cdn.removeEngine('stretchfs'))
  })
  it('should have no active instance', () => {
    Assert.eq(cdn.getActiveEngine(), null)
  })
  it('should no longer have the engine handle', () => {
    Assert.eq(cdn.getEngine('stretchfs'), false)
  })
  it('should accept a new engine instance', () => {
    Assert.isType('Prism', cdn.addEngine(
      'stretchfs',
      new Prism('test', 'test', 'localhost')
    ))
  })
  it('should attempt connect and fail', () => {
    return cdn.connect('stretchfs', {
      user: 'test', pass: 'test', host: 'test'
    })
      .then((result) => {
        Assert.eq(result, 'cdn.stretchfs.com')
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
