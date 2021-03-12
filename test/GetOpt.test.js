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
const GetOpt = require('../lib/GetOpt')
runner.suite('GetOpt', (it) => {
  let parser
  it('should parse optstr=\'\' with ARGV=[]', () => {
    parser = new GetOpt([], '')
    Assert.eq(parser.gop_silent, false)
    Assert.eqDeep(parser.gop_options, {})
    Assert.eqDeep(parser.gop_aliases, {})
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':\' with ARGV=[]', () => {
    parser = new GetOpt([], ':')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, {})
    Assert.eqDeep(parser.gop_aliases, {})
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':l\' with ARGV=[]', () => {
    parser = new GetOpt([], ':l')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, { l: false })
    Assert.eqDeep(parser.gop_aliases, {})
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':l:\' with ARGV=[]', () => {
    parser = new GetOpt([], ':l:')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, { l: true })
    Assert.eqDeep(parser.gop_aliases, {})
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':las\' with ARGV=[]', () => {
    parser = new GetOpt([], ':las')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, { l: false, a: false, s: false })
    Assert.eqDeep(parser.gop_aliases, {})
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':l:a:s:\' with ARGV=[]', () => {
    parser = new GetOpt([], ':l:a:s:')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, { l: true, a: true, s: true })
    Assert.eqDeep(parser.gop_aliases, {})
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':l(long)\' with ARGV=[]', () => {
    parser = new GetOpt([], ':l(long)')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, { l: false })
    Assert.eqDeep(parser.gop_aliases, { long: 'l' })
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':l:(long)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'-l\',\'arg1\',\'--long=q\',\'b\',\'--long\',\'foo\']', () => {
    parser = new GetOpt(['cmd', 'script', '-l', 'arg1', '--long=q', 'b', '--long', 'foo'], ':l:(long)')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options, { l: true })
    Assert.eqDeep(parser.gop_aliases, { long: 'l' })
    Assert.eqDeep(parser.opts(), { l: ['arg1', 'q', 'foo'], long: ['arg1', 'q', 'foo'], __: ['b'] })
  })
  it('should parse optstr=\'l:(long)(longer)\' with ARGV=[]', () => {
    parser = new GetOpt([], 'l:(long)(longer)')
    Assert.eq(parser.gop_silent, false)
    Assert.eqDeep(parser.gop_options, { l: true })
    Assert.eqDeep(parser.gop_aliases, { long: 'l', longer: 'l' })
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\':la:r(recurse)(recur)f:(file)(filename)q\' with ARGV=[]', () => {
    parser = new GetOpt([], ':la:r(recurse)(recur)f:(file)(filename)q')
    Assert.eq(parser.gop_silent, true)
    Assert.eqDeep(parser.gop_options,
      { l: false, a: true, r: false, f: true, q: false }
    )
    Assert.eqDeep(parser.gop_aliases,
      { recurse: 'r', recur: 'r', file: 'f', filename: 'f' }
    )
    Assert.eqDeep(parser.opts(), {})
  })
  it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--help\']', () => {
    parser = new GetOpt(['cmd', 'script', '--help'], '\u1000(help)\u1001(version)')
    Assert.eqDeep(parser.opts(),
      { က: true, help: true }
    )
  })
  it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--version\']', () => {
    parser = new GetOpt(['cmd', 'script', '--version'], '\u1000(help)\u1001(version)')
    Assert.eqDeep(parser.opts(),
      { ခ: true, version: true }
    )
  })
  it('should parse optstr=\'\u1000:(parallel)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--parallel=100\']', () => {
    parser = new GetOpt(['cmd', 'script', '--parallel=100'], '\u1000:(parallel)')
    Assert.eqDeep(parser.opts(),
      { က: '100', parallel: '100' }
    )
  })
  it('should parse optstr=\'h\'' +
    ' with ARGV=[\'-h\'] and optind=0', () => {
    parser = new GetOpt(['-h'], 'h', 0)
    Assert.eqDeep(parser.opts(),
      { h: true }
    )
  })
  it('should parse optstr=\'hv\'' +
    ' with ARGV=[\'foo\',\'-h\',\'-v\'] and optind=1', () => {
    parser = new GetOpt(['foo', '-h', '-v'], 'hv', 1)
    Assert.eqDeep(parser.opts(),
      { h: true, v: true }
    )
  })
  it('should parse ARGV=[\'cmd\',\'script\',\'-h\',\'-v\',\'--test\'] with no optstr', () => {
    parser = new GetOpt(['cmd', 'script', '-h', '-v', '--test'])
    Assert.eqDeep(parser.opts(),
      { h: true, v: true, test: true }
    )
  })
  it('should mapArguments from options', () => {
    const opts = { n: 'Foo', e: 'foo@foo.com', p: '555-555-5555' }
    const argList = [['name', 'n'], ['email', 'e'], ['phone', 'p']]
    const args = GetOpt.mapArguments(argList, opts)
    Assert.eqDeep(args,
      { name: 'Foo', email: 'foo@foo.com', phone: '555-555-5555' }
    )
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
