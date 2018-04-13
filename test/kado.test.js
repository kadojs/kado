'use strict';
const K = require('../helpers/kado')

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
        client: { enabled: true },
        main: { enabled: true }
      },
      module: {
        blog: { enabled: true },
        setting: { enabled: true },
        user: { enabled: true }
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
  describe('interfaces',function(){
    it('admin')
    it('api')
    it('client')
    it('main')
  })
})
