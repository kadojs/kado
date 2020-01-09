'use strict';
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
const CommandServer = require('../lib/CommandServer')
runner.suite('CommandServer',(it)=>{
  const cli = new CommandServer()
  cli.setVersion(require('../package.json').version)
  const testCommand = {
    description: 'test',
    options: [
      {definition: '-t, --test <s>', description: 'Test'}
    ],
    action: (opts)=>{
      return opts.test || opts.t
    }
  }
  it('should construct',() => {
    expect.isType('CommandServer',new CommandServer())
  })
  it('should have no commands',() => {
    expect.eq(Object.keys(cli.all()).length,0)
  })
  it('should add a command',() => {
    expect.eq(cli.command('test','test',testCommand),'test')
  })
  it('should have the command',() => {
    expect.isType('Command',cli.getCommand('test','test'))
  })
  it('should remove the command',() => {
    expect.eq(cli.removeCommand('test','test'),'test')
  })
  it('should should add a new command',() => {
    expect.eq(cli.command('test','test',testCommand),'test')
  })
  it('should show in all commands',() => {
    expect.isType('Object',cli.all().test)
  })
  it('should run a command programmatically',async () => {
    return expect.eq(await cli.run('test test -t test'),'test')
  })
  it('should run a command with a full switch',async () => {
    return expect.eq(await cli.run('test test --test=test'),'test')
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
