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
  const { expect } = require('chai')
  const Asset = require('../lib/Asset')
  let asset = new Asset()
  it('should construct',()=>{
    let testAsset = new Asset()
    expect(testAsset).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(asset.get().length).to.equal(0)
    expect(asset.getOnce().length).to.equal(0)
  })
  it('should add an asset',()=>{
    expect(asset.add('/test','text/javascript')).to.equal('/test')
  })
  it('should add a second asset',()=>{
    expect(asset.add('/test2','text/css')).to.equal('/test2')
  })
  it('should show both assets exists',()=>{
    expect(asset.exists('/test').uri).to.equal('/test')
    expect(asset.exists('/test2').uri).to.equal('/test2')
    //remove the 2nd asset
    expect(asset.remove('/test2').uri).to.equal('/test2')
  })
  it('should add an asset once',()=>{
    expect(asset.addOnce('/test-once','image/png')).to.equal('/test-once')
  })
  it('should show an asset exists once',()=>{
    expect(asset.existsOnce('/test-once').uri).to.equal('/test-once')
  })
  it('should show all',()=>{
    expect(asset.all().length).to.equal(2)
  })
  it('should work with filter on all',()=>{
    expect(asset.all('text/plain').length).to.equal(0)
  })
  it('should have emptied one time assets',()=>{
    expect(asset.getOnce().length).to.equal(0)
  })
  it('should add another one off asset',()=>{
    expect(asset.addOnce('/test-once')).to.equal('/test-once')
  })
  it('should remove asset',()=>{
    expect(asset.remove('/test').uri).to.equal('/test')
  })
  it('should have no assets',()=>{
    expect(asset.get().length).to.equal(0)
  })
  it('should remove one time asset',()=>{
    expect(asset.removeOnce('/test-once').uri).to.equal('/test-once')
  })
  it('should have no assets',()=>{
    expect(asset.get().length).to.equal(0)
    expect(asset.getOnce().length).to.equal(0)
  })
})
