'use strict';


/**
 * CLI tests
 * @param {object} K - The Kado object
 * @param {object} expect - Chai expect object
 * @param {object} request - HTTP request object
 * @param {function} exec - Child process execution function returns a Promise
 */
exports.cli = (K,expect,request,exec) => {
  describe('<%moduleName%> cli',() => {
    let <%moduleName%>Id = null
    after(() => {
      if(<%moduleName%>Id) return exec('node app <%moduleName%> remove -i ' + <%moduleName%>Id)
    })
    it('should allow <%moduleName%> creation from cli',() => {
      return exec('node app <%moduleName%> create -t test -c test')
        .then((result) => {
          expect(result).to.match(/<%moduleModelName%> entry created: \d+/)
          <%moduleName%>Id = result.match(/<%moduleModelName%> entry created: (\d+)/)[1]
        })
    })
    it('should allow <%moduleName%> change from cli',() => {
      return exec('node app <%moduleName%> update -i ' + <%moduleName%>Id + ' -t test2 -c test')
        .then((result) => {
          expect(result).to.match(/<%moduleModelName%> entry updated successfully!/i)
        })
    })
    it('should allow <%moduleName%> deletion from cli',() => {
      return exec('node app <%moduleName%> remove -i ' + <%moduleName%>Id)
        .then((result) => {
          expect(result).to.match(/<%moduleModelName%> entry removed successfully!/i)
          <%moduleName%>Id = null
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
  describe('<%moduleName%> admin',() => {
    let <%moduleName%>Id = null
    let remove<%moduleModelName%> = () => {
      return request.postAsync({
        url: adminBaseUrl + '/<%moduleName%>/remove?id=' + <%moduleName%>Id,
        jar: adminCookieJar,
        json: true
      })
        .then((res) => {
          expect(res.body.success).to.match(/<%moduleModelName%>\(s\) removed/)
          <%moduleName%>Id = null
        })
    }
    before(() => {
      if(!adminCookieJar._isLoggedIn) return doLogin()
    })
    after(() => {
      if(<%moduleName%>Id) remove<%moduleModelName%>()
    })
    it('should list',() => {
      return request.getAsync({
        url: adminBaseUrl + '/<%moduleName%>/list',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/<%moduleModelName%>/)
        })
    })
    it('should show creation page',() => {
      return request.getAsync({
        url: adminBaseUrl + '/<%moduleName%>/create',
        jar: adminCookieJar
      })
        .then((res) => {
          expect(res.body).to.match(/Create Entry/)
        })
    })
    it('should allow creation',() => {
      return request.postAsync({
        url: adminBaseUrl + '/<%moduleName%>/save',
        jar: adminCookieJar,
        json: {
          title: 'Test <%moduleModelName%>',
          uri: 'test-<%moduleName%>',
          content: 'testing the <%moduleName%>',
          html: '<p>testing the <%moduleName%></p>'
        }
      })
        .then((res) => {
          expect(+res.body.<%moduleName%>.id).to.be.a('number')
          <%moduleName%>Id = +res.body.<%moduleName%>.id
        })
    })
    it('should allow modification',() => {
      return request.postAsync({
        url: adminBaseUrl + '/<%moduleName%>/save',
        jar: adminCookieJar,
        json: {
          id: <%moduleName%>Id,
          title: 'Test <%moduleName%> 2',
          uri: 'test-<%moduleName%>-2',
          content: 'testing the <%moduleName%> 2',
          html: '<p>testing the <%moduleName%> 2</p>'
        }
      })
        .then((res) => {
          expect(res.body.<%moduleName%>.id).to.be.a('number')
          expect(+res.body.<%moduleName%>.id).to.equal(<%moduleName%>Id)
        })
    })
    it('should allow deletion',() => {
      return remove<%moduleModelName%>()
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
  describe('<%moduleName%> main',() => {
    let <%moduleName%>Id = null
    before(() => {
      return exec('node app <%moduleName%> create -t test -c test')
        .then((result) => {
          expect(result).to.match(/<%moduleModelName%> entry created: \d+/)
          <%moduleName%>Id = result.match(/<%moduleModelName%> entry created: (\d+)/)[1]
        })
    })
    after(() => {
      return exec('node app <%moduleName%> remove -i ' + <%moduleName%>Id)
        .then((result) => {
          expect(result).to.match(/<%moduleModelName%> entry removed successfully!/i)
          <%moduleName%>Id = null
        })
    })
    it('should allow viewing',() => {
      return request.getAsync({
        url: mainBaseUrl + '/<%moduleName%>/test',
        jar: mainCookieJar
      })
        .then((res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.body).to.match(/test/)
        })
    })
  })
}
