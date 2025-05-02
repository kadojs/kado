/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Language = require('../lib/Language')
runner.suite('Language', (it) => {
  const language = new Language()
  const eng = {
    _pack_name: 'English',
    _pack_version: '1.0',
    _pack_author: 'Nullivex',
    _pack_system: 'Kado',
    _pack_module: 'none',
    _pack_code: 'eng',
    _pack_sc: 'en',
    _pack_flag: 'us',
    something: 'Something'
  }
  it('should construct', () => {
    Assert.isType('Language', new Language())
  })
  it('should be empty', () => {
    Assert.eq(Object.keys(language.all()).length, 0)
  })
  it('should add a pack', () => {
    Assert.eq(language.addPack('eng', eng), 'eng')
  })
  it('should get the pack', () => {
    Assert.eq(language.getPack('eng')._pack_name, 'English')
  })
  it('should add a module to the pack', () => {
    Assert.eq(language.addModule('eng', 'blog', { blog_name: 'Blog Name' }), 'blog')
  })
  it('should have the module def', () => {
    Assert.eq(language.getPack('eng').blog.blog_name, 'Blog Name')
  })
  it('should remove a module', () => {
    Assert.eq(language.removeModule('eng', 'blog'), 'blog')
  })
  it('should remove a pack', () => {
    Assert.eq(language.removePack('eng'), 'eng')
  })
  it('should have no packs', () => {
    Assert.eq(Object.keys(language.all()).length, 0)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
