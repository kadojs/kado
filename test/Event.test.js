'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

const { expect } = require('chai')
const Event = require('../lib/Event')
let event = new Event()

describe('Event',()=>{
  it('should construct',()=>{
    let testEvent = new Event()
    expect(testEvent).to.be.an('object')
  })
  it('should have no handlers',()=>{
    expect(Object.keys(event.allHandlers()).length).to.equal(0)
  })
  it('should accept our tast handler',()=>{
    expect(event.addHandler('test',(options)=>{
      expect(options).to.be.an('object')
      expect(options.to).to.be.a('string')
      expect(options.text).to.be.a('string')
      expect(options.level).to.be.a('number')
      expect(options.levelInfo).to.be.an('object')
      return options
    })).to.equal('test')
  })
  it('should add a handler',()=>{
    expect(event.addHandler('test2',()=>{})).to.equal('test2')
  })
  it('should show a handler exists',()=>{
    expect(event.getHandler('test2').name).to.equal('test2')
  })
  it('should show the handler exists in the list',()=>{
    expect(Object.keys(event.allHandlers()).length).to.equal(2)
  })
  it('should remove a handler',()=>{
    expect(event.removeHandler('test2')).to.equal('test2')
  })
  it('should show all handlers',()=>{
    expect(Object.keys(event.allHandlers()).length).to.equal(1)
  })
  it('should create an event an call our handler',()=>{
    let levelInfo = event.getLevelInfo(3)
    return event.create({
      to: 'foo',
      module: 'test',
      text: 'some thing happened',
      level: 3,
      levelInfo: levelInfo
    }).then((result)=>{
      //since many modules could have been processed only keep one
      result = result[0]
      expect(result).to.be.an('object')
      expect(result.text).to.equal('some thing happened')
    })
  })
  it('should create using the digest method directly',()=>{
    return event.create(event.digest(3,'dude','some thing happened'))
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.text).to.equal('some thing happened')
      })
  })
  it('should call using the error method',()=>{
    return event.error('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.level).to.equal(0)
        expect(result.text).to.equal('some thing happened')
      })
  })
  it('should call using the warn method',()=>{
    return event.warn('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.level).to.equal(1)
        expect(result.text).to.equal('some thing happened')
      })
  })
  it('should call using the info method',()=>{
    return event.info('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.level).to.equal(2)
        expect(result.text).to.equal('some thing happened')
      })
  })
  it('should call using the verbose method',()=>{
    return event.verbose('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.level).to.equal(3)
        expect(result.text).to.equal('some thing happened')
      })
  })
  it('should call using the debug method',()=>{
    return event.debug('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.level).to.equal(4)
        expect(result.text).to.equal('some thing happened')
      })
  })
  it('should call using the silly method',()=>{
    return event.silly('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect(result).to.be.an('object')
        expect(result.level).to.equal(5)
        expect(result.text).to.equal('some thing happened')
      })
  })
})
