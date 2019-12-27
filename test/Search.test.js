'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
