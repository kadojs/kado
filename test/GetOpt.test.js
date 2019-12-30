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
  let parser, result, arg
  it('should parse optstr=\'\' with ARGV=[]',()=>{
    parser = new GetOpt('',[])
    expect.eq(parser.gop_silent,false)
    expect.eqDeep(parser.gop_options,{})
    expect.eqDeep(parser.gop_aliases,{})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':\' with ARGV=[]',()=>{
    parser = new GetOpt(':',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{})
    expect.eqDeep(parser.gop_aliases,{})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':l\' with ARGV=[]',()=>{
    parser = new GetOpt(':l',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false})
    expect.eqDeep(parser.gop_aliases,{})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':l:\' with ARGV=[]',()=>{
    parser = new GetOpt(':l:',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:true})
    expect.eqDeep(parser.gop_aliases,{})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':las\' with ARGV=[]',()=>{
    parser = new GetOpt(':las',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false,a:false,s:false})
    expect.eqDeep(parser.gop_aliases,{})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':l:a:s:\' with ARGV=[]',()=>{
    parser = new GetOpt(':l:a:s:',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:true,a:true,s:true})
    expect.eqDeep(parser.gop_aliases,{})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':l(long)\' with ARGV=[]',()=>{
    parser = new GetOpt(':l(long)',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false})
    expect.eqDeep(parser.gop_aliases,{long:'l'})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':l:(long)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'-l\',\'arg1\',\'--long=q\',\'b\',\'--long\',\'foo\']',()=>{
    parser = new GetOpt(':l:(long)',['cmd','script','-l','arg1','--long=q','b','--long','foo'])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:true})
    expect.eqDeep(parser.gop_aliases,{long:'l'})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[
      {option:'l',optarg:'arg1'},
      {option:'l',optarg:'q'}
    ])
  })
  it('should parse optstr=\'l:(long)(longer)\' with ARGV=[]',()=>{
    parser = new GetOpt('l:(long)(longer)',[])
    expect.eq(parser.gop_silent,false)
    expect.eqDeep(parser.gop_options,{l:true})
    expect.eqDeep(parser.gop_aliases,{long:'l',longer:'l'})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\':la:r(recurse)(recur)f:(file)(filename)q\' with ARGV=[]',()=>{
    parser = new GetOpt(':la:r(recurse)(recur)f:(file)(filename)q',[])
    expect.eq(parser.gop_silent,true)
    expect.eqDeep(parser.gop_options,{l:false,a:true,r:false,f:true,q:false})
    expect.eqDeep(parser.gop_aliases,{recurse:'r',recur:'r',file:'f',filename:'f'})
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[])
  })
  it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--help\']',()=>{
    parser = new GetOpt('\u1000(help)\u1001(version)',['cmd','script','--help'])
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[
      {option:'\u1000'},
    ])
  })
  it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--version\']',()=>{
    parser = new GetOpt('\u1000(help)\u1001(version)',['cmd','script','--version'])
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[
      {option:'\u1001'},
    ])
  })
  it('should parse optstr=\'\u1000:(parallel)\'' +
    ' with ARGV=[\'cmd\',\'script\',\'--parallel=100\']',()=>{
    parser = new GetOpt('\u1000:(parallel)',['cmd','script','--parallel=100'])
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[
      {option:'\u1000',optarg:'100'},
    ])
  })
  it('should parse optstr=\'h\'' +
    ' with ARGV=[\'-h\'] and optind=0',()=>{
    parser = new GetOpt('h',['-h'],0)
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[
      {option:'h'},
    ])
  })
  it('should parse optstr=\'hv\'' +
    ' with ARGV=[\'foo\',\'-h\',\'-v\'] and optind=1',()=>{
    parser = new GetOpt('hv',['foo','-h','-v'],1)
    result = []
    while (undefined !== (arg = parser.getopt()))
      result.push(arg)
    expect.eqDeep(result,[
      {option:'h'},
      {option:'v'},
    ])
  })
})
