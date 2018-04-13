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
  let staff = require('./staff')
  let userLogin = function(email,password){
    return staff.doLogin(email,password)
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
  let staff = require('./staff')
  //staff routes
  app.get('/staff',function(req,res){
    res.redirect(301,'/staff/list')
  })
  app.get('/staff/list',staff.list)
  app.get('/staff/create',staff.create)
  app.get('/staff/edit',staff.edit)
  app.post('/staff/list',staff.listAction)
  app.post('/staff/save',staff.save)
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
