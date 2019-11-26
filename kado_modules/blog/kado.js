'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
 * @param {K.db.sequelize} s Sequelize instance
 */
exports.db = (K,db,s) => {
  let opts = s._relate.cascade()
  let Blog = s.doImport(__dirname + '/models/Blog.js')
  let BlogRevision = s.doImport(__dirname + '/models/BlogRevision.js')
  Blog.hasMany(BlogRevision,opts)
  BlogRevision.belongsTo(Blog,opts)
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
  if('main' === app._interfaceName) where.active = true
  return Blog.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {
      let uri = app.uri.get('/blog/edit') + '?id=' + r.id
      if('main' === app._interfaceName){
        uri = app.uri.get('/blog') + '/' + r.uri
      }
      return {
        title: r.title,
        description: r.content.substring(0,150),
        uri: uri,
        updatedAt: r.updatedAt
      }
    })})
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
  app.permission.add('/blog/revert','Revert blog')
  app.permission.add('/blog/remove','Remove blog')
  //register views
  app.view.add('blog/create',__dirname + '/admin/view/create.html')
  app.view.add('blog/edit',__dirname + '/admin/view/edit.html')
  app.view.add('blog/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.p('/blog'),'Blog','file-alt')
  app.nav.addItem('Blog',app.uri.p('/blog/list'),'List','list')
  app.nav.addItem('Blog',app.uri.p('/blog/create'),'Create','plus')
  //register routes
  app.get(app.uri.p('/blog'),(req,res) => {
    res.redirect(301,app.uri.p('/blog/list'))
  })
  app.get(app.uri.p('/blog/list'),admin.list)
  app.get(app.uri.p('/blog/create'),admin.create)
  app.get(app.uri.p('/blog/edit'),admin.edit)
  app.post(app.uri.p('/blog/save'),admin.save)
  app.post(app.uri.p('/blog/revert'),admin.revert)
  app.post(app.uri.p('/blog/remove'),admin.remove)
  app.get(app.uri.p('/blog/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main')
  //register routes
  app.get(app.uri.p('/blog'),main.index)
  app.get(app.uri.p('/blog/:blogUri'),main.entry)
  //register views
  app.view.add('blog/entry',__dirname + '/main/view/entry.html')
  app.view.add('blog/list',__dirname + '/main/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.p('/blog'),'Blog','file-alt')
}


/**
 * CLI Access
 */
exports.cli = (K) => {
  require('./cli/blog')(K)
}


/**
 * Test Access
 */
exports.test = () => {
  return require('./test/' + exports._kado.name + '.test.js')
}
