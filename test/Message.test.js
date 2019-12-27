'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

describe('Message',()=> {
  const { expect } = require('chai')
  const Message = require('../lib/Message')
  let message = new Message()
  it('should construct',() => {
    let testMessage = new Message()
    expect(testMessage).to.be.an('object')
  })
  it('should have no handlers',()=>{
    expect(Object.keys(message.allHandlers()).length).to.equal(0)
  })
  it('should add a handler',()=>{
    expect(message.addHandler('test',(options)=>{
      return options
    }))
  })
  it('should have a handler',()=>{
    expect(message.getHandler('test')).to.be.an('object')
  })
  it('should remove a handler',()=>{
    expect(message.removeHandler('test')).to.equal('test')
  })
  it('should have no handlers',()=>{
    expect(Object.keys(message.allHandlers()).length).to.equal(0)
  })
  it('should accept a new handler',()=>{
    expect(message.addHandler('test',(options)=>{
      return options
    }))
  })
  it('should send a message and see it in the handler',()=>{
    return message.send('foo@foo.com','something to do')
      .then((result)=>{
        result = result[0]
        expect(result.to).to.equal('foo@foo.com')
        expect(result.text).to.equal('something to do')
      })
  })
})
