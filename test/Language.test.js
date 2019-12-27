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
