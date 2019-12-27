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
