/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Command = require('../lib/Command')
const CommandServer = Command.CommandServer
runner.suite('CommandServer', (it) => {
  const cli = new CommandServer()
  cli.setVersion(require('../package.json').version)
  const testCommand = {
    description: 'test',
    options: [
      { definition: '-t, --test <s>', description: 'Test' }
    ],
    action: (opts) => {
      return opts.test || opts.t
    }
  }
  it('should construct', () => {
    Assert.isType('CommandServer', new CommandServer())
  })
  it('should have no commands', () => {
    Assert.eq(Object.keys(cli.all()).length, 0)
  })
  it('should add a command', () => {
    Assert.eq(cli.command('test', 'test', testCommand), 'test')
  })
  it('should have the command', () => {
    Assert.isType('Command', cli.getCommand('test', 'test'))
  })
  it('should remove the command', () => {
    Assert.eq(cli.removeCommand('test', 'test'), 'test')
  })
  it('should should add a new command', () => {
    Assert.eq(cli.command('test', 'test', testCommand), 'test')
  })
  it('should show in all commands', () => {
    Assert.isType('Object', cli.all().test)
  })
  it('should run a command programmatically', async () => {
    return Assert.eq(await cli.run('test test -t test'), 'test')
  })
  it('should run a command with a full switch', async () => {
    return Assert.eq(await cli.run('test test --test=test'), 'test')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
