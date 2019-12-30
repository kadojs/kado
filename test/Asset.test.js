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

describe('Asset',()=>{
  const { expect } = require('../lib/Validate')
  const Asset = require('../lib/Asset')
  let asset = new Asset()
  it('should construct',()=>{
    expect.isType('Asset',new Asset())
  })
  it('should be empty',()=>{
    expect.eq(asset.get().length,0)
    expect.eq(asset.getOnce().length,0)
  })
  it('should add an asset',()=>{
    expect.eq(asset.add('/test','text/javascript'),'/test')
  })
  it('should add a second asset',()=>{
    expect.eq(asset.add('/test2','text/css'),'/test2')
  })
  it('should show both assets exists',()=>{
    expect.eq(asset.exists('/test').uri,'/test')
    expect.eq(asset.exists('/test2').uri,'/test2')
    //remove the 2nd asset
    expect.eq(asset.remove('/test2').uri,'/test2')
  })
  it('should add an asset once',()=>{
    expect.eq(asset.addOnce('/test-once','image/png'),'/test-once')
  })
  it('should show an asset exists once',()=>{
    expect.eq(asset.existsOnce('/test-once').uri,'/test-once')
  })
  it('should show all',()=>{
    expect.eq(asset.all().length,2)
  })
  it('should work with filter on all',()=>{
    expect.eq(asset.all('text/plain').length,0)
  })
  it('should have emptied one time assets',()=>{
    expect.eq(asset.getOnce().length,0)
  })
  it('should add another one off asset',()=>{
    expect.eq(asset.addOnce('/test-once'),'/test-once')
  })
  it('should remove asset',()=>{
    expect.eq(asset.remove('/test').uri,'/test')
  })
  it('should have no assets',()=>{
    expect.eq(asset.get().length,0)
  })
  it('should remove one time asset',()=>{
    expect.eq(asset.removeOnce('/test-once').uri,'/test-once')
  })
  it('should have no assets',()=>{
    expect.eq(asset.get().length,0)
    expect.eq(asset.getOnce().length,0)
  })
})
