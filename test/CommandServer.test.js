'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Kado = require('../lib/Kado')
const app = new Kado()
const CommandLine = require('../lib/CommandServer')
const cli = new CommandLine(app)
const testCommand = {
  description: 'test',
  options: [
    {definition: '-t, --test <s>', description: 'Test'}
  ],
  action: (opts)=>{
    return opts.test || opts.t
  }
}

describe('CommandLine',()=> {
  it('should construct',() => {
    let testCli = new CommandLine(app)
    expect(testCli).to.be.an('object')
  })
  it('should have no commands',() => {
    expect(Object.keys(cli.all()).length).to.equal(0)
  })
  it('should add a command',() => {
    expect(cli.command('test','test',testCommand)).to.equal('test')
  })
  it('should have the command',() => {
    expect(cli.getCommand('test','test')).to.be.an('object')
  })
  it('should remove the command',() => {
    expect(cli.removeCommand('test','test')).to.equal('test')
  })
  it('should should add a new command',() => {
    expect(cli.command('test','test',testCommand)).to.equal('test')
  })
  it('should show in all commands',() => {
    expect(cli.all().test).to.be.an('object')
  })
  it('should run a command programtically',async () => {
    return expect(await cli.run('test test -t test')).to.equal('test')
  })
  it('should run a command with a full switch',async () => {
    return expect(await cli.run('test test --test test')).to.equal('test')
  })
})
