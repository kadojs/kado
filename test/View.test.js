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
const ConnectEngine = require('../lib/ConnectEngine')
const View = require('../lib/View')
class ViewHelper extends ConnectEngine {}
runner.suite('View', (it) => {
  const view = new View()
  const handlerName = 'mustache'
  it('should construct', () => {
    expect.isType('View', new View())
  })
  it('should be empty', () => {
    expect.eq(view.listEngines().length, 0)
  })
  it('should error getting an engine with no active handler', () => {
    try {
      view.getActiveEngine()
    } catch (e) {
      expect.match(/no active engine/, e.message)
    }
  })
  it('should add an engine', () => {
    expect.isType('ViewHelper', view.addEngine(handlerName, new ViewHelper()))
  })
  it('should get an engine', () => {
    expect.isType('ViewHelper', view.getEngine(handlerName))
  })
  it('should activate an engine', () => {
    expect.isType('ViewHelper', view.activateEngine(handlerName))
  })
  it('should provide an engine now', () => {
    expect.isType('ViewHelper', view.getActiveEngine())
  })
  it('should show in all handlers', () => {
    expect.eq(view.listEngines().length, 1)
  })
  it('should remove a handler', () => {
    expect.eq(view.removeEngine(handlerName), true)
  })
  it('should add a view', () => {
    expect.eq(view.add('home', 'home'), 'home')
  })
  it('should get the view', () => {
    expect.eq(view.get('home'), 'home')
  })
  it('should list the view', () => {
    expect.eq(Object.keys(view.all()).length, 1)
  })
  it('should remove the view', () => {
    expect.eq(view.remove('home'), 'home')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
