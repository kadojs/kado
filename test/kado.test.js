'use strict';
const K = require('../helpers/kado')

describe('kado',function(){
  this.timeout(10000)
  //start servers and create a user
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
        api: { enabled: false },
        client: { enabled: false },
        main: { enabled: false }
      },
      module: {
        blog: { enabled: true },
        setting: { enabled: true },
        user: { enabled: true }
      }
    })
    return K.go('test')
  })
  //remove user and stop services
  after(function(done){
    K.stop(done)
  })
  //test interfaces
  describe('interfaces',function(){
    it('admin')
    it('api')
    it('client')
    it('main')
  })
})
