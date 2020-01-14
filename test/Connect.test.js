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
const { expect } = require('../lib/Assert')
const Connect = require('../lib/Connect')
const ConnectEngine = require('../lib/ConnectEngine')
runner.suite('Connect', (it) => {
  const cdn = new Connect()
  class Prism extends ConnectEngine {
    connect (opt) {
      if (!opt.user || !opt.pass || !opt.host) {
        throw new Error('missing parameters')
      }
      return Promise.resolve('cdn.stretchfs.com')
    }
  }
  it('should construct', () => {
    expect.isType('Connect', new Connect())
  })
  it('should accept a new engine', () => {
    expect.isType('Prism', cdn.addEngine(
      'stretchfs',
      new Prism('test', 'test', 'localhost')
    ))
  })
  it('should have the new engine instance', () => {
    expect.isType('Prism', cdn.getEngine('stretchfs'))
  })
  it('should have no active engine', () => {
    expect.eq(cdn.getActiveEngine(), null)
  })
  it('should activate an engine', () => {
    expect.isType('Prism', cdn.activateEngine('stretchfs'))
  })
  it('should get active engine', () => {
    expect.isType('Prism', cdn.getActiveEngine())
  })
  it('should deactivate engine', () => {
    expect.eq(cdn.deactivateEngine())
  })
  it('should have no active engine again', () => {
    expect.eq(cdn.getActiveEngine(), null)
  })
  it('should remove engine instance', () => {
    expect.eq(cdn.removeEngine('stretchfs'))
  })
  it('should have no active instance', () => {
    expect.eq(cdn.getActiveEngine(), null)
  })
  it('should no longer have the engine handle', () => {
    expect.eq(cdn.getEngine('stretchfs'), false)
  })
  it('should accept a new engine instance', () => {
    expect.isType('Prism', cdn.addEngine(
      'stretchfs',
      new Prism('test', 'test', 'localhost')
    ))
  })
  it('should attempt connect and fail', () => {
    return cdn.connect('stretchfs', {
      user: 'test', pass: 'test', host: 'test'
    })
      .then((result) => {
        expect.eq(result, 'cdn.stretchfs.com')
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
