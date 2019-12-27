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
