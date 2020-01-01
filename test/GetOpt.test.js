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


describe('GetOpt',()=>{
  const { expect } = require('../lib/Validate')
  const GetOpt = require('../lib/GetOpt')
  let parser
  it('should parse optstr=\'\' with ARGV=[]',()=>{
    parser = new GetOpt([],'')
    expect.eq(parser.gop_silent,false)
    expect.eqDeep(parser.gop_options,{})
    expect.eqDeep(parser.gop_aliases,{})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':\' with ARGV=[]',()=>{
    parser = new GetOpt([],':')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{})
    expect.eqDeep(parser.gop_aliases,{})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':l\' with ARGV=[]',()=>{
    parser = new GetOpt([],':l')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false})
    expect.eqDeep(parser.gop_aliases,{})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':l:\' with ARGV=[]',()=>{
    parser = new GetOpt([],':l:')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:true})
    expect.eqDeep(parser.gop_aliases,{})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':las\' with ARGV=[]',()=>{
    parser = new GetOpt([],':las')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false, a:false, s:false})
    expect.eqDeep(parser.gop_aliases,{})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':l:a:s:\' with ARGV=[]',()=>{
    parser = new GetOpt([],':l:a:s:')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:true, a:true, s:true})
    expect.eqDeep(parser.gop_aliases,{})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':l(long)\' with ARGV=[]',()=>{
    parser = new GetOpt([],':l(long)')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false})
    expect.eqDeep(parser.gop_aliases,{long:'l'})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':l:(long)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'-l\',\'arg1\',\'--long=q\',\'b\',\'--long\',\'foo\']',()=>{
    parser = new GetOpt(['cmd','script','-l','arg1','--long=q','b','--long','foo'],':l:(long)')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:true})
    expect.eqDeep(parser.gop_aliases,{long:'l'})
    expect.eqDeep(parser.opts(),{l:['arg1','q'], long:['arg1','q']})
  })
  it('should parse optstr=\'l:(long)(longer)\' with ARGV=[]',()=>{
    parser = new GetOpt([],'l:(long)(longer)')
    expect.eq(parser.gop_silent,false)
    expect.eqDeep(parser.gop_options,{l:true})
    expect.eqDeep(parser.gop_aliases,{long:'l', longer:'l'})
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\':la:r(recurse)(recur)f:(file)(filename)q\' with ARGV=[]',()=>{
    parser = new GetOpt([],':la:r(recurse)(recur)f:(file)(filename)q')
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,
      {l:false,a:true,r:false,f:true,q:false}
    )
    expect.eqDeep(parser.gop_aliases,
      {recurse:'r', recur:'r', file:'f', filename:'f'}
    )
    expect.eqDeep(parser.opts(),{})
  })
  it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--help\']',()=>{
    parser = new GetOpt(['cmd','script','--help'],'\u1000(help)\u1001(version)')
    expect.eqDeep(parser.opts(),
      {'\u1000':true, help:true}
    )
  })
  it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--version\']',()=>{
    parser = new GetOpt(['cmd','script','--version'],'\u1000(help)\u1001(version)')
    expect.eqDeep(parser.opts(),
      {'\u1001':true, version:true}
    )
  })
  it('should parse optstr=\'\u1000:(parallel)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--parallel=100\']',()=>{
    parser = new GetOpt(['cmd','script','--parallel=100'],'\u1000:(parallel)')
    expect.eqDeep(parser.opts(),
      {'\u1000':'100', parallel:'100'}
    )
  })
  it('should parse optstr=\'h\'' +
    ' with ARGV=[\'-h\'] and optind=0',()=>{
    parser = new GetOpt(['-h'],'h',0)
    expect.eqDeep(parser.opts(),
      {h:true}
    )
  })
  it('should parse optstr=\'hv\'' +
    ' with ARGV=[\'foo\',\'-h\',\'-v\'] and optind=1',()=>{
    parser = new GetOpt(['foo','-h','-v'],'hv',1)
    expect.eqDeep(parser.opts(),
      {h:true, v:true}
    )
  })
  it('should parse ARGV=[\'cmd\',\'script\',\'-h\',\'-v\',\'--test\'] with no optstr',()=>{
    parser = new GetOpt(['cmd','script','-h','-v','--test'])
    expect.eqDeep(parser.opts(),
      {h:true, v:true, test:true}
    )
  })
})
