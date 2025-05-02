/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const fs = require('../lib/FileSystem')
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const ChildProcess = require('../lib/ChildProcess')
const child = new ChildProcess({
  path: fs.path.join(__dirname, '/fixture/childProcess.js'),
  fork: { silent: true }
})
child.setEnv({ test: 'test' })
runner.suite('ChildProcess', (it) => {
  it('should instantiate', () => {
    Assert.isType('ChildProcess', new ChildProcess())
  })
  it('should have our env setting', () => {
    const env = child.getEnv()
    Assert.isType('Object', env)
    Assert.eq(env.test, 'test')
  })
  it('should start', async () => {
    const rv = await child.start()
    Assert.isType('ChildProcess', rv)
    Assert.isType('number', rv.pid)
  })
  it('should stop', () => {
    return child.stop()
      .then((rv) => {
        Assert.isType('Array', rv)
        Assert.eq(rv[0], 0)
      })
      .catch((e) => { console.log(e) })
  })
  it('should respawn', () => {
    return child.start()
      .then(() => {
        child.once('child', (pid) => { Assert.isType('number', pid) })
        child.kill()
      })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
