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
const runner = require('../lib/TestRunner').getInstance('Kado')
runner.suite('Email',(it)=> {
  const { expect } = require('../lib/Validate')
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
    expect.isType('Email',new Email())
  })
  it('should accept a new handler',() => {
    expect.isType('OurEmail',email.addHandler('test',new OurEmail()))
  })
  it('should have the new handler instance',()=>{
    expect.isType('OurEmail',email.test)
  })
  it('should remove handler instance',()=>{
    expect.eq(email.removeHandler('test'),'test')
  })
  it('should no longer have the handler',()=>{
    expect.eq(email.test,undefined)
  })
  it('should accept a new handler instance',()=>{
    expect.isType('OurEmail',email.addHandler('test',new OurEmail()))
  })
  it('should attempt connect and fail',()=>{
    let result = email.test.connect()
    expect.eq(result.sending,false)
    expect.eq(result.ready,false)
    expect.isType('Object',result.smtp)
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
