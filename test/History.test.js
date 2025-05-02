/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const History = require('../lib/History')
runner.suite('History', (it) => {
  const history = new History()
  it('should construct', () => {
    Assert.isType('History', new History())
  })
  it('should be empty', () => {
    Assert.eq(history.all().length, 0)
  })
  it('should add crumb entry', () => {
    Assert.eq(history.add('/test', 'Test', 'fa fa-plus').name, 'Test')
  })
  it('should save the entries', () => {
    const req = { session: {} }
    history.save(req)
    Assert.isType('Array', req.session.breadcrumb)
  })
  it('should restore the entries', () => {
    const req = { session: {} }
    req.session.breadcrumb = [{ uri: '/test', name: 'Test', icon: 'fa fa-plus' }]
    history.restore(req)
    Assert.eq(history.all().length, 1)
  })
  it('should accept middleware request', () => {
    const Nav = require('../lib/Navigation')
    const Util = require('../lib/Util')
    const app = { nav: new Nav(), util: new Util() }
    app.nav.addGroup('/test', 'Test', 'fa-fa-plus')
    const req = { session: {}, url: '/test', method: 'GET' }
    Assert.isType('Array', history.middleware(app, req))
    Assert.eq(history.all()[0].name, 'Test')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
