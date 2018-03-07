'use strict';
var K = require('../../../index')
var list = K.list
var sequelize = K.db.sequelize

var UserRole = sequelize.models.UserRole


/**
 * List User Roles
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  var limit = +req.query.limit || 10
  var start = +req.query.start || 0
  var search = req.query.search || ''
  if(start < 0) start = 0
  UserRole.findAndCountAll({
    where: sequelize.or(
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
  list.remove(UserRole,req.body.remove)
    .then(function(){
      req.flash('success','User Role(s) removed successfully')
      res.redirect('/user/role/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Create User Role
 * @param {object} req
 * @param {object} res
 */
exports.create = function(req,res){
  res.render(__dirname + '/view/create')
}


/**
 * User Role edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = function(req,res){
  UserRole.findOne(req.query.id)
    .then(function(result){
      if(!result) throw new Error('User Role not found')
      res.render(__dirname + '/view/edit',{role: result})
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
  UserRole.findOne(data.id)
    .then(function(doc){
      if(!doc) doc = UserRole.build()
      doc.name = data.name
      doc.active = !!data.active
      return doc.save()
    })
    .then(function(){
      req.flash('success','User Role saved')
      res.redirect('/user/role/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
