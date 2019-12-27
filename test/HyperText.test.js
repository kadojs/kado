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

describe('HyperText',()=> {
  const { expect } = require('chai')
  const HyperText = require('../lib/HyperText')
  const hyperText = new HyperText()
  class OurEngine extends hyperText.HyperTextEngine {
    constructor(){
      super()
      this.http = require('http').createServer((req,res)=>{
        res.statusCode = 404
        res.end('Cannot GET ' + req.url)
      })
    }
    start(port,host){
      super.start()
      super.checkPort(port)
      super.checkHost(host)
      const that = this
      return new Promise((resolve,reject)=> {
        that.http.listen(port,host,(err) => {
          if(err) return reject(err)
          resolve(that.http)
        })
      })
    }
    stop(){
      super.stop()
      const that = this
      return new Promise((resolve,reject)=> {
        that.http.close((err) => {
          if(err) return reject(err)
          resolve(true)
        })
      })
    }
  }
  function checkServer(port,host,uri){
    const http = require('http')
    return new Promise((resolve,reject)=>{
      const params = {
        port: port,
        host: host,
        method: 'GET',
        path: uri
      }
      const req = http.request(params)
      req.end()
      req.on('response',(res)=> {
        let data = null
        res.setEncoding(('utf8'))
        res.on('data',(chunk)=>{ data += chunk })
        res.on('end',()=>{
          resolve(expect(data).to.match(/Cannot GET \//))
        })
        res.on('error',reject)
      })
      req.on('error',reject)
    })
  }
  it('should construct',() => {
    let testHyperText = new HyperText()
    expect(testHyperText).to.be.an('object')
  })
  it('should have no handlers',() => {
    expect(Object.keys(hyperText.allHandlers()).length).to.equal(0)
  })
  it('should add a handler',() => {
    expect(hyperText.addHandler('express',new OurEngine())).to.equal('express')
  })
  it('should have a handler',() => {
    expect(hyperText.getHandler('express')).to.be.an('object')
  })
  it('should have 1 total handlers',() => {
    expect(Object.keys(hyperText.allHandlers()).length).to.equal(1)
  })
  it('should remove a handler',() => {
    expect(hyperText.removeHandler('express')).to.equal('express')
  })
  it('should have no handlers',() => {
    expect(Object.keys(hyperText.allHandlers()).length).to.equal(0)
  })
  it('should accept a new handler',() => {
    expect(hyperText.addHandler('ex',new OurEngine())).to.equal('ex')
  })
  it('should have the new handler',() => {
    expect(hyperText.getHandler('ex')).to.be.an('object')
  })
  it('should activate the new handler',() => {
    expect(hyperText.activateHandler('ex')).to.equal('ex')
  })
  it('should start the engine',async () => {
    expect(await hyperText.start(3000,'localhost')).to.be.an('object')
  })
  it('should be listening with the engine',async () => {
    expect(await checkServer(3000,'localhost','/'))
  })
  it('should stop the engine',async () => {
    expect(await hyperText.stop()).to.equal(true)
  })
})
