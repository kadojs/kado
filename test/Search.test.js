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

describe('Search',()=> {
  const { expect } = require('chai')
  const Search = require('../lib/Search')
  let search = new Search()
  let ourModule = ()=>{
    return new Promise((resolve)=>{
      resolve([
        {
          uri: '/foo',
          title: 'foo',
          description: 'some Foo',
          updatedAt: new Date()
        },
        {
          uri: '/foo1',
          title: 'foo1',
          description: 'some Foo1',
          updatedAt: new Date()
        }
      ])
    })
  }
  it('should construct',() => {
    let testSearch = new Search()
    expect(testSearch).to.be.an('object')
  })
  it('should have no modules',()=>{
    expect(Object.keys(search.allModules()).length).to.equal(0)
  })
  it('should add a module',()=>{
    expect(search.addModule('test',ourModule).title).to.equal('test')
  })
  it('should get the module',()=>{
    expect(search.getModule('test').title).to.equal('test')
  })
  it('should remove the module',()=>{
    expect(search.removeModule('test')).to.equal('test')
  })
  it('should the module as removed',()=>{
    expect(Object.keys(search.allModules()).length).to.equal(0)
  })
  it('should add a new module',()=>{
    expect(search.addModule('test',ourModule).title).to.equal('test')
  })
  it('should search by phrase',()=>{
    return search.byPhrase({},'some foo',{start: 0,limit: 10})
      .then((result)=>{
        expect(result.resultCount).to.equal(2)
        expect(result.results.length).to.equal(1)
        expect(result.results[0].moduleTitle).to.equal('test')
        expect(result.results[0].moduleResults[0].uri).to.equal('/foo')
      })
  })
})
