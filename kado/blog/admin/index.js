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
    })
}


/**
 * Process list actions
 * @param {object} req
 * @param {object} res
 */
exports.listAction = function(req,res){
  list.remove(Blog,req.body.remove)
    .then(function(){
      req.flash('success','Blog(s) removed successfully')
      res.redirect('/blog/list')
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
