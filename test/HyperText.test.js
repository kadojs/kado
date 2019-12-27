'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
