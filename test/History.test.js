'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('History',()=>{
  const { expect } = require('chai')
  const History = require('../lib/History')
  let history = new History()
  it('should construct',()=>{
    let testBreadcrumb = new History()
    expect(testBreadcrumb).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(history.all().length).to.equal(0)
  })
  it('should add crumb entry',()=>{
    expect(history.add('/test','Test','fa fa-plus').name).to.equal('Test')
  })
  it('should save the entries',()=>{
    let req = {session: {}}
    history.save(req)
    expect(req.session.breadcrumb).to.be.an('Array')
  })
  it('should restore the entries',()=>{
    let req = {session: {}}
    req.session.breadcrumb = [{uri: '/test', name: 'Test', icon: 'fa fa-plus'}]
    history.restore(req)
    expect(history.all().length).to.equal(1)
  })
  it('should accept middleware request',()=>{
    let Nav = require('../lib/Navigation')
    let Util = require('../lib/Util')
    let app = {nav: new Nav(), util: new Util()}
    app.nav.addGroup('/test','Test','fa-fa-plus')
    let req = {session: {}, url: '/test', method: 'GET'}
    expect(history.middleware(app,req)).to.be.an('Array')
    expect(history.all()[0].name).to.equal('Test')
  })
})
