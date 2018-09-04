'use strict';

//module properties
exports._kado = {
  kado: true,
  name: 'staff',
  title: 'Staff',
  description: 'Manage Kado Staff',
  admin: {
    providesAuthentication: true
  }
}


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 */
exports.db = (K,db) => {
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/model/Staff.js')
}


/**
 * Authenticate requests
 * @param {K} K Master Kado Object
 * @param {string} username
 * @param {string} password
 * @param {function} done
 */
exports.authenticate = (K,username,password,done) => {
  let admin = require('./admin')
  let userLogin = (email,password) => {
    return admin.doLogin(email,password)
  }
  userLogin(username,password)
    .then((user) => {
      done(null,true,user.dataValues)
    })
    .catch((e) => {
      done(e,false)
    })
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin')
  //staff routes
  app.get('/staff',(req,res) => {
    res.redirect(301,'/staff/list')
  })
  app.get('/staff/list',admin.list)
  app.get('/staff/create',admin.create)
  app.get('/staff/edit',admin.edit)
  app.post('/staff/save',admin.save)
  app.post('/staff/remove',admin.remove)
  app.get('/staff/remove',admin.remove)
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/staff')
}
