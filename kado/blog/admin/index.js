'use strict';
var list = require(process.env.KADO_HELPERS + '/list')
var sequelize = require(process.env.KADO_HELPERS + '/sequelize')()

var Blog = sequelize.models.Blog

var config = require(process.env.KADO_CONFIG_FILE)


/**
 * List blogs
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  var limit = +req.query.limit || 20
  var start = +req.query.start || 0
  var search = req.query.search || ''
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
        list: result.rows,
        mainBaseUrl: config.admin.mainBaseUrl
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
  Blog.findById(req.query.id)
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
  var data = req.body
  Blog.findById(data.id)
    .then(function(blog){
      if(!blog) blog = Blog.build()
      if(data.title) blog.title = data.title
      if(data.content) blog.content = data.content
      if('undefined' === typeof data.active) blog.active = false
      if(data.active) blog.active = true
      return blog.save()
    })
    .then(function(blog){
      req.flash('success','Blog entry saved')
      res.redirect('/blog/edit?id=' + blog.id)
    })
    .catch(function(err){
      res.render('error',{error: err})
    })
}
