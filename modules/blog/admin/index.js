'use strict';
const K = require('../../../index')
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


/**
 * List blogs
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  //K.nav.breadcrumb([K.nav.bcHome,K.nav.bc(K._l.list,'/blog/list')])
  if(!req.query.length){
    res.render(res.locals._view.get('blog/list'))
  } else {
    K.datatable(Blog,req.query)
      .then((result) => {
        res.json(result)
      })
      .catch((err) => {
        res.json({error: err.message})
      })
  }
}


/**
 * Create entry
 * @param {object} req
 * @param {object} res
 */
exports.create = (req,res) => {
  res.render(res.locals._view.get('blog/create'))
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  Blog.findOne({where: {id: req.query.id}})
    .then((blog) => {
      if(!blog) throw new Error(K._l.blog_entry_not_found)
      res.render(res.locals._view.get('blog/edit'),{blog: blog})
    })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
    })
}


/**
 * Save
 * @param {object} req
 * @param {object} res
 */
exports.save = (req,res) => {
  let data = req.body
  let isNew = false
  let json = K.isClientJSON(req)
  Blog.findOne({where: {id: data.id}})
    .then((blog) => {
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
    .then((blog) => {
      if(json){
        res.json({blog: blog})
      } else {
        req.flash('success',{
          message: K._l.blog_entry + ' ' + (isNew ? K._l.created : K._l.saved),
          href: '/blog/edit?id=' + blog.id,
          name: blog.id
        })
        res.redirect('/blog/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message})
      } else {
        res.render(res.locals._view.get('error'),{error: err})
      }
    })
}


/**
 * Process removals
 * @param {object} req
 * @param {object} res
 */
exports.remove = (req,res) => {
  let json = K.isClientJSON(req)
  if(req.query.id) req.body.remove = req.query.id.split(',')
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  K.modelRemoveById(Blog,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.blog.blog_removed})
      } else {
        req.flash('success',K._l.blog.blog_removed)
        res.redirect('/blog/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.blog.blog_removal_error})
      } else {
        res.render(res.locals._view.get('error'),{error: err.message})
      }
    })
}
