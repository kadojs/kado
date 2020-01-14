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
  const connector = new Connect()
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
  it('should accept a new connector', () => {
    expect.isType('Prism', connector.addEngine(
      'stretchfs',
      new Prism('test', 'test', 'localhost')
    ))
  })
  it('should have the new connector instance', () => {
    expect.isType('Prism', connector.getEngine('stretchfs'))
  })
  it('should remove connector instance', () => {
    expect.eq(connector.removeEngine('stretchfs'))
  })
  it('should no longer have the connector handle', () => {
    expect.eq(connector.getEngine('stretchfs'), false)
  })
  it('should accept a new connector instance', () => {
    expect.isType('Prism', connector.addEngine(
      'stretchfs',
      new Prism('test', 'test', 'localhost')
    ))
  })
  it('should attempt connect and fail', () => {
    return connector.connect('stretchfs', {
      user: 'test', pass: 'test', host: 'test'
    })
      .then((result) => {
        expect.eq(result, 'cdn.stretchfs.com')
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
