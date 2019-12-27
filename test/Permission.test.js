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

describe('Permission',()=> {
  const { expect } = require('chai')
  const Permission = require('../lib/Permission')
  let permission = new Permission()
  it('should construct',() => {
    let testPermission = new Permission()
    expect(testPermission).to.be.an('object')
  })
  it('should be empty',()=>{
    expect(permission.all().length).to.equal(0)
  })
  it('should add a permission',()=>{
    expect(permission.add('foo','foo')).to.equal('foo')
  })
  it('should show the permission exists',()=>{
    expect(permission.exists('foo')).to.equal(true)
  })
  it('should get the permission',()=>{
    expect(permission.get('foo').name).to.equal('foo')
  })
  it('should be allowed',()=>{
    expect(permission.allowed('foo')).to.equal(true)
  })
  it('should not be allowed against a set',()=>{
    expect(permission.allowed('foo',[])).to.equal(false)
  })
  it('should digest keys from per set',()=>{
    expect(permission.digest().length).to.equal(1)
  })
  it('should return all permissions',()=>{
    expect(permission.all().length).to.equal(1)
  })
})