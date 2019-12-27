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
