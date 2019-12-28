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
	const { expect } = require('chai')
	const GetOpt = require('../lib/GetOpt')
	let parser, result, arg
	it('should parse optstr=\'\' with ARGV=[]',()=>{
		parser = new GetOpt('',[])
		expect(parser.gop_silent).to.equal(false)
		expect(parser.gop_options).to.deep.equal({})
		expect(parser.gop_aliases).to.deep.equal({})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':\' with ARGV=[]',()=>{
		parser = new GetOpt(':',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({})
		expect(parser.gop_aliases).to.deep.equal({})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':l\' with ARGV=[]',()=>{
		parser = new GetOpt(':l',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:false})
		expect(parser.gop_aliases).to.deep.equal({})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':l:\' with ARGV=[]',()=>{
		parser = new GetOpt(':l:',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:true})
		expect(parser.gop_aliases).to.deep.equal({})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':las\' with ARGV=[]',()=>{
		parser = new GetOpt(':las',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:false,a:false,s:false})
		expect(parser.gop_aliases).to.deep.equal({})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':l:a:s:\' with ARGV=[]',()=>{
		parser = new GetOpt(':l:a:s:',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:true,a:true,s:true})
		expect(parser.gop_aliases).to.deep.equal({})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':l(long)\' with ARGV=[]',()=>{
		parser = new GetOpt(':l(long)',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:false})
		expect(parser.gop_aliases).to.deep.equal({long:'l'})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':l:(long)\'' +
		' with ARGV=[\'cmd\',\'script\',\'-l\',\'arg1\',\'--long=q\',\'b\',\'--long\',\'foo\']',()=>{
		parser = new GetOpt(':l:(long)',['cmd','script','-l','arg1','--long=q','b','--long','foo'])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:true})
		expect(parser.gop_aliases).to.deep.equal({long:'l'})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([
			{option:'l',optarg:'arg1'},
			{option:'l',optarg:'q'}
		])
	})
	it('should parse optstr=\'l:(long)(longer)\' with ARGV=[]',()=>{
		parser = new GetOpt('l:(long)(longer)',[])
		expect(parser.gop_silent).to.equal(false)
		expect(parser.gop_options).to.deep.equal({l:true})
		expect(parser.gop_aliases).to.deep.equal({long:'l',longer:'l'})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\':la:r(recurse)(recur)f:(file)(filename)q\' with ARGV=[]',()=>{
		parser = new GetOpt(':la:r(recurse)(recur)f:(file)(filename)q',[])
		expect(parser.gop_silent).to.equal(true)
		expect(parser.gop_options).to.deep.equal({l:false,a:true,r:false,f:true,q:false})
		expect(parser.gop_aliases).to.deep.equal({recurse:'r',recur:'r',file:'f',filename:'f'})
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([])
	})
	it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
		' with ARGV=[\'cmd\',\'script\',\'--help\']',()=>{
		parser = new GetOpt('\u1000(help)\u1001(version)',['cmd','script','--help'])
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([
			{option:'\u1000'},
		])
	})
	it('should parse optstr=\'\u1000(help)\u1001(version)\'' +
		' with ARGV=[\'cmd\',\'script\',\'--version\']',()=>{
		parser = new GetOpt('\u1000(help)\u1001(version)',['cmd','script','--version'])
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([
			{option:'\u1001'},
		])
	})
	it('should parse optstr=\'\u1000:(parallel)\'' +
		' with ARGV=[\'cmd\',\'script\',\'--parallel=100\']',()=>{
		parser = new GetOpt('\u1000:(parallel)',['cmd','script','--parallel=100'])
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([
			{option:'\u1000',optarg:'100'},
		])
	})
	it('should parse optstr=\'h\'' +
		' with ARGV=[\'-h\'] and optind=0',()=>{
		parser = new GetOpt('h',['-h'],0)
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([
			{option:'h'},
		])
	})
	it('should parse optstr=\'hv\'' +
		' with ARGV=[\'foo\',\'-h\',\'-v\'] and optind=1',()=>{
		parser = new GetOpt('hv',['foo','-h','-v'],1)
		result = []
		while (undefined !== (arg = parser.getopt()))
			result.push(arg)
		expect(result).to.deep.equal([
			{option:'h'},
			{option:'v'},
		])
	})
})
