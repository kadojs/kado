'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const chai = require('chai')
chai.use(require('chai-match'))
const { expect } = chai
const Profiler = require('../lib/Profiler')
let profiler = new Profiler()

describe('Profiler',()=> {
  it('should construct',() => {
    let testProfiler = new Profiler()
    expect(testProfiler).to.be.an('object')
  })
  it('should accept query addition',()=>{
    expect(profiler.addQuery('SELECT * FROM FOO',1001)).to.equal(1)
  })
  it('should start the rendering timer',()=>{
    let now = + new Date()
    expect(profiler.startRender()).to.be.gte(now)
  })
  it('should build a profile',()=>{
    expect(profiler.build().HTML).to.match(/<div id="kado-profiler">/)
  })
})
