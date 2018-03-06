'use strict';
var bcrypt = require('bcrypt')


/**
 * Identify that we are a Kado module
 * @type {boolean}
 */
exports.kado = true


/**
 * Module Name
 * @type {string}
 */
exports.name = 'user'


/**
 * Module title for display purposes
 * @type {string}
 */
exports.title = 'Users'


/**
 * Module description
 * @type {string}
 */
exports.description = 'Manage Kado Users and Permissions'


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 */
exports.db = function(K,db){
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/model/User.js')
  db.sequelize.import(__dirname + '/model/UserActivity.js')
  db.sequelize.import(__dirname + '/model/UserPermission.js')
  db.sequelize.import(__dirname + '/model/UserRole.js')
  db.sequelize.import(__dirname + '/model/UserRolePermission.js')
  var User = db.sequelize.models.User
  var UserActivity = db.sequelize.models.UserActivity
  var UserRole = db.sequelize.models.UserRole
  var UserPermission = db.sequelize.models.UserPermission
  var UserRolePermission = db.sequelize.models.UserRolePermission
  User.hasMany(UserActivity)
  User.hasMany(UserRole)
  User.hasMany(UserPermission)
  UserRole.hasMany(UserRolePermission)
  UserRole.belongsToMany(User,{through: 'UsersRoles'})
  UserActivity.belongsTo(User)
  UserPermission.belongsTo(User)
  UserRolePermission.belongsTo(UserRole)
}


/**
 * Authenticate requests
 * @param {K} K Master Kado Object
 * @param {string} username
 * @param {string} password
 * @param {function} done
 */
exports.authenticate = function(K,username,password,done){
  var userLogin = function(email,password){
    var User = K.db.sequelize.models.User
    var now = (+new Date()) / 1000 //as a timestamp
    var user
    return User.find({where: {email: email}})
      .then(function(result){
        if(!result) throw new Error('No user found')
        if(!result.active) throw new Error('User inactive')
        //globalize seller
        user = result
        //verify password
        return bcrypt.compareAsync(password,user.password)
      })
      .then(function(match){
        if(!match) throw new Error('Invalid password')
        return user.updateAttributes({dateSeen: now})
      })
      .then(function(){
        //success return our seller
        return user
      })
      .catch(function(err){
        if(user) user.updateAttributes({dateFail: now})
        throw err
      })
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
  var user = require('./user')
  var role = require('./role')
  var permission = require('./permission')
  //user routes
  app.get('/user',function(req,res){
    res.redirect(301,'/user/list')
  })
  app.get('/user/list',user.list)
  app.get('/user/create',user.create)
  app.get('/user/edit',user.edit)
  app.get('/user/manage',user.manage)
  app.post('/user/list',user.listAction)
  app.post('/user/save',user.save)
  //role routes
  app.get('/user/role',function(req,res){
    res.redirect(301,'/user/role/list')
  })
  app.get('/user/role/list',role.list)
  app.get('/user/role/edit',role.edit)
  app.get('/user/role/create',role.create)
  app.post('/user/role/list',role.listAction)
  app.post('/user/role/save',role.save)
  //permission routes
  app.get('/user/permission',function(req,res){
    res.redirect(301,'/user/permission/list')
  })
  app.get('/user/permission/list',permission.list)
  app.get('/user/permission/edit',permission.edit)
  app.get('/user/permission/create',permission.create)
  app.post('/user/permission/list',permission.listAction)
  app.post('/user/permission/save',permission.save)
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = function(K,args){
  args.splice(2,1)
  process.argv = args
  require('./bin/user')
}
