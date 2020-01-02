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
runner.suite('Event',(it)=>{
  const { expect } = require('../lib/Validate')
  const Event = require('../lib/Event')
  let event = new Event()
  it('should construct',()=>{
    expect.isType('Event',new Event())
  })
  it('should have no handlers',()=>{
    expect.eq(Object.keys(event.allHandlers()).length,0)
  })
  it('should accept our test handler',()=>{
    expect.eq(event.addHandler('test',(options)=>{
      expect.isType('Object',options)
      expect.isType('string',options.to)
      expect.isType('string',options.text)
      expect.isType('number',options.level)
      expect.isType('Object',options.levelInfo)
      return options
    }),'test')
  })
  it('should add a handler',()=>{
    expect.eq(event.addHandler('test2',()=>{}),'test2')
  })
  it('should show a handler exists',()=>{
    expect.eq(event.getHandler('test2').name,'test2')
  })
  it('should show the handler exists in the list',()=>{
    expect.eq(Object.keys(event.allHandlers()).length,2)
  })
  it('should remove a handler',()=>{
    expect.eq(event.removeHandler('test2'),'test2')
  })
  it('should show all handlers',()=>{
    expect.eq(Object.keys(event.allHandlers()).length,1)
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
      expect.isType('Object',result)
      expect.eq(result.text,'some thing happened')
    })
  })
  it('should create using the digest method directly',()=>{
    return event.create(event.digest(3,'dude','some thing happened'))
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.text,'some thing happened')
      })
  })
  it('should call using the error method',()=>{
    return event.error('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.level,0)
        expect.eq(result.text,'some thing happened')
      })
  })
  it('should call using the warn method',()=>{
    return event.warn('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.level,1)
        expect.eq(result.text,'some thing happened')
      })
  })
  it('should call using the info method',()=>{
    return event.info('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.level,2)
        expect.eq(result.text,'some thing happened')
      })
  })
  it('should call using the verbose method',()=>{
    return event.verbose('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.level,3)
        expect.eq(result.text,'some thing happened')
      })
  })
  it('should call using the debug method',()=>{
    return event.debug('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.level,4)
        expect.eq(result.text,'some thing happened')
      })
  })
  it('should call using the silly method',()=>{
    return event.silly('foo','some thing happened')
      .then((result)=>{
        result = result[0]
        expect.isType('Object',result)
        expect.eq(result.level,5)
        expect.eq(result.text,'some thing happened')
      })
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
