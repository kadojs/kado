'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
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
  name: 'content',
  title: 'Content',
  description: 'Manage and publish content'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    content: {
      title: 'Content'
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
  db.sequelize.import(__dirname + '/models/Content.js')
  db.sequelize.import(__dirname + '/models/ContentNav.js')
  db.sequelize.import(__dirname + '/models/ContentRevision.js')
  let Content = db.sequelize.models.Content
  let ContentRevision = db.sequelize.models.ContentRevision
  Content.hasMany(ContentRevision,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  ContentRevision.belongsTo(Content,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
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
  let Content = s.models.Content
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({title: {[s.Op.like]: '%'+w+'%'}})
    where[s.Op.or].push({uri: {[s.Op.like]: '%'+w+'%'}})
    where[s.Op.or].push({content: {[s.Op.like]: '%'+w+'%'}})
  })
  if('main' === app._interfaceName){
    where.uri = {[s.Op.notLike]: 'partial_%'}
    where.active = true
  }
  return Content.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {
      let uri = app.uri.get('/content/edit') + '?id=' + r.id
      if('main' === app._interfaceName){
        uri = app.uri.get('/content') + '/' + r.uri
      }
      return {
        title: r.title,
        description: r.html,
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
  app.permission.add('/content/create','Create Content')
  app.permission.add('/content/save','Save Content')
  app.permission.add('/content/list','List Content')
  app.permission.add('/content/edit','Edit Content')
  app.permission.add('/content/remove','Remove Content')
  //nav permissions
  app.permission.add('/content/nav/create','Create Content Nav')
  app.permission.add('/content/nav/save','Save Content Nav')
  app.permission.add('/content/nav/list','List Content Nav')
  app.permission.add('/content/nav/edit','Edit Content Nav')
  app.permission.add('/content/nav/remove','Remove Content Nav')
  //register views
  app.view.add('content/create',__dirname + '/admin/view/create.html')
  app.view.add('content/edit',__dirname + '/admin/view/edit.html')
  app.view.add('content/list',__dirname + '/admin/view/list.html')
  //nav views
  app.view.add('content/nav/create',__dirname + '/admin/view/nav/create.html')
  app.view.add('content/nav/edit',__dirname + '/admin/view/nav/edit.html')
  app.view.add('content/nav/list',__dirname + '/admin/view/nav/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/content'),'Content','file-alt')
  app.nav.addItem('Content',app.uri.add('/content/list'),'List','list')
  app.nav.addItem('Content',app.uri.add('/content/create'),'Create','plus')
  app.nav.addItem('Content',app.uri.add('/content/nav/list'),
    'Manage Nav','clipboard-list')
  //register routes
  app.get(app.uri.get('/content'),(req,res) => {
    res.redirect(301,app.uri.get('/content/list'))
  })
  app.get(app.uri.get('/content/list'),admin.list)
  app.get(app.uri.get('/content/create'),admin.create)
  app.get(app.uri.add('/content/edit'),admin.edit)
  app.post(app.uri.add('/content/save'),admin.save)
  app.post(app.uri.add('/content/remove'),admin.remove)
  app.get(app.uri.get('/content/remove'),admin.remove)
  //nav routes
  app.get(app.uri.get('/content/nav',(req,res) => {
    res.redirect(301,app.uri.get('/content/nav/list'))
  }))
  app.get(app.uri.add('/content/nav/list'),admin.nav.list)
  app.get(app.uri.add('/content/nav/create'),admin.nav.create)
  app.get(app.uri.add('/content/nav/edit'),admin.nav.edit)
  app.post(app.uri.add('/content/nav/save'),admin.nav.save)
  app.post(app.uri.add('/content/nav/remove'),admin.nav.remove)
  app.get(app.uri.add('/content/nav/remove'),admin.nav.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main')
  //register routes
  app.get(app.uri.add('/content') + '/:contentUri',main.entry)
  //register view
  app.view.add('content/entry',__dirname + '/main/view/entry.html')
}


/**
 * CLI Access
 */
exports.cli = () => {
  require('./bin/content')
}
