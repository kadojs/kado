'use strict';
const K = require('../../../index')
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


/**
 * List blogs
 * @param {object} req
 * @param {object} res
 */
exports.list = function(req,res){
  if(!req.query.length){
    res.render(__dirname + '/view/list')
  } else {
    K.datatable(Blog,req.query)
      .then(function(result){
        res.json(result)
      })
      .catch(function(err){
        res.json({error: err.message})
      })
  }
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
  let isNew = false
  let json = K.isClientJSON(req)
  Blog.findOne({where: {id: data.id}})
    .then(function(blog){
      if(!blog){
        isNew = true
        blog = Blog.build()
      }
      if(data.title) blog.title = data.title
      if(data.content) blog.content = data.content
      if('undefined' === typeof data.active) blog.active = false
      if(data.active) blog.active = true
      return blog.save()
    })
    .then(function(blog){
      if(json){
        res.json({blog: blog})
      } else {
        req.flash('success',{
          message: 'Blog entry ' + (isNew ? 'created' : 'saved'),
          href: '/blog/edit?id=' + blog.id,
          name: blog.id
        })
        res.redirect('/blog/list')
      }
    })
    .catch(function(err){
      if(json){
        res.json({error: err.message})
      } else {
        res.render('error',{error: err})
      }
    })
}


/**
 * Process removals
 * @param {object} req
 * @param {object} res
 */
exports.remove = function(req,res){
  let json = K.isClientJSON(req)
  if(req.query.id) req.body.remove = req.query.id.split(',')
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  K.modelRemoveById(Blog,req.body.remove)
    .then(function(){
      if(json){
        res.json({success: 'Blog removed'})
      } else {
        req.flash('success','Blog(s) removed')
        res.redirect('/blog/list')
      }
    })
    .catch(function(err){
      if(json){
        res.json({error: err.message || 'Blog removal error'})
      } else {
        res.render('error',{error: err.message})
      }
    })
}
