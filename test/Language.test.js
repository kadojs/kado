'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('Language',()=> {
  const { expect } = require('chai')
  const Language = require('../lib/Language')
  let language = new Language()
  let eng = {
    '_pack_name': 'English',
    '_pack_version': '1.0',
    '_pack_author': 'Nullivex',
    '_pack_system': 'Kado',
    '_pack_module': 'none',
    '_pack_code': 'eng',
    '_pack_sc': 'en',
    '_pack_flag': 'us',
    'something': 'Something'
  }
  it('should construct',() => {
    let testLanguage = new Language()
    expect(testLanguage).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(Object.keys(language.all()).length).to.equal(0)
  })
  it('should add a pack',()=>{
    expect(language.addPack('eng',eng)).to.equal('eng')
  })
  it('should get the pack',()=>{
    expect(language.getPack('eng')._pack_name).to.equal('English')
  })
  it('should add a module to the pack',()=>{
    expect(language.addModule('eng','blog',{blog_name: 'Blog Name'}))
  })
  it('should have the module def',()=>{
    expect(language.getPack('eng').blog.blog_name).to.equal('Blog Name')
  })
  it('should remove a module',()=>{
    expect(language.removeModule('eng','blog')).to.equal('blog')
  })
  it('should remove a pack',()=>{
    expect(language.removePack('eng')).to.equal('eng')
  })
  it('should have no packs',()=>{
    expect(Object.keys(language.all()).length).to.equal(0)
  })
})
