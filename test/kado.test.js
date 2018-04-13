'use strict';
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
  before(function(){
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
        api: { enabled: true },
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
  after(function(){
    return K.stop()
  })
  //test interfaces
  describe('generator',function(){
    it('should create app.js',function(){
      if(fs.existsSync('app.js.bak')) fs.unlinkSync('app.js.bak')
      if(fs.existsSync('app.js')) fs.renameSync('app.js','app.js.bak')
      return exec(
        'node bin/kado bootstrap --app Test ' +
        '--enable-all --dbsequelize --dbsuser kado --dbspassword kado'
      )
        .then(function(){
          expect(fs.existsSync('app.js')).to.equal(true)
        })
    })
  })
  describe('interfaces',function(){
    describe('admin',function(){
      const baseUrl = 'http://127.0.0.1:3000'
      it('should be up',function(){
        return request.getAsync({
          url: baseUrl
        })
          .then(function(res){
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.match(/<html>/)
          })
      })
      it('should have a login page',function(){
        return request.getAsync({
          url: baseUrl + '/login'
        })
          .then(function(res){
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.match(/login/i)
          })
      })
      describe('staff cli',function(){
        it('should allow staff sanitizing from cli',function(){
          return exec('node app staff remove -e test@test.com')
            .then(function(result){
              expect(result).to.match(/Staff member removed successfully!/i)
            })
        })
        it('should allow staff creation from cli',function(){
          return exec('node app staff create -e test@test.com -p test -n test')
            .then(function(result){
              expect(result).to.match(/Staff member created!/i)
            })
        })
        it('should allow staff password change from cli',function(){
          return exec('node app staff update -e test@test.com -p test2 -n test')
            .then(function(result){
              expect(result).to.match(/Staff member updated successfully!/i)
            })
        })
        it('should allow staff deletion from cli',function(){
          return exec('node app staff remove -e test@test.com')
            .then(function(result){
              expect(result).to.match(/Staff member removed successfully!/i)
            })
        })
      })
      describe('blog cli',function(){
        let blogId = null
        after(function(){
          if(blogId) return exec('node app blog remove -i ' + blogId)
        })
        it('should allow blog creation from cli',function(){
          return exec('node app blog create -t test -c test')
            .then(function(result){
              expect(result).to.match(/Blog entry created: \d+/)
              blogId = result.match(/Blog entry created: (\d+)/)[1]
            })
        })
        it('should allow blog change from cli',function(){
          return exec('node app blog update -i ' + blogId + ' -t test2 -c test')
            .then(function(result){
              expect(result).to.match(/Blog entry updated successfully!/i)
            })
        })
        it('should allow blog deletion from cli',function(){
          return exec('node app blog remove -i ' + blogId)
            .then(function(result){
              expect(result).to.match(/Blog entry removed successfully!/i)
              blogId = null
            })
        })
      })
      describe('routes',function(){
        let cookieJar = null
        let doLogin = function(){
          cookieJar = request.jar()
          return request.postAsync({
            url: baseUrl + '/login',
            jar: cookieJar,
            form: {
              email: 'test@test.com',
              password: 'test'
            }
          })
            .then(function(res){
              expect(res.body).to.match(/Found. Redirecting to \//)
            })
        }
        let doLogout = function(){
          return request.getAsync({
            url: baseUrl + '/logout',
            jar: cookieJar
          })
            .then(function(res){
              expect(res.body).to.match(/<h2>Login<\/h2>/)
              cookieJar = null
            })
        }
        before(function(){
          return exec('node app staff create -e test@test.com -p test -n test')
            .then(function(result){
              expect(result).to.match(/Staff member created!/i)
            })
        })
        after(function(){
          return P.try(function(){
            if(cookieJar){
              return doLogout()
            }
          })
            .then(function(){
              return exec('node app staff remove -e test@test.com')
            })
            .then(function(result){
              expect(result).to.match(/Staff member removed successfully!/i)
            })
        })
        describe('login',function(){
          it('should login',function(){
            return doLogin()
          })
        })
        describe('blog',function(){
          let blogId = null
          let removeBlog = function(){
            return request.postAsync({
              url: baseUrl + '/blog/list',
              jar: cookieJar,
              form: {
                remove: [blogId]
              }
            })
              .then(function(res){
                expect(res.body).to.match(/Found. Redirecting to \/blog\/list/)
                blogId = null
              })
          }
          before(function(){
            if(!cookieJar) return doLogin()
          })
          after(function(){
            if(blogId) removeBlog()
          })
          it('should list',function(){
            return request.getAsync({
              url: baseUrl + '/blog/list',
              jar: cookieJar
            })
              .then(function(res){
                expect(res.body).to.match(/Blog/)
              })
          })
          it('should show creation page',function(){
            return request.getAsync({
              url: baseUrl + '/blog/create',
              jar: cookieJar
            })
              .then(function(res){
                expect(res.body).to.match(/Create Entry/)
              })
          })
          it('should allow creation',function(){
            return request.postAsync({
              url: baseUrl + '/blog/save',
              jar: cookieJar,
              form: {
                title: 'Test Blog',
                content: 'testing the blog'
              }
            })
              .then(function(res){
                expect(res.body).to.match(/Found. Redirecting to \/blog\/list/)
                expect(+res.headers.blogid).to.be.a('number')
                blogId = +res.headers.blogid
              })
          })
          it('should allow modification',function(){
            return request.postAsync({
              url: baseUrl + '/blog/save',
              jar: cookieJar,
              form: {
                id: blogId,
                title: 'Test blog 2',
                content: 'testing the blog 2'
              }
            })
              .then(function(res){
                expect(res.body).to.match(/Found. Redirecting to \/blog\/list/)
                expect(+res.headers.blogid).to.equal(blogId)
              })
          })
          it('should allow deletion',function(){
            return removeBlog()
          })
        })
        describe('staff',function(){
          let staffId = null
          let removeStaff = function(){
            return request.postAsync({
              url: baseUrl + '/staff/list',
              jar: cookieJar,
              form: {
                remove: [staffId]
              }
            })
              .then(function(res){
                expect(res.body).to.match(/Found. Redirecting to \/staff\/list/)
                staffId = null
              })
          }
          before(function(){
            if(!cookieJar) return doLogin()
          })
          after(function(){
            if(staffId) return removeStaff()
          })
          it('should list',function(){
            return request.getAsync({
              url: baseUrl + '/staff/list',
              jar: cookieJar
            })
              .then(function(res){
                expect(res.body).to.match(/Staff/)
              })
          })
          it('should show creation page',function(){
            return request.getAsync({
              url: baseUrl + '/staff/create',
              jar: cookieJar
            })
              .then(function(res){
                expect(res.body).to.match(/Create Staff/)
              })
          })
          it('should allow creation',function(){
            return exec('node app staff remove -e testing@testing.com')
              .then(function(){
                return request.postAsync({
                  url: baseUrl + '/staff/save',
                  jar: cookieJar,
                  form: {
                    staffName: 'Test Staff',
                    staffEmail: 'testing@testing.com',
                    staffPassword: 'testing',
                    staffPasswordConfirm: 'testing'
                  }
                })
              })
              .then(function(res){
                expect(res.body).to.match(/Found. Redirecting to \/staff\/list/)
                expect(+res.headers.staffid).to.be.a('number')
                staffId = +res.headers.staffid
              })
          })
          it('should allow modification',function(){
            return request.postAsync({
              url: baseUrl + '/staff/save',
              jar: cookieJar,
              form: {
                id: staffId,
                staffName: 'Test Staff 2',
                staffEmail: 'testing@testing.com',
                staffPassword: 'testing2',
                staffPasswordConfirm: 'testing2'
              }
            })
              .then(function(res){
                expect(res.body).to.match(/Found. Redirecting to \/staff\/list/)
                expect(+res.headers.staffid).to.equal(staffId)
              })
          })
          it('should allow deletion',function(){
            return removeStaff()
          })
        })
        describe('logout',function(){
          before(function(){
            if(!cookieJar) return doLogin()
          })
          it('should logout',function(){
            return doLogout()
          })
        })
      })
    })
    describe('api',function(){
      const baseUrl = 'http://127.0.0.1:3001'
      let cookieJar = null
      let doLogin = function(){
        cookieJar = request.jar()
        return request.postAsync({
          url: baseUrl + '/login',
          jar: cookieJar,
          form: {
            email: 'test@test.com',
            password: 'test'
          }
        })
          .then(function(res){
            res.body = JSON.parse(res.body)
            expect(res.body.success).to.equal('Login success')
          })
      }
      let doLogout = function(){
        return request.getAsync({
          url: baseUrl + '/logout',
          jar: cookieJar
        })
          .then(function(res){
            res.body = JSON.parse(res.body)
            expect(res.body.success).to.equal('Logout success')
            cookieJar = null
          })
      }
      before(function(){
        return exec('node app staff remove -e test@test.com')
          .then(function(){
            return exec(
              'node app staff create -e test@test.com -p test -n test'
            )
          })
          .then(function(result){
            expect(result).to.match(/Staff member created!/i)
          })
      })
      after(function(){
        return P.try(function(){
          if(cookieJar){
            return doLogout()
          }
        })
          .then(function(){
            return exec('node app staff remove -e test@test.com')
          })
          .then(function(result){
            expect(result).to.match(/Staff member removed successfully!/i)
          })
      })
      it('should be up',function(){
        return request.getAsync({
          url: baseUrl
        })
          .then(function(res){
            expect(res.body).to.match(/Kado API Login/)
          })
      })
      it('should provide a session',function(){
        return doLogin()
      })
      describe('routes',function(){
        before(function(){
          if(!cookieJar) return doLogin()
        })
        describe('blog',function(){
          let blogId = null
          let removeBlog = function(){
            return request.postAsync({
              url: baseUrl + '/blog/remove',
              jar: cookieJar,
              json: {
                remove: blogId
              }
            })
              .then(function(res){
                expect(res.body.success).to.equal('Blog removed successfully')
                blogId = null
              })
          }
          before(function(){
            if(!cookieJar) return doLogin()
          })
          after(function(){
            if(blogId) removeBlog()
          })
          it('should allow creation',function(){
            return request.postAsync({
              url: baseUrl + '/blog/save',
              jar: cookieJar,
              json: {
                title: 'New Test Blog',
                content: 'testing the blog via api'
              }
            })
              .then(function(res){
                expect(res.body.id).to.be.a('number')
                blogId = res.body.id
              })
          })
          it('should allow modification',function(){
            return request.postAsync({
              url: baseUrl + '/blog/save',
              jar: cookieJar,
              json: {
                id: blogId,
                title: 'New Test Blog 2',
                content: 'testing updates view the blog api'
              }
            })
              .then(function(res){
                expect(res.body.id).to.be.a('number')
                expect(res.body.title).to.equal('New Test Blog 2')
              })
          })
          it('should allow deletion',function(){
            return removeBlog()
          })
        })
        describe('logout',function(){
          it('should logout',function(){
            return doLogout()
          })
        })
      })
    })
    describe('main',function(){
      const baseUrl = 'http://127.0.0.1:3002'
      it('should be up',function(){
        return request.getAsync({
          url: baseUrl
        })
          .then(function(res){
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.match(/<html>/)
          })
      })
      it('should have a home page',function(){
        return request.getAsync({
          url: baseUrl
        })
          .then(function(res){
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.match(/Welcome to Kado/)
          })
      })
      describe('routes',function(){
        describe('blog',function(){
          let blogId = null
          before(function(){
            return exec('node app blog create -t test -c test')
              .then(function(result){
                expect(result).to.match(/Blog entry created: \d+/)
                blogId = result.match(/Blog entry created: (\d+)/)[1]
              })
          })
          after(function(){
            return exec('node app blog remove -i ' + blogId)
              .then(function(result){
                expect(result).to.match(/Blog entry removed successfully!/i)
                blogId = null
              })
          })
          it('should allow viewing',function(){
            return request.getAsync({
              url: baseUrl + '/blog/test'
            })
              .then(function(res){
                expect(res.statusCode).to.equal(200)
                expect(res.body).to.match(/test/)
              })
          })
        })
      })
    })
  })
})
