/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const fs = require('../lib/FileSystem')
const Assert = require('../lib/Assert')
const View = require('../lib/View')
const ViewEngine = View.ViewEngine
runner.suite('View', (it) => {
  const view = new View()
  const handlerName = 'mustache'
  it('should construct', () => {
    Assert.isType('View', new View())
  })
  it('should be empty', () => {
    Assert.eq(view.listEngines().length, 0)
  })
  it('should error getting an engine with no active handler', () => {
    try {
      view.getActiveEngine()
    } catch (e) {
      Assert.match(/no active engine/, e.message)
    }
  })
  it('should add an engine', () => {
    Assert.isType('ViewEngine', view.addEngine(handlerName, new ViewEngine()))
  })
  it('should get an engine', () => {
    Assert.isType('ViewEngine', view.getEngine(handlerName))
  })
  it('should activate an engine', () => {
    Assert.isType('ViewEngine', view.activateEngine(handlerName))
  })
  it('should provide an engine now', () => {
    Assert.isType('ViewEngine', view.getActiveEngine())
  })
  it('should show in all handlers', () => {
    Assert.eq(view.listEngines().length, 1)
  })
  it('should remove a handler', () => {
    Assert.eq(view.removeEngine(handlerName), true)
  })
  it('should add a view', () => {
    Assert.eq(view.add('home', 'home'), 'home')
  })
  it('should get the view', () => {
    Assert.eq(view.get('home'), 'home')
  })
  it('should list the view', () => {
    Assert.eq(Object.keys(view.all()).length, 1)
  })
  it('should remove the view', () => {
    Assert.eq(view.remove('home'), 'home')
  })
  it('should process middleware', async () => {
    const viewFolder = fs.path.resolve('./test/fixture/View')
    const engine = new View.ViewMustache(viewFolder)
    // add middleware
    engine.use((view) => {
      if (view.params.captchaEnabled) view.params.captchaKey = 'something'
    })
    engine.use((view) => {
      if (!req.isJSON) return // continue through middleware
      res.json(view.params)
      return true // halt middleware processing since the response was sent
    })
    const blankfn = () => {}
    const options = {}
    const params = { things: 'stuff', captchaEnabled: true }
    const req = { headers: {} }
    const res = {
      setHeader: blankfn,
      end: (data) => {
        Assert.isType('string', data)
        Assert.isOk(data.match('stuff'), 'Missing content')
      }
    }
    const template = 'template'
    const rv = await engine.render(req, res, template, params, options)
    Assert.isType('object', rv)
    Assert.isType('string', rv.body)
    Assert.isOk(rv.body.match('stuff'), 'Missing content')
    Assert.isOk(rv.params.captchaKey === 'something', 'Missing parameter mod')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
