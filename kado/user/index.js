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
 * Register in Admin Interface
 * @param {object}app
 */
exports.admin = function(app){
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
