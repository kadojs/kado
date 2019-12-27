'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('Email',()=> {
  const { expect } = require('chai')
  const Email = require('../lib/Email')
  const EmailConnector = require('../lib/EmailConnector')
  class OurEmail extends EmailConnector {
    constructor(options){
      super(options)
    }
    connect(){
      this.server = {
        ready: false,
        send: (options,cb)=>{ cb(null,true) },
        sending: false,
        smtp: {}
      }
      return this.server
    }
  }
  let email = new Email()
  it('should construct',() => {
    let testEmail = new Email()
    expect(testEmail).to.be.an('object')
  })
  it('should accept a new handler',() => {
    expect(email.addHandler('test',new OurEmail()))
      .to.be.instanceof(OurEmail)
  })
  it('should have the new handler instance',()=>{
    expect(email.test).to.be.instanceof(OurEmail)
  })
  it('should remove handler instance',()=>{
    expect(email.removeHandler('test')).to.equal('test')
  })
  it('should no longer have the handler',()=>{
    expect(email.test).to.equal(undefined)
  })
  it('should accept a new handler instance',()=>{
    expect(email.addHandler('test',new OurEmail()))
      .to.be.instanceof(OurEmail)
  })
  it('should attempt connect and fail',()=>{
    let result = email.test.connect()
    expect(result.sending).to.equal(false)
    expect(result.ready).to.equal(false)
    expect(result.smtp).to.be.an('object')
  })
})
