'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Breadcrumb = require('../lib/Breadcrumb')
let breadcrumb = new Breadcrumb()

describe('Breadcrumb',()=>{
  it('should construct',()=>{
    let testBreadcrumb = new Breadcrumb()
    expect(testBreadcrumb).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(breadcrumb.all().length).to.equal(0)
  })
  it('should add crumb entry',()=>{
    expect(breadcrumb.add('/test','Test','fa fa-plus').name).to.equal('Test')
  })
  it('should save the entries',()=>{
    let req = {session: {}}
    breadcrumb.save(req)
    expect(req.session.breadcrumb).to.be.an('Array')
  })
  it('should restore the entries',()=>{
    let req = {session: {}}
    req.session.breadcrumb = [{uri: '/test', name: 'Test', icon: 'fa fa-plus'}]
    breadcrumb.restore(req)
    expect(breadcrumb.all().length).to.equal(1)
  })
  it('should accept middleware request',()=>{
    let Nav = require('../lib/Nav')
    let app = {nav: new Nav()}
    app.nav.addGroup('/test','Test','fa-fa-plus')
    let req = {session: {}, url: '/test', method: 'GET'}
    expect(breadcrumb.middleware(app,req)).to.be.an('Array')
    expect(breadcrumb.all()[0].name).to.equal('Test')
  })
})
