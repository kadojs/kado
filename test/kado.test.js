'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
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
const K = require('../index')
const P = K.bluebird
const exec = P.promisify(require('child_process').exec)
const { expect } = require('chai')
const request = require('request')

//make some promises
K.bluebird.promisifyAll(request)

K.scanModules().then(()=>{
  describe('kado',function(){
    this.timeout(20000)
    //start servers and create a staff
    before(() => {
      if('kado' !== process.env.KADO_TEST){
        K.configure({
          root: __dirname,
          db: {
            sequelize: {
              enabled: true,
              user: 'kado',
              password: 'kado'
            }
          },
          interface: {
            admin: { enabled: true },
            main: { enabled: true }
          },
          module: {
            blog: { enabled: true },
            setting: { enabled: true },
            staff: { enabled: true }
          }
        })
      }
      process.argv = process.argv.splice(0,2)
      return K.go('test')
    })
    //remove staff and stop services
    after(() => {
      return K.stop()
    })
    describe('interfaces',() => {
      describe('cli',() => {
        //here we should loop through the modules and load their tests
        let modInfo
        let module
        let tests
        let params = {}
        Object.keys(K.modules).forEach((m) => {
          modInfo = K.modules[m]
          module = require(modInfo.root + '/kado.js')
          if(!module || 'function' !== typeof module.test) return
          tests = module.test()
          if('object' === typeof tests && 'function' === typeof tests.cli){
            tests.cli(K,expect,request,exec,params)
          }
        })
      })
      describe('admin',() => {
        const baseUrl = 'http://127.0.0.1:3000'
        it('should be up',() => {
          return request.getAsync({
            url: baseUrl
          })
            .then((res) => {
              expect(res.statusCode).to.equal(200)
              expect(res.body).to.match(/<html/)
            })
        })
        it('should have a login page',() => {
          return request.getAsync({
            url: baseUrl + '/login'
          })
            .then((res) => {
              expect(res.statusCode).to.equal(200)
              expect(res.body).to.match(/login/i)
            })
        })
        describe('routes',() => {
          let cookieJar = request.jar()
          let doLogin = () => {
            return request.postAsync({
              url: baseUrl + '/login',
              jar: cookieJar,
              json: {
                email: 'test@test.com',
                password: 'test'
              }
            })
              .then((res) => {
                cookieJar._isLoggedIn = true
                expect(res.body.success).to.match(/Login success/)
              })
          }
          let doLogout = () => {
            return request.getAsync({
              url: baseUrl + '/logout',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/<h2>Login<\/h2>/)
                cookieJar = null
              })
          }
          before(() => {
            return exec('node app staff create -e test@test.com -p test -n test')
              .then((result) => {
                expect(result).to.match(/Staff member created!/i)
              })
          })
          after(() => {
            return P.try(() => {
              if(cookieJar){
                return doLogout()
              }
            })
              .then(() => {
                return exec('node app staff remove -e test@test.com')
              })
              .then((result) => {
                expect(result).to.match(/Staff member removed successfully!/i)
              })
          })
          describe('login',() => {
            it('should login',() => {
              return doLogin()
            })
          })
          //here we should loop through the modules and load their tests
          let modInfo
          let module
          let tests
          let params = {
            admin: {
              baseUrl: baseUrl,
              cookieJar: cookieJar,
              doLogin: doLogin,
              doLogout: doLogout
            }
          }
          Object.keys(K.modules).forEach((m) => {
            modInfo = K.modules[m]
            module = require(modInfo.root + '/kado.js')
            if(!module || 'function' !== typeof module.test) return
            tests = module.test()
            if('object' === typeof tests && 'function' === typeof tests.admin){
              tests.admin(K,expect,request,exec,params)
            }
          })
          describe('logout',() => {
            before(() => {
              if(!cookieJar) return doLogin()
            })
            it('should logout',() => {
              return doLogout()
            })
          })
        })
      })
      describe('main',() => {
        const baseUrl = 'http://127.0.0.1:3001'
        it('should be up',() => {
          return request.getAsync({
            url: baseUrl
          })
            .then((res) => {
              expect(res.statusCode).to.equal(200)
              expect(res.body).to.match(/<html/)
            })
        })
        it('should have a home page',() => {
          return request.getAsync({
            url: baseUrl
          })
            .then((res) => {
              expect(res.statusCode).to.equal(200)
              //expect(res.body).to.match(/Welcome to Kado/)
              expect(res.body).to.match(/<body>/)
            })
        })
        describe('routes',() => {
          let cookieJar = request.jar()
          //here we should loop through the modules and load their tests
          let modInfo
          let module
          let tests
          let params = {
            main: {
              baseUrl: baseUrl,
              cookieJar: cookieJar,
            }
          }
          Object.keys(K.modules).forEach((m) => {
            modInfo = K.modules[m]
            module = require(modInfo.root + '/kado.js')
            if(!module || 'function' !== typeof module.test) return
            tests = module.test()
            if('object' === typeof tests && 'function' === typeof tests.main){
              tests.main(K,expect,request,exec,params)
            }
          })
        })
      })
    })
  })
  run()
})
