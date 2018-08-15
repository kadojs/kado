'use strict';
const K = require('../../../index')
const list = K.list
const sequelize = K.db.sequelize

const {{moduleModelName}} = sequelize.models.{{moduleModelName}}


/**
 * Find blogs
 * @param {object} req
 * @param {object} res
 */
exports.findAll = function(req,res){
  let limit = +req.query.limit || req.body.limit || 20
  let start = +req.query.start || req.body.start || 0
  let search = req.query.search || req.body.search || ''
  if(start < 0) start = 0
  {{moduleModelName}}.findAndCountAll({
    where: sequelize.or({
      {{moduleTitleField}}: {like: '%' + search + '%'}
    }),
    offset: start,
    limit: limit,
    order: ['{{moduleTitleField}}']
  })
    .then(function(result){
      res.json(result)
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


/**
 * Find a blog
 * @param {object} req
 * @param {object} res
 */
exports.find = function(req,res){
  let search = req.query.search || req.body.search || ''
  {{moduleModelName}}.find({
    where: sequelize.or({
      {{moduleTitleField}}: {like: '%' + search + '%'}
    }),
    order: ['{{moduleTitleField}}']
  })
    .then(function(result){
      res.json(result)
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
      if(!result) result = {{moduleModelName}}.build()
      {{#moduleFields}}
      if(data.{{fieldName}}) result.{{fieldName}} = data.{{fieldName}}
      {{/moduleFields}}
      if('undefined' === typeof data.active) result.active = false
      if(data.active) result.active = true
      return result.save()
    })
    .then(function(result){
      res.json(result)
    })
    .catch(function(err){
      res.json({error: err.message || '{{moduleTitle}} save error'})
    })
}


/**
 * Process list actions
 * @param {object} req
 * @param {object} res
 */
exports.remove = function(req,res){
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  list.remove({{moduleModelName}},req.body.remove)
    .then(function(){
      res.json({success: '{{moduleTitle}} removed successfully'})
    })
    .catch(function(err){
      res.json({error: err.message || '{{moduleTitle}} removal error'})
    })
}
