'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../../../index')
const sequelize = K.db.sequelize

const Blog = sequelize.models.Blog


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  let q = res.Q
  q.where = {active: true}
  q.order = [['datePosted','DESC']]
  Blog.findAll(q)
    .then((results) => {
      res.render('blog/list',{
        blogList: results,
        _pageTitle: K._l.blog.blog + ' ' + K._l.list
      })
    })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
    })
}


/**
 * Entry
 * @param {object} req
 * @param {object} res
 */
exports.entry = (req,res) => {
  res.locals._asset.addScriptOnce('/dist/tuiViewer.js')
  res.locals._asset.addScriptOnce('/js/loadTuiViewer.js')
  let q = res.Q
  q.where = {uri: req.params.blogUri}
  Blog.findOne(q)
    .then((result) => {
      if(!result) throw new Error('Blog not found')
      result.contentRaw = result.content
      result.content = K.b64.fromByteArray(Buffer.from(result.content,'utf-8'))
      res.render('blog/entry',{
        blog: result,
        _pageTitle: result.title
      })
    })
    .catch((err) => {
      if('Blog not found' === err.message) res.status(404)
      res.render('error',{error: err})
    })
}
