'use strict';


/**
 * Identify that we are a Kado module
 * @type {boolean}
 */
exports.kado = true


/**
 * Module Name
 * @type {string}
 */
exports.name = 'staff'


/**
 * Module title for display purposes
 * @type {string}
 */
exports.title = 'Staff'


/**
 * Module description
 * @type {string}
 */
exports.description = 'Manage Kado Staff'


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 */
exports.db = function(K,db){
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
exports.authenticate = function(K,username,password,done){
  let admin = require('./admin')
  let userLogin = function(email,password){
    return admin.doLogin(email,password)
  }
  userLogin(username,password)
    .then(function(user){
      done(null,true,user.dataValues)
    })
    .catch(function(e){
      done(e,false)
    })
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = function(K,app){
  let admin = require('./admin')
  //staff routes
  app.get('/staff',function(req,res){
    res.redirect(301,'/staff/list')
  })
  app.get('/staff/list',admin.list)
  app.get('/staff/create',admin.create)
  app.get('/staff/edit',admin.edit)
  app.post('/staff/list',admin.listAction)
  app.post('/staff/save',admin.save)
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = function(K,args){
  args.splice(2,1)
  process.argv = args
  require('./bin/staff')
}
