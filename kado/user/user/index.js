'use strict';
var list = require(process.env.KADO_HELPERS + '/list')
var sequelize = require(process.env.KADO_HELPERS + '/sequelize')()

var permissionLevels = require('../permission/helpers/levels')

var User = sequelize.models.User
var UserActivity = sequelize.models.UserActivity
var UserRole = sequelize.models.UserRole
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
  User.findAndCountAll({
    where: sequelize.or(
      {email: {like: '%' + search + '%'}},
      {name: {like: '%' + search + '%'}}
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
        list: result.rows
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
  list.remove(User,req.body.remove)
    .then(function(){
      req.flash('success','User(s) removed successfully')
      res.redirect('/user/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Create User
 * @param {object} req
 * @param {object} res
 */
exports.create = function(req,res){
  res.render(__dirname + '/view/create')
}


/**
 * Manage a User
 * @param {object} req
 * @param {object} res
 */
exports.manage = function(req,res){
  User.findOne({
    where: {id: req.query.id},
    include: [{model: UserActivity, limit: 10},UserPermission,UserRole]
  })
    .then(function(result){
      if(!result) throw new Error('User not found')
      res.render(__dirname + '/view/manage',{
        user: result,
        levels: permissionLevels
      })
    })
}


/**
 * User edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = function(req,res){
  User.findById(req.query.id)
    .then(function(result){
      if(!result) throw new Error('User not found')
      res.render(__dirname + '/view/edit',{user: result})
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Save User
 * @param {object} req
 * @param {object} res
 */
exports.save = function(req,res){
  var data = req.body
  User.findById(data.id)
    .then(function(doc){
      if(!doc) doc = User.build()
      doc.name = data.name
      doc.email = data.email
      if(data.password) doc.password = data.password
      doc.active = !!data.active
      return doc.save()
    })
    .then(function(){
      req.flash('success','User saved')
      res.redirect('/user/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
