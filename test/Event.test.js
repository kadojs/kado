/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Event = require('../lib/Event')
class OurEvent extends Event.EventEngine {
  event (options) {
    Assert.isType('Object', options)
    Assert.isType('string', options.to)
    Assert.isType('string', options.text)
    Assert.isType('number', options.level)
    Assert.isType('Object', options.levelInfo)
    return Promise.resolve().then(() => { return options })
  }
}
runner.suite('Event', (it) => {
  const event = new Event()
  it('should construct', () => {
    Assert.isType('Event', new Event())
  })
  it('should have no engines', () => {
    Assert.eq(event.listEngines().length, 0)
  })
  it('should accept our test engine', () => {
    Assert.isType('OurEvent', event.addEngine('test', new OurEvent()))
  })
  it('should add another engine', () => {
    Assert.isType('OurEvent', event.addEngine('test2', new OurEvent()))
  })
  it('should show an engine exists', () => {
    Assert.isType('OurEvent', event.getEngine('test2'))
  })
  it('should show the engine exists in the list', () => {
    Assert.eq(event.listEngines().length, 2)
  })
  it('should remove an engine', () => {
    Assert.eq(event.removeEngine('test2'), true)
  })
  it('should show all engines', () => {
    Assert.eq(event.listEngines().length, 1)
  })
  it('should create an event an call our handler', () => {
    const levelInfo = event.getLevelInfo(3)
    return event.create({
      to: 'foo',
      module: 'test',
      text: 'some thing happened',
      level: 3,
      levelInfo: levelInfo
    }).then((result) => {
      // since many modules could have been processed only keep one
      result = result.test
      Assert.isType('Object', result)
      Assert.eq(result.text, 'some thing happened')
    })
  })
  it('should create using the digest method directly', () => {
    return event.create(event.digest(3, 'dude', 'some thing happened'))
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.text, 'some thing happened')
      })
  })
  it('should call using the error method', () => {
    return event.error('foo', 'some thing happened')
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.level, 0)
        Assert.eq(result.text, 'some thing happened')
      })
  })
  it('should call using the warn method', () => {
    return event.warn('foo', 'some thing happened')
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.level, 1)
        Assert.eq(result.text, 'some thing happened')
      })
  })
  it('should call using the info method', () => {
    return event.info('foo', 'some thing happened')
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.level, 2)
        Assert.eq(result.text, 'some thing happened')
      })
  })
  it('should call using the verbose method', () => {
    return event.verbose('foo', 'some thing happened')
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.level, 3)
        Assert.eq(result.text, 'some thing happened')
      })
  })
  it('should call using the debug method', () => {
    return event.debug('foo', 'some thing happened')
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.level, 4)
        Assert.eq(result.text, 'some thing happened')
      })
  })
  it('should call using the silly method', () => {
    return event.silly('foo', 'some thing happened')
      .then((result) => {
        result = result.test
        Assert.isType('Object', result)
        Assert.eq(result.level, 5)
        Assert.eq(result.text, 'some thing happened')
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
