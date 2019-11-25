'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Asset = require('../lib/Asset')
let asset = new Asset()

describe('Asset',()=>{
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
  it('should show an asset exists',()=>{
    expect(asset.exists('/test')[0].uri).to.equal('/test')
  })
  it('should add an asset once',()=>{
    expect(asset.addOnce('/test-once','image/png')).to.equal('/test-once')
  })
  it('should show an asset exists once',()=>{
    expect(asset.existsOnce('/test-once')[0].uri).to.equal('/test-once')
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
    expect(asset.remove('/test')).to.equal(true)
  })
  it('should have no assets',()=>{
    expect(asset.get().length).to.equal(0)
  })
  it('should remove one time asset',()=>{
    expect(asset.removeOnce('/test-once')).to.equal(true)
  })
  it('should have no assets',()=>{
    expect(asset.get().length).to.equal(0)
    expect(asset.getOnce().length).to.equal(0)
  })
})
