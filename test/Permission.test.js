'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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