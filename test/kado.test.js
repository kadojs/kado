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
const expect = require('chai').expect
const fs = require('fs')
const request = require('request')

//make some promises
K.bluebird.promisifyAll(request)

describe('kado',function(){
  this.timeout(20000)
  //start servers and create a staff
  before(() => {
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
    process.argv = process.argv.splice(0,2)
    return K.go('test')
  })
  //remove staff and stop services
  after(() => {
    return K.stop()
  })
  //test interfaces
  describe('generator',() => {
    it('should create app.js',() => {
      if(fs.existsSync('app.js.bak')) fs.unlinkSync('app.js.bak')
      if(fs.existsSync('app.js')) fs.renameSync('app.js','app.js.bak')
      return exec(
        'node kado_modules/kado/bin/util bootstrap --app Test ' +
        '--dev --dbuser kado --dbpassword kado'
      )
        .then(() => {
          expect(fs.existsSync('app.js')).to.equal(true)
        })
    })
  })
  describe('interfaces',() => {
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
      describe('staff cli',() => {
        it('should allow staff sanitizing from cli',() => {
          return exec('node app staff remove -e test@test.com')
            .then((result) => {
              expect(result).to.match(/Staff member removed successfully!/i)
            })
        })
        it('should allow staff creation from cli',() => {
          return exec('node app staff create -e test@test.com -p test -n test')
            .then((result) => {
              expect(result).to.match(/Staff member created!/i)
            })
        })
        it('should allow staff password change from cli',() => {
          return exec('node app staff update -e test@test.com -p test2 -n test')
            .then((result) => {
              expect(result).to.match(/Staff member updated successfully!/i)
            })
        })
        it('should allow staff deletion from cli',() => {
          return exec('node app staff remove -e test@test.com')
            .then((result) => {
              expect(result).to.match(/Staff member removed successfully!/i)
            })
        })
      })
      describe('blog cli',() => {
        let blogId = null
        after(() => {
          if(blogId) return exec('node app blog remove -i ' + blogId)
        })
        it('should allow blog creation from cli',() => {
          return exec('node app blog create -t test -c test')
            .then((result) => {
              expect(result).to.match(/Blog entry created: \d+/)
              blogId = result.match(/Blog entry created: (\d+)/)[1]
            })
        })
        it('should allow blog change from cli',() => {
          return exec('node app blog update -i ' + blogId + ' -t test2 -c test')
            .then((result) => {
              expect(result).to.match(/Blog entry updated successfully!/i)
            })
        })
        it('should allow blog deletion from cli',() => {
          return exec('node app blog remove -i ' + blogId)
            .then((result) => {
              expect(result).to.match(/Blog entry removed successfully!/i)
              blogId = null
            })
        })
      })
      describe('content cli',() => {
        let contentId = null
        after(() => {
          if(contentId) return exec('node app content remove -i ' + contentId)
        })
        it('should allow content creation from cli',() => {
          return exec('node app content create -t test -c test')
            .then((result) => {
              expect(result).to.match(/Content entry created: \d+/)
              contentId = result.match(/Content entry created: (\d+)/)[1]
            })
        })
        it('should allow content change from cli',() => {
          return exec('node app content update -i ' + contentId + ' -t test2 -c test')
            .then((result) => {
              expect(result).to.match(/Content entry updated successfully!/i)
            })
        })
        it('should allow content deletion from cli',() => {
          return exec('node app content remove -i ' + contentId)
            .then((result) => {
              expect(result).to.match(/Content entry removed successfully!/i)
              contentId = null
            })
        })
      })
      describe('routes',() => {
        let cookieJar = null
        let doLogin = () => {
          cookieJar = request.jar()
          return request.postAsync({
            url: baseUrl + '/login',
            jar: cookieJar,
            json: {
              email: 'test@test.com',
              password: 'test'
            }
          })
            .then((res) => {
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
        describe('blog',() => {
          let blogId = null
          let removeBlog = () => {
            return request.postAsync({
              url: baseUrl + '/blog/remove?id=' + blogId,
              jar: cookieJar,
              json:true
            })
              .then((res) => {
                expect(res.body.success).to.match(/Blog\(s\) removed/)
                blogId = null
              })
          }
          before(() => {
            if(!cookieJar) return doLogin()
          })
          after(() => {
            if(blogId) removeBlog()
          })
          it('should list',() => {
            return request.getAsync({
              url: baseUrl + '/blog/list',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Blog/)
              })
          })
          it('should show creation page',() => {
            return request.getAsync({
              url: baseUrl + '/blog/create',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Create Entry/)
              })
          })
          it('should allow creation',() => {
            return request.postAsync({
              url: baseUrl + '/blog/save',
              jar: cookieJar,
              json: {
                title: 'Test Blog',
                uri: 'test-blog',
                content: 'testing the blog',
                html: '<p>testing the blog</p>'
              }
            })
              .then((res) => {
                expect(+res.body.blog.id).to.be.a('number')
                blogId = +res.body.blog.id
              })
          })
          it('should allow modification',() => {
            return request.postAsync({
              url: baseUrl + '/blog/save',
              jar: cookieJar,
              json: {
                id: blogId,
                title: 'Test blog 2',
                uri: 'test-blog-2',
                content: 'testing the blog 2',
                html: '<p>testing the blog 2</p>'
              }
            })
              .then((res) => {
                expect(res.body.blog.id).to.be.a('number')
                expect(+res.body.blog.id).to.equal(blogId)
              })
          })
          it('should allow deletion',() => {
            return removeBlog()
          })
        })
        describe('content',() => {
          let contentId = null
          let removeContent = () => {
            return request.postAsync({
              url: baseUrl + '/content/remove?id=' + contentId,
              jar: cookieJar,
              json:true
            })
              .then((res) => {
                expect(res.body.success).to.match(/Content\(s\) removed/)
                contentId = null
              })
          }
          before(() => {
            if(!cookieJar) return doLogin()
          })
          after(() => {
            if(contentId) removeContent()
          })
          it('should list',() => {
            return request.getAsync({
              url: baseUrl + '/content/list',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Content/)
              })
          })
          it('should show creation page',() => {
            return request.getAsync({
              url: baseUrl + '/content/create',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Create Entry/)
              })
          })
          it('should allow creation',() => {
            return request.postAsync({
              url: baseUrl + '/content/save',
              jar: cookieJar,
              json: {
                title: 'Test Blog',
                uri: 'test-content',
                content: 'testing the content',
                html: '<p>testing the content</p>'
              }
            })
              .then((res) => {
                expect(+res.body.content.id).to.be.a('number')
                contentId = +res.body.content.id
              })
          })
          it('should allow modification',() => {
            return request.postAsync({
              url: baseUrl + '/content/save',
              jar: cookieJar,
              json: {
                id: contentId,
                title: 'Test content 2',
                uri: 'test-content-2',
                content: 'testing the content 2',
                html: '<p>testing the content 2</p>'
              }
            })
              .then((res) => {
                expect(res.body.content.id).to.be.a('number')
                expect(+res.body.content.id).to.equal(contentId)
              })
          })
          it('should allow deletion',() => {
            return removeContent()
          })
        })
        describe('doc',() => {
          let docId = null
          let docProjectId = null
          let docProjectVersionId = null
          let removeDoc = () => {
            return request.postAsync({
              url: baseUrl + '/doc/remove?id=' + docId,
              jar: cookieJar,
              json:true
            })
              .then((res) => {
                expect(res.body.success).to.match(/Doc\(s\) removed/)
                docId = null
                return request.postAsync({
                  url: baseUrl + '/doc/version/remove?id=' +
                    docProjectVersionId,
                  jar: cookieJar,
                  json: true
                })
              })
              .then((res) => {
                expect(res.body.success).to.match(/Doc Project Version removed/)
                docProjectVersionId = null
                return request.postAsync({
                  url: baseUrl + '/doc/project/remove?id=' +
                    docProjectId,
                  jar: cookieJar,
                  json: true
                })
              })
              .then((res) => {
                expect(res.body.success).to.match(/Doc Project removed/)
                docProjectId = null
              })
          }
          before(() => {
            return P.try(() => {
              if(!cookieJar) return doLogin()
            })
              .then(() => {
                return request.postAsync({
                  url: baseUrl + '/doc/project/save',
                  jar: cookieJar,
                  json: {
                    name: 'Kado',
                    uri: 'kado'
                  }
                })
              })
              .then((res) => {
                expect(+res.body.item.id).to.be.a('number')
                docProjectId = +res.body.item.id
                return request.postAsync({
                  url: baseUrl + '/doc/version/save',
                  jar: cookieJar,
                  json: {
                    name: '3.x',
                    DocProjectId: docProjectId
                  }
                })
              })
              .then((res) => {
                expect(+res.body.item.id).to.be.a('number')
                docProjectVersionId = +res.body.item.id
              })
          })
          after(() => {
            if(docId) removeDoc()
          })
          it('should list',() => {
            return request.getAsync({
              url: baseUrl + '/doc/list',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Doc/)
              })
          })
          it('should show creation page',() => {
            return request.getAsync({
              url: baseUrl + '/doc/create',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/DocProjectVersionId/)
              })
          })
          it('should allow creation',() => {
            return request.postAsync({
              url: baseUrl + '/doc/save',
              jar: cookieJar,
              json: {
                title: 'Test Doc',
                uri: 'test-doc',
                content: 'testing the doc',
                html: '<p>testing the doc</p>',
                DocProjectVersionId: docProjectVersionId
              }
            })
              .then((res) => {
                expect(+res.body.item.id).to.be.a('number')
                docId = +res.body.item.id
              })
          })
          it('should allow modification',() => {
            return request.postAsync({
              url: baseUrl + '/doc/save',
              jar: cookieJar,
              json: {
                id: docId,
                title: 'Test Doc 2',
                uri: 'test-doc-2',
                content: 'testing the doc 2',
                html: '<p>testing the doc 2</p>',
                DocProjectVersionId: docProjectVersionId
              }
            })
              .then((res) => {
                expect(res.body.item.id).to.be.a('number')
                expect(+res.body.item.id).to.equal(docId)
              })
          })
          it('should allow deletion',() => {
            return removeDoc()
          })
        })
        describe('staff',() => {
          let staffId = null
          let removeStaff = () => {
            return request.getAsync({
              url: baseUrl + '/staff/remove?id=' + staffId,
              jar: cookieJar,
              json: {}
            })
              .then((res) => {
                expect(res.body.success).to.match(/Staff removed/)
                staffId = null
              })
          }
          before(() => {
            if(!cookieJar) return doLogin()
          })
          after(() => {
            if(staffId) return removeStaff()
          })
          it('should list',() => {
            return request.getAsync({
              url: baseUrl + '/staff/list',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Staff/)
              })
          })
          it('should show creation page',() => {
            return request.getAsync({
              url: baseUrl + '/staff/create',
              jar: cookieJar
            })
              .then((res) => {
                expect(res.body).to.match(/Create Staff/)
              })
          })
          it('should allow creation',() => {
            return exec('node app staff remove -e testing@testing.com')
              .then(() => {
                return request.postAsync({
                  url: baseUrl + '/staff/save',
                  jar: cookieJar,
                  json: {
                    staffName: 'Test Staff',
                    staffEmail: 'testing@testing.com',
                    staffPassword: 'testing',
                    staffPasswordConfirm: 'testing'
                  }
                })
              })
              .then((res) => {
                expect(res.body.staff.id).to.be.a('number')
                staffId = +res.body.staff.id
              })
          })
          it('should allow modification',() => {
            return request.postAsync({
              url: baseUrl + '/staff/save',
              jar: cookieJar,
              json: {
                id: staffId,
                staffName: 'Test Staff 2',
                staffEmail: 'testing@testing.com',
                staffPassword: 'testing2',
                staffPasswordConfirm: 'testing2'
              }
            })
              .then((res) => {
                expect(res.body.staff.id).to.be.a('number')
                expect(+res.body.staff.id).to.equal(staffId)
              })
          })
          it('should allow deletion',() => {
            return removeStaff()
          })
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
            expect(res.body).to.match(/Kado Main/)
          })
      })
      describe('routes',() => {
        describe('blog',() => {
          let blogId = null
          before(() => {
            return exec('node app blog create -t test -c test')
              .then((result) => {
                expect(result).to.match(/Blog entry created: \d+/)
                blogId = result.match(/Blog entry created: (\d+)/)[1]
              })
          })
          after(() => {
            return exec('node app blog remove -i ' + blogId)
              .then((result) => {
                expect(result).to.match(/Blog entry removed successfully!/i)
                blogId = null
              })
          })
          it('should allow viewing',() => {
            return request.getAsync({
              url: baseUrl + '/blog/test'
            })
              .then((res) => {
                expect(res.statusCode).to.equal(200)
                expect(res.body).to.match(/test/)
              })
          })
        })
      })
    })
  })
})
