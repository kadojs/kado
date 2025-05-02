/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')
const Connect = require('./Connect')
const ConnectEngine = Connect.ConnectEngine
class EventEngine extends ConnectEngine {
  event () {
    this.checkEngine()
    throw new Error('EventEngine.event() must be extended')
  }
}
class Event extends Connect {
  static getInstance () { return new Event() }
  constructor () {
    super()
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      verbose: 3,
      debug: 4,
      silly: 5
    }
    this.levelInfo = {
      0: { name: 'error', title: 'Error' },
      1: { name: 'warn', title: 'Warning' },
      2: { name: 'info', title: 'Info' },
      3: { name: 'verbose', title: 'Verbose' },
      4: { name: 'debug', title: 'Debug' },
      5: { name: 'silly', title: 'Silly' }
    }
  }

  event (name, options) {
    return Connect.each(this, name, options, 'event')
  }

  allLevels () {
    return this.levels
  }

  getLevelInfo (level) {
    return this.levelInfo[level]
  }

  create (options) {
    Assert.isOk(typeof options === 'object',
      `Invalid options passed to event creation: ${options}`)
    return this.event(options)
  }

  digest (level, to, text, options) {
    Assert.isOk(level !== undefined,
      `Tried to digest event params with ${level}`)
    const levelName = this.levelInfo[level].name
    Assert.isOk(!(!to && !text && !options),
      'Call to event with no parameters, level: ' + levelName)
    // assume options when left out
    if (!options || typeof options !== 'object') options = {}
    // when no message assume global message
    if (!text) {
      options.to = 'all'
      options.text = to
    } else {
      options.to = to
      options.text = text
    }
    // now setup all the proper options
    Assert.isOk(options.to, 'Cant digest event no recipient')
    Assert.isOk(options.text, 'Cant digest event no text')
    if (!options.module) options.module = 'global'
    options.level = level
    options.levelInfo = this.levelInfo[level]
    return options
  }

  error (to, text, options) {
    return this.create(this.digest(this.levels.error, to, text, options))
  }

  warn (to, text, options) {
    return this.create(this.digest(this.levels.warn, to, text, options))
  }

  info (to, text, options) {
    return this.create(this.digest(this.levels.info, to, text, options))
  }

  verbose (to, text, options) {
    return this.create(this.digest(this.levels.verbose, to, text, options))
  }

  debug (to, text, options) {
    return this.create(this.digest(this.levels.debug, to, text, options))
  }

  silly (to, text, options) {
    return this.create(this.digest(this.levels.silly, to, text, options))
  }
}
Event.EventEngine = EventEngine
module.exports = Event
