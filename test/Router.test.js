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
const Application = require('../lib/Application')
const Router = require('../lib/Router')
runner.suite('Router', (it) => {
  const router = new Router()
  const middlewareTest = () => { return 'test' }
  const finalHandler = () => { return 'final' }
  it('should construct', () => {
    Assert.isType('Router', new Router())
  })
  it('should have no routes', () => {
    Assert.eq(Object.keys(router.all()).length, 0)
  })
  it('should add middleware', () => {
    router.use(middlewareTest)
    Assert.assert(router.middleware[0].fn, middlewareTest)
  })
  it('should remove middleware', () => {
    router.unuse(middlewareTest)
    Assert.eq(router.middleware[0], undefined)
  })
  it('should replace final handler', () => {
    router.final(finalHandler)
    Assert.assert(router.finalHandler, finalHandler)
  })
  it('should set a preparer', () => {
    const app = new Application()
    router.setPreparer(Router.standardPreparation(app))
    const preparer = router.getPreparer()
    Assert.isType('Function', preparer)
    Assert.eq('standardPreparation', preparer.name)
  })
  it('should add a route', () => {
    Assert.eq(router.add('GET', '/', () => {}).uri, '/')
  })
  it('should have a route', () => {
    Assert.eq(router.get('GET', '/').uri, '/')
  })
  it('should accept a route update', () => {
    Assert.eq(router.update('GET', '/', () => { return false }).uri, '/')
  })
  it('should show the route update', () => {
    Assert.isOk(router.get('GET', '/').fn.toString().match('false'))
  })
  it('should show the route in all', () => {
    Assert.eq(Object.keys(router.all()).length, 1)
  })
  it('should export the routes for template usage', () => {
    Assert.eq(router.allForTemplate()._, '/')
  })
  it('should remove the route', () => {
    Assert.eq(router.remove('GET', '/'), true)
  })
  it('should not have the route', () => {
    Assert.eq(router.get('/'), false)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
