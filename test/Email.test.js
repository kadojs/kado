'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Email = require('../lib/Email')
let email = new Email()

describe('Email',()=> {
  it('should construct',() => {
    let testEmail = new Email()
    expect(testEmail).to.be.an('object')
  })
  it('should accept a new handler',() => {
    expect(email.addHandler(
      'emailjs',
      new email.EmailJs())
    )
      .to.be.instanceof(email.EmailJs)
  })
  it('should have the new handler instance',()=>{
    expect(email.emailjs).to.be.instanceof(email.EmailJs)
  })
  it('should remove handler instance',()=>{
    expect(email.removeHandler('emailjs')).to.equal('emailjs')
  })
  it('should no longer have the handler',()=>{
    expect(email.emailjs).to.equal(undefined)
  })
  it('should accept a new handler instance',()=>{
    expect(email.addHandler(
      'emailjs',
      new email.EmailJs())
    )
      .to.be.instanceof(email.EmailJs)
  })
  it('should attempt connect and fail',()=>{
    let result = email.emailjs.connect()
    expect(result.sending).to.equal(false)
    expect(result.ready).to.equal(false)
    expect(result.smtp).to.be.an('object')
  })
})
