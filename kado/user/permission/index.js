'use strict';
var list = require(process.env.KADO_HELPERS + '/list')
var sequelize = require(process.env.KADO_HELPERS + '/sequelize')()

var config = require(process.env.KADO_CONFIG_FILE)
var levels = require('./helpers/levels')

var UserPermission = sequelize.models.UserPermission


/**
 * List Users
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  var limit = +req.query.limit || 10
  var start = +req.query.start || 0
  var search = req.query.search || ''
  if(start < 0) start = 0
  UserPermission.findAndCountAll({
    where: sequelize.or(
      {uri: {like: '%' + search + '%'}},
      {interface: {like: '%' + search + '%'}}
    ),
    limit: limit,
    offset: start
  })
    .then(function(result){
      res.render(__dirname + '/view/list',{
        page: list.pagination(start,result.count,limit),
        count: result.count,
        search: search,
        limit: limit,
        list: result.rows,
        levels: levels
      })
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * List action
 * @param {object} req
 * @param {object} res
 */
exports.listAction = function(req,res){
  list.remove(UserPermission,req.body.remove)
    .then(function(){
      req.flash('success','User Permission(s) removed successfully')
      res.redirect('/user/permission/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Create User Permission
 * @param {object} req
 * @param {object} res
 */
exports.create = function(req,res){
  res.render(__dirname + '/view/create',{
    interfaces: config.interfaces,
    levels: levels
  })
}


/**
 * User permission edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = function(req,res){
  UserPermission.findById(req.query.id)
    .then(function(result){
      if(!result) throw new Error('User Permission not found')
      res.render(__dirname + '/view/edit',{
        permission: result,
        interfaces: config.interfaces,
        levels: levels
      })
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Save User Permission
 * @param {object} req
 * @param {object} res
 */
exports.save = function(req,res){
  var data = req.body
  UserPermission.findById(data.id)
    .then(function(doc){
      if(!doc) doc = UserPermission.build()
      doc.interface = data.interface
      doc.uri = data.uri
      doc.level = data.level
      return doc.save()
    })
    .then(function(){
      req.flash('success','User Permission saved')
      res.redirect('/user/permission/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
