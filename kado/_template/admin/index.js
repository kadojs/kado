'use strict';
const K = require('../../../index')
const list = K.list
const sequelize = K.db.sequelize

const {{moduleModelName}} = sequelize.models.{{moduleModelName}}


/**
 * List blogs
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  let limit = +req.query.limit || 20
  let start = +req.query.start || 0
  let search = req.query.search || ''
  if(start < 0) start = 0
  {{moduleModelName}}.findAndCountAll({
    where: sequelize.or(
      {{{moduleTitleField}}: {like: '%' + search + '%'}}
    ),
    offset: start,
    limit: limit,
    order: ['{{moduleTitleField}}']
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
 * Process list actions
 * @param {object} req
 * @param {object} res
 */
exports.listAction = function(req,res){
  list.remove({{moduleModelName}},req.body.remove)
    .then(function(){
      req.flash('success','{{moduleTitle}}(s) removed successfully')
      res.redirect('/{{moduleName}}/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Create entry
 * @param {object} req
 * @param {object} res
 */
exports.create = function(req,res){
  res.render(__dirname + '/view/create')
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = function(req,res){
  {{moduleModelName}}.findOne({where: {id: req.query.id}})
    .then(function(result){
      if(!result) throw new Error('{{moduleTitle}} entry not found')
      res.render(__dirname + '/view/edit',{item: result})
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Save
 * @param {object} req
 * @param {object} res
 */
exports.save = function(req,res){
  let data = req.body
  {{moduleModelName}}.findOne({where: {id: data.id}})
    .then(function(result){
      if(!result) result = Blog.build()
      {{#moduleFields}}
        if(data.{{fieldName}}) result.{{fieldName}} = data.{{fieldName}}
      {{/moduleFields}}
      if('undefined' === typeof data.active) result.active = false
      if(data.active) result.active = true
      return result.save()
    })
    .then(function(result){
      let alert = {
        subject: '{{moduleTitle}} entry',
        href: '/{{moduleName}}/edit?id=' + result.id,
        id: result.id
      }
      alert.action = 'saved'
      req.flashPug('success','subject-id-action',alert)
      res.setHeader('{{moduleName}}id',result.id)
      res.redirect('/{{moduleName}}/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
