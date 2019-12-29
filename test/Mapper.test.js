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

describe('Mapper',()=>{
  const { expect } = require('chai')
  const Mapper = require('../lib/Mapper')
  const mapper = new Mapper()
  it('should construct',()=>{
    const testMapper = new Mapper()
    expect(testMapper).to.be.instanceof(Mapper)
  })
  it('should set a value with a string',()=>{
    expect(mapper.set('foo1','bar')).to.equal('bar')
  })
  it('should set a value with an array',()=>{
    expect(mapper.set(['foo2'],'bar')).to.equal('bar')
  })
  it('should set deep value with an array',()=>{
    expect(mapper.set(['foo3','bar'],'baz')).to.equal('baz')
  })
  it('should set deep value with a string',()=>{
    expect(mapper.set('foo4.bar.baz.boo','bap')).to.equal('bap')
  })
  it('should get a value with a string',()=>{
    expect(mapper.get('foo1')).to.equal('bar')
  })
  it('should get a value with an array',()=>{
    expect(mapper.get(['foo2'])).to.equal('bar')
  })
  it('should get a deep value with an array',()=>{
    expect(mapper.get(['foo3','bar'])).to.equal('baz')
  })
  it('should get a deep value with a string',()=>{
    expect(mapper.get('foo4.bar.baz.boo')).to.equal('bap')
  })
  it('should delete a value with a string',()=>{
    expect(mapper.delete('foo1')).to.equal('foo1')
  })
  it('should delete a value with an array',()=>{
    expect(mapper.delete(['foo2'])).to.equal('foo2')
  })
  it('should delete a deep value with an array',()=>{
    expect(mapper.delete(['foo3','bar'])).to.equal('bar')
  })
  it('should set a value',()=>{
    expect(mapper.set('foo1','bap')).to.equal('bap')
  })
  it('should list all values',()=>{
    expect(mapper.all().foo1).to.equal('bap')
  })
})
