'use strict';
/**
 * Kado - Awesome module system for Enterprise Grade applications.
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

//module properties
exports._kado = {
  enabled: true,
  name: 'blog',
  title: 'Blog',
  description: 'Manage and publish blog entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    blog: {
      title: 'Kado Blog'
    }
  })
}


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 */
exports.db = (K,db) => {
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/models/Blog.js')
}


/**
 * Provide search
 * @param {K} K Master Kado Object
 * @param {object} app
 * @param {array} keywords
 * @param {number} start
 * @param {number} limit
 * @return {Promise}
 */
exports.search = (K,app,keywords,start,limit) => {
  let s = K.db.sequelize
  let Blog = s.models.Blog
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({title: {[s.Op.like]: '%'+w+'%'}})
    where[s.Op.or].push({uri: {[s.Op.like]: '%'+w+'%'}})
    where[s.Op.or].push({content: {[s.Op.like]: '%'+w+'%'}})
  })
  return Blog.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.title,
      description: r.content.substring(0,150),
      uri: app.uri.get('/blog/edit') + '?id=' + r.id,
      updatedAt: r.updatedAt
    }})})
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin')
  //register permissions
  app.permission.add('/blog/create','Create blog')
  app.permission.add('/blog/save','Save blog')
  app.permission.add('/blog/list','List blog')
  app.permission.add('/blog/edit','Edit blog')
  app.permission.add('/blog/remove','Remove blog')
  //register views
  app.view.add('blog/create',__dirname + '/admin/view/create.html')
  app.view.add('blog/edit',__dirname + '/admin/view/edit.html')
  app.view.add('blog/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/blog'),'Blog','book')
  app.nav.addItem('Blog',app.uri.add('/blog/list'),'List','list')
  app.nav.addItem('Blog',app.uri.add('/blog/create'),'Create','plus')
  //register routes
  app.get(app.uri.get('/blog'),(req,res) => {
    res.redirect(301,app.uri.get('/blog/list'))
  })
  app.get(app.uri.get('/blog/list'),admin.list)
  app.get(app.uri.get('/blog/create'),admin.create)
  app.get(app.uri.add('/blog/edit'),admin.edit)
  app.post(app.uri.add('/blog/save'),admin.save)
  app.post(app.uri.add('/blog/remove'),admin.remove)
  app.get(app.uri.get('/blog/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main')
  //register routes
  app.get(app.uri.add('/blog'),main.index)
  app.get(app.uri.add('/blog/:blogUri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/blog'),'Blog','book')
}


/**
 * CLI Access
 */
exports.cli = () => {
  require('./bin/blog')
}
