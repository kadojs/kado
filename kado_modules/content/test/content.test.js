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
}

/**
 * Define tests
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
  describe('content admin',() => {
    let contentId = null
    let removeContent = () => {
      return request.postAsync({
        url: adminBaseUrl + '/content/remove?id=' + contentId,
        jar: adminCookieJar,
        json:true
      })
        .then((res) => {
          expect(res.body.success).to.match(/Content\(s\) removed/)
          contentId = null
        })
    }
    before(() => {
      if(!adminCookieJar._isLoggedIn) return doLogin()
    })
    after(() => {
      if(contentId) removeContent()
    })
    it('should list',() => {
      return request.getAsync({
        url: adminBaseUrl + '/content/list',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Content/)
        })
    })
    it('should show creation page',() => {
      return request.getAsync({
        url: adminBaseUrl + '/content/create',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Create Entry/)
        })
    })
    it('should allow creation',() => {
      return request.postAsync({
        url: adminBaseUrl + '/content/save',
        jar: adminCookieJar,
        json: {
          title: 'Test Content',
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
        url: adminBaseUrl + '/content/save',
        jar: adminCookieJar,
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
}
