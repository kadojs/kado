/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
