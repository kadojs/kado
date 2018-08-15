'use strict';
const K = require('../../../index')
const list = K.list
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


/**
 * List blogs
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  if(!req.query.length){
    res.render(__dirname + '/view/list',{
      tableCreateUri: '/blog/create',
      tableCreateLabel: 'Create Blog',
      tableTitle: 'Blog List'
    })
  } else {
    K.datatable(Blog,req.query)
      .then(function(result){
        res.json(result)
      })
      .catch(function(err){
        res.json({error: err.message})
      })
  }
  /*
  let limit = +req.query.limit || 20
  let start = +req.query.start || 0
  let search = req.query.search || ''
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
    })*/
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
  Blog.findOne({where: {id: req.query.id}})
    .then(function(blog){
      if(!blog) throw new Error('Blog entry not found')
      res.render(__dirname + '/view/edit',{blog: blog})
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
      let alert = {
        subject: 'Blog entry',
        href: '/blog/edit?id=' + blog.id,
        id: blog.id
      }
      alert.action = 'saved'
      req.flashPug('success','subject-id-action',alert)
      res.setHeader('blogid',blog.id)
      res.redirect('/blog/list')
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}


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
