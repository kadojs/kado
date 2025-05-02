/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const HyperText = require('../lib/HyperText')
runner.suite('HyperText', (it) => {
  const hyperText = new HyperText()
  class OurEngine extends HyperText.HyperTextEngine {
    constructor () {
      super()
      this.engine = require('http').createServer((req, res) => {
        res.statusCode = 404
        res.end('Cannot GET ' + req.url)
      })
    }

    checkPort (port) {
      if (typeof port === 'string') port = parseInt(port, 10)
      if (!('' + port).match(/^\d+$/)) throw new Error(`Invalid port ${port}`)
      if (port > 65536 || port < 0) throw new Error(`Port ${port} out of range`)
    }

    checkHost (host) {
      if (typeof host !== 'string' && host !== null) {
        throw new Error(`Invalid host type ${typeof host}`)
      }
    }

    start (options) {
      const { port, host } = options
      this.checkEngine()
      this.checkPort(port)
      this.checkHost(host)
      const that = this
      return new Promise((resolve, reject) => {
        that.getEngine().listen(port, host, (err) => {
          if (err) return reject(err)
          resolve(that.getEngine())
        })
      })
    }

    stop () {
      this.checkEngine()
      const that = this
      return new Promise((resolve, reject) => {
        that.getEngine().close((err) => {
          if (err) return reject(err)
          resolve(true)
        })
      })
    }
  }
  function checkServer (port, host, uri) {
    const http = require('http')
    return new Promise((resolve, reject) => {
      const params = {
        port: port,
        host: host,
        method: 'GET',
        path: uri
      }
      const req = http.request(params)
      req.end()
      req.on('response', (res) => {
        let data = null
        res.setEncoding(('utf8'))
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          resolve(Assert.match(/Cannot GET \//, data))
        })
        res.on('error', reject)
      })
      req.on('error', reject)
    })
  }
  it('should construct', () => {
    Assert.isType('HyperText', new HyperText())
  })
  it('should have no engines', () => {
    Assert.eq(Object.keys(hyperText.allEngines()).length, 0)
  })
  it('should add a engine', () => {
    Assert.isType('OurEngine', hyperText.addEngine('express', new OurEngine()))
  })
  it('should have an engine', () => {
    Assert.isType('OurEngine', hyperText.getEngine('express'))
  })
  it('should have 1 total engines', () => {
    Assert.eq(hyperText.listEngines().length, 1)
  })
  it('should remove a handler', () => {
    Assert.eq(hyperText.removeEngine('express'), true)
  })
  it('should have no engines', () => {
    Assert.eq(hyperText.listEngines().length, 0)
  })
  it('should accept a new engine', () => {
    Assert.isType('OurEngine', hyperText.addEngine('ex', new OurEngine()))
  })
  it('should have the new handler', () => {
    Assert.isType('OurEngine', hyperText.getEngine('ex'))
  })
  it('should activate the new engine', () => {
    Assert.isType('OurEngine', hyperText.activateEngine('ex'))
  })
  it('should start the engine', async () => {
    const rv = await hyperText.start(null, { port: 3000, host: 'localhost' })
    Assert.isType('Server', rv.ex)
  })
  it('should be listening with the engine', async () => {
    Assert.eq(await checkServer(3000, 'localhost', '/'))
  })
  it('should stop the engine', async () => {
    const rv = await hyperText.stop()
    Assert.eq(rv.ex)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
