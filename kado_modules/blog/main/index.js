'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
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
  Blog.findAll({where: {active: true}, order: [['datePosted','DESC']]})
    .then((results) => {
      res.render(res.locals._view.get('blog/list'),{
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
  Blog.findOne({where: {uri: req.params.blogUri}})
    .then((result) => {
      if(!result) throw new Error('Blog not found')
      result.content = K.base64js.fromByteArray(
        new Buffer(result.content,'utf-8'))
      res.render(res.locals._view.get('blog/entry'),{
        blog: result,
        _pageTitle: result.title
      })
    })
    .catch((err) => {
      if('Blog not found' === err.message) res.status(404)
      res.render(res.locals._view.get('error'),{error: err})
    })
}
