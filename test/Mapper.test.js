/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Mapper = require('../lib/Mapper')
runner.suite('Mapper', (it) => {
  const mapper = new Mapper()
  it('should construct', () => {
    Assert.isType('Mapper', new Mapper())
  })
  it('should map an object', () => {
    const productList = { test1: 'foo', test2: 'bar', test3: 'baz' }
    const keyList = ['test1', 'test2', 'test3']
    const valueList = ['foo', 'bar', 'baz']
    Mapper.getInstance(productList).map((value, key) => {
      const keyTest = keyList.shift()
      const valueTest = valueList.shift()
      Assert.isOk(key === keyTest, 'Failed key match')
      Assert.isOk(value === valueTest, 'Failed value match')
      return value
    })
  })
  it('should set a value with a string', () => {
    Assert.eq(mapper.set('foo1', 'bar'), 'bar')
  })
  it('should set a value with an array', () => {
    Assert.eq(mapper.set(['foo2'], 'bar'), 'bar')
  })
  it('should set deep value with an array', () => {
    Assert.eq(mapper.set(['foo3', 'bar'], 'baz'), 'baz')
  })
  it('should set deep value with a string', () => {
    Assert.eq(mapper.set('foo4.bar.baz.boo', 'bap'), 'bap')
  })
  it('should get a value with a string', () => {
    Assert.eq(mapper.get('foo1'), 'bar')
  })
  it('should get a value with an array', () => {
    Assert.eq(mapper.get(['foo2']), 'bar')
  })
  it('should get a deep value with an array', () => {
    Assert.eq(mapper.get(['foo3', 'bar']), 'baz')
  })
  it('should get a deep value with a string', () => {
    Assert.eq(mapper.get('foo4.bar.baz.boo'), 'bap')
  })
  it('should delete a value with a string', () => {
    Assert.eq(mapper.delete('foo1'), 'foo1')
  })
  it('should delete a value with an array', () => {
    Assert.eq(mapper.delete(['foo2']), 'foo2')
  })
  it('should delete a deep value with an array', () => {
    Assert.eq(mapper.delete(['foo3', 'bar']), 'bar')
  })
  it('should set a value', () => {
    Assert.eq(mapper.set('foo1', 'bap'), 'bap')
  })
  it('should list all values', () => {
    Assert.eq(mapper.all().foo1, 'bap')
  })
  it('should merge an object in', () => {
    Assert.eq(mapper.merge({ foo5: 'bar' }).foo5, 'bar')
  })
  it('should merge in a 2 level object', () => {
    Assert.eq(mapper.merge({ foo6: { foo7: 'bar' } }).foo6.foo7, 'bar')
  })
  it('should merge into the 2 level object', () => {
    Assert.eq(mapper.merge({ foo6: { foo8: 'bar' } }).foo6.foo8, 'bar')
    Assert.eq(mapper.foo6.foo7, 'bar')
  })
  it('should merge a 3rd level into the 2nd', () => {
    Assert.isType('Mapper',
      mapper.merge({ foo6: { foo9: { foo10: { pies: ['apple'] } } } }))
    Assert.isType('Array', mapper.foo6.foo9.foo10.pies)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
