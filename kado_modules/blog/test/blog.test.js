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


/**
 * CLI tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 */
exports.cli = (K,expect,request,exec) => {
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
}


/**
 * Admin tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 * @param {function} params - An Object containing test specific
 */
exports.admin = (K,expect,request,exec,params) => {
  //expand some parameters
  let adminBaseUrl = params.admin.baseUrl
  let adminCookieJar = params.admin.cookieJar
  let doLogin = params.admin.doLogin
  describe('blog admin',() => {
    let blogId = null
    let removeBlog = () => {
      return request.postAsync({
        url: adminBaseUrl + '/blog/remove?id=' + blogId,
        jar: adminCookieJar,
        json: true
      })
        .then((res) => {
          expect(res.body.success).to.match(/Blog\(s\) removed/)
          blogId = null
        })
    }
    before(() => {
      if(!adminCookieJar._isLoggedIn) return doLogin()
    })
    after(() => {
      if(blogId) removeBlog()
    })
    it('should list',() => {
      return request.getAsync({
        url: adminBaseUrl + '/blog/list',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Blog/)
        })
    })
    it('should show creation page',() => {
      return request.getAsync({
        url: adminBaseUrl + '/blog/create',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Create Entry/)
        })
    })
    it('should allow creation',() => {
      return request.postAsync({
        url: adminBaseUrl + '/blog/save',
        jar: adminCookieJar,
        json: {
          title: 'Test Blog',
          uri: 'kado-test-blog',
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
        url: adminBaseUrl + '/blog/save',
        jar: adminCookieJar,
        json: {
          id: blogId,
          title: 'Test blog 2',
          uri: 'kado-test-blog-2',
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
}


/**
 * Main tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 * @param {function} params - An Object containing test specific
 */
exports.main = (K,expect,request,exec,params) => {
  //expand some parameters
  let mainBaseUrl = params.main.baseUrl
  let mainCookieJar = params.main.cookieJar
  describe('blog main',() => {
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
        url: mainBaseUrl + '/blog/test',
        jar: mainCookieJar
      })
        .then((res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.body).to.match(/test/)
        })
    })
  })
}
