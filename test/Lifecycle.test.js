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
const Lifecycle = require('../lib/Lifecycle')
const lifecycle = new Lifecycle()
let first = null
let second = null
let tick = null
lifecycle.on('start', () => { tick = true })
lifecycle.on('stop', () => { tick = false })
runner.suite('Lifecycle', (it) => {
  it('should instantiate', () => {
    Assert.isType('Lifecycle', new Lifecycle())
  })
  it('should have no items', () => {
    Assert.eq(lifecycle.list().length, 0)
  })
  it('should add an item', () => {
    Assert.eq(lifecycle.add('test').title, 'test')
  })
  it('should get an item', () => {
    Assert.eq(lifecycle.get('test').title, 'test')
  })
  it('should remove an item', () => {
    Assert.eq(lifecycle.remove('test').title, 'test')
  })
  it('should have no items now', () => {
    Assert.eq(lifecycle.list().length, 0)
  })
  it('should add a new item', () => {
    Assert.eq(lifecycle.add('first',
      () => { first = true },
      () => { first = false }
    ).title, 'first')
  })
  it('should add another new item', () => {
    Assert.eq(lifecycle.add('second',
      () => { second = true },
      () => { second = false }
    ).title, 'second')
  })
  it('should start both items', () => {
    return lifecycle.start()
      .then(() => {
        Assert.eq(tick)
        Assert.eq(first)
        Assert.eq(second)
      })
  })
  it('should stop both items', () => {
    return lifecycle.stop()
      .then(() => {
        Assert.eq(tick, false)
        Assert.eq(first, false)
        Assert.eq(second, false)
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
