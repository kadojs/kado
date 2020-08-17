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
const PromiseMore = require('../lib/PromiseMore')
runner.suite('PromiseMore', (it) => {
  it('should have method', () => {
    Assert.isType('Function', PromiseMore.hoist)
    Assert.isType('AsyncFunction', PromiseMore.series)
  })
  it('should hoist', () => {
    const promise = PromiseMore.hoist()
    Assert.isType('Function', promise.resolve)
    Assert.isType('Function', promise.reject)
  })
  it('should make a promise out of a callback', async () => {
    const emitter = function (amount, cb) {
      amount += this.amount
      cb(null, amount)
    }
    const context = { amount: 10 }
    const answer = await PromiseMore.make(context, emitter, 5)
    Assert.eq(answer, 15)
  })
  it('should complete a series with context', async () => {
    const makeItem = () => { return { name: 'Apple' } }
    const makePromise = () => {
      return new Promise((resolve) => { resolve(1) })
    }
    const processItem = async (item, index, ctx) => {
      const result = await makePromise() // resolve some promise
      item.index = index + result // use the result
      ctx.amount -= item.index
      return item
    }
    const ctx = { amount: 20 }
    const itemList = []
    for (let i = 0; i < 5; i++) itemList.push(makeItem())
    const result = await PromiseMore.series(itemList, processItem, ctx)
    const reduce = (i, c) => { i.index += c.index; return i }
    const answer = result.reduce(reduce)
    Assert.eq(answer.index, 20)
    Assert.eq(ctx.amount, 0)
  })
  it('should work with while', async () => {
    let i = 15
    const k = 10
    const condition = () => { return i > k }
    const makePromise = () => { i--; return Promise.resolve() }
    await PromiseMore.while(condition, makePromise)
    Assert.eq(i, 10)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
