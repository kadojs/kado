'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const Kado = require('../index')
const P = require('bluebird')
const { expect } = require('chai')
const request = require('request')
const config = require('./config.test.js')
const app = new Kado(config)
const server = require('http').createServer(app.express)

//setup a test route
app.get('/',(req,res)=>{res.send('Hello')})

//make some promises
P.promisifyAll(request)

describe('kado',function(){
  //load the subsystem tests
  require('./Asset.test')
  require('./Breadcrumb.test')
  require('./Connector.test')
  require('./Cron.test')
  require('./Database.test')
  require('./Email.test')
  require('./Event.test')
  require('./Language.test')
  require('./Library.test')
  require('./Logger.test')
  require('./Message.test')
  require('./Nav.test')
  require('./Permission.test')
  require('./Profiler.test')
  require('./Router.test')
  require('./Search.test')
  require('./Util.test')
  require('./View.test')
  //test a loaded server
  describe('main',()=>{
    this.timeout(20000)
    //start server
    before(() => {
      server.listen(config.port || 3000, config.host || null)
      return app.start()
    })
    //stop services
    after(() => {
      app.stop()
      server.close()
    })
    it('should be online',()=>{
      return request.getAsync('http://localhost:3000/')
        .then((result)=>{
          expect(result.body).to.equal('Hello')
        })
    })
    it('should have database access',()=>{
      expect(app.db.sequelize).to.be.an('object')
    })
    it('should have a logger installed',()=>{
      expect(app.log.info).to.be.a('function')
    })
  })
})
