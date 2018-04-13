'use strict';
const K = require('../../../index')
const list = K.list
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


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
  Blog.findAndCountAll({
    where: sequelize.or(
      {title: {like: '%' + search + '%'}}
    ),
    offset: start,
    limit: limit,
    order: ['title']
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
  Blog.find({
    where: sequelize.or(
      {title: {like: '%' + search + '%'}}
    ),
    order: ['title']
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
  Blog.findOne({where: {id: data.id}})
    .then(function(blog){
      if(!blog) blog = Blog.build()
      if(data.title) blog.title = data.title
      if(data.content) blog.content = data.content
      if('undefined' === typeof data.active) blog.active = false
      if(data.active) blog.active = true
      return blog.save()
    })
    .then(function(blog){
      res.json(blog)
    })
    .catch(function(err){
      res.json({error: err.message || 'Blog save error'})
    })
}


/**
 * Process list actions
 * @param {object} req
 * @param {object} res
 */
exports.remove = function(req,res){
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  list.remove(Blog,req.body.remove)
    .then(function(){
      res.json({success: 'Blog removed successfully'})
    })
    .catch(function(err){
      res.json({error: err.message || 'Blog removal error'})
    })
}
