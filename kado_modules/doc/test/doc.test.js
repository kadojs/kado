'use strict';

/**
 * Define tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 * @param {function} params - An Object containing test specific
 */
module.exports = (K,expect,request,exec,params) => {
  let P = K.bluebird
  //expand some parameters
  let adminBaseUrl = params.admin.baseUrl
  let adminCookieJar = params.admin.cookieJar
  let doLogin = params.admin.doLogin
  //let mainBaseUrl = params.main.baseUrl
  //let mainCookieJar = params.main.cookieJar
  describe('doc admin',() => {
    let docId = null
    let docProjectId = null
    let docProjectVersionId = null
    let removeDoc = () => {
      return request.postAsync({
        url: adminBaseUrl + '/doc/remove?id=' + docId,
        jar: adminCookieJar,
        json:true
      })
        .then((res) => {
          expect(res.body.success).to.match(/Doc\(s\) removed/)
          docId = null
          return request.postAsync({
            url: adminBaseUrl + '/doc/version/remove?id=' +
              docProjectVersionId,
            jar: adminCookieJar,
            json: true
          })
        })
        .then((res) => {
          expect(res.body.success).to.match(/Doc Project Version removed/)
          docProjectVersionId = null
          return request.postAsync({
            url: adminBaseUrl + '/doc/project/remove?id=' +
              docProjectId,
            jar: adminCookieJar,
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
        if(!adminCookieJar) return doLogin()
      })
        .then(() => {
          return request.postAsync({
            url: adminBaseUrl + '/doc/project/save',
            jar: adminCookieJar,
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
            url: adminBaseUrl + '/doc/version/save',
            jar: adminCookieJar,
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
        url: adminBaseUrl + '/doc/list',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Doc/)
        })
    })
    it('should show creation page',() => {
      return request.getAsync({
        url: adminBaseUrl + '/doc/create',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/DocProjectVersionId/)
        })
    })
    it('should allow creation',() => {
      return request.postAsync({
        url: adminBaseUrl + '/doc/save',
        jar: adminCookieJar,
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
        url: adminBaseUrl + '/doc/save',
        jar: adminCookieJar,
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
}
