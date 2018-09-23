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

//module properties
exports._kado = {
  enabled: true,
  name: 'doc',
  title: 'Doc',
  description: 'Manage and publish documents based on versions and revisions'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    doc: {
      title: 'Kado Doc'
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
  db.sequelize.import(__dirname + '/models/Doc.js')
  db.sequelize.import(__dirname + '/models/DocNav.js')
  db.sequelize.import(__dirname + '/models/DocRevision.js')
  db.sequelize.import(__dirname + '/models/DocProject.js')
  db.sequelize.import(__dirname + '/models/DocProjectVersion.js')
  let Doc = db.sequelize.models.Doc
  let DocNav = db.sequelize.models.DocNav
  let DocRevision = db.sequelize.models.DocRevision
  let DocProject = db.sequelize.models.DocProject
  let DocProjectVersion = db.sequelize.models.DocProjectVersion
  Doc.hasMany(DocRevision,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocRevision.belongsTo(Doc,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocProject.hasMany(DocProjectVersion,
    {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocProjectVersion.belongsTo(DocProject,
    {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocProjectVersion.hasMany(Doc,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocProjectVersion.hasMany(DocNav,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  DocNav.belongsTo(DocProjectVersion)
  Doc.belongsTo(DocProjectVersion,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
}


/**
 * Provide search
 * @param {K} K Master Kado Object
 * @param {app} app
 * @param {array} keywords
 * @param {number} start
 * @param {number} limit
 * @return {Promise}
 */
exports.search = (K,app,keywords,start,limit) => {
  let s = K.db.sequelize
  let Doc = s.models.Doc
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({id: {[s.Op.like]: '%'+w+'%'}})
  })
  return Doc.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.id,
      description: r.id,
      uri: app.uri.get('/doc/edit') + '?id=' + r.id,
      updatedAt: r.updatedAt
    }})})
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin/index')
  //register permissions
  //doc permissions
  app.permission.add('/doc/create','Create Doc')
  app.permission.add('/doc/save','Save Doc')
  app.permission.add('/doc/list','List Doc')
  app.permission.add('/doc/edit','Edit Doc')
  app.permission.add('/doc/remove','Remove Doc')
  //nav perms
  app.permission.add('/doc/nav/create','Create Doc Nav')
  app.permission.add('/doc/nav/save','Save Doc Nav')
  app.permission.add('/doc/nav/list','List Doc Nav')
  app.permission.add('/doc/nav/edit','Edit Doc Nav')
  app.permission.add('/doc/nav/remove','Remove Doc Nav')
  //project perms
  app.permission.add('/doc/project/create','Create Doc Project')
  app.permission.add('/doc/project/save','Save Doc Project')
  app.permission.add('/doc/project/list','List Doc Projects')
  app.permission.add('/doc/project/edit','Edit Doc Project')
  app.permission.add('/doc/project/remove','Remove Doc Project')
  //version perms
  app.permission.add('/doc/version/create','Create Doc Project Version')
  app.permission.add('/doc/version/save','Save Doc Project Version')
  app.permission.add('/doc/version/edit','Edit Doc Project Version')
  app.permission.add('/doc/version/remove','Remove Doc Project Version')
  //register views
  //doc views
  app.view.add('doc/create',__dirname + '/admin/view/create.html')
  app.view.add('doc/edit',__dirname + '/admin/view/edit.html')
  app.view.add('doc/list',__dirname + '/admin/view/list.html')
  //nav views
  app.view.add('doc/nav/create',__dirname + '/admin/view/nav/create.html')
  app.view.add('doc/nav/edit',__dirname + '/admin/view/nav/edit.html')
  app.view.add('doc/nav/list',__dirname + '/admin/view/nav/list.html')
  //project views
  app.view.add('doc/project/create',__dirname +
    '/admin/view/project/create.html')
  app.view.add('doc/project/edit',__dirname + '/admin/view/project/edit.html')
  app.view.add('doc/project/list',__dirname + '/admin/view/project/list.html')
  //version views
  app.view.add('doc/version/create',__dirname +
    '/admin/view/version/create.html')
  app.view.add('doc/version/edit',__dirname + '/admin/view/version/edit.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/doc'),'Doc','file-alt')
  app.nav.addItem('Doc',app.uri.add('/doc/list'),'List','list')
  app.nav.addItem('Doc',app.uri.add('/doc/create'),'Create','plus')
  app.nav.addItem('Doc',app.uri.add('/doc/project/list'),
    'List Projects','umbrella')
  app.nav.addItem('Doc',app.uri.add('/doc/project/create'),
    'Create Project','project-diagram')
  app.nav.addItem('Doc',app.uri.add('/doc/nav/list'),
    'Manage Nav','clipboard-list')
  //register routes
  //main doc routes
  app.get(app.uri.get('/doc'),(req,res) => {
    res.redirect(301,app.uri.get('/doc/list'))
  })
  app.get(app.uri.get('/doc/list'),admin.list)
  app.get(app.uri.get('/doc/create'),admin.create)
  app.get(app.uri.add('/doc/edit'),admin.edit)
  app.post(app.uri.add('/doc/save'),admin.save)
  app.post(app.uri.add('/doc/remove'),admin.remove)
  app.get(app.uri.get('/doc/remove'),admin.remove)
  //nav routes
  app.get(app.uri.get('/doc/nav',(req,res) => {
    res.redirect(301,app.uri.get('/doc/nav/list'))
  }))
  app.get(app.uri.add('/doc/nav/list'),admin.nav.list)
  app.get(app.uri.add('/doc/nav/create'),admin.nav.create)
  app.get(app.uri.add('/doc/nav/edit'),admin.nav.edit)
  app.post(app.uri.add('/doc/nav/save'),admin.nav.save)
  app.post(app.uri.add('/dov/nav/remove'),admin.nav.remove)
  app.get(app.uri.add('/dov/nav/remove'),admin.nav.remove)
  //project routes
  app.get(app.uri.add('/doc/project'),(req,res) => {
    res.redirect(301,app.uri.get('/doc/project/list'))
  })
  app.get(app.uri.get('/doc/project/list'),admin.project.list)
  app.get(app.uri.get('/doc/project/create'),admin.project.create)
  app.get(app.uri.add('/doc/project/edit'),admin.project.edit)
  app.post(app.uri.add('/doc/project/save'),admin.project.save)
  app.post(app.uri.add('/doc/project/remove'),admin.project.remove)
  app.get(app.uri.get('/doc/project/remove'),admin.project.remove)
  //version routes
  app.get(app.uri.add('/doc/version/create'),admin.version.create)
  app.get(app.uri.add('/doc/version/edit'),admin.version.edit)
  app.post(app.uri.add('/doc/version/save'),admin.version.save)
  app.post(app.uri.add('/doc/version/remove'),admin.version.remove)
  app.get(app.uri.get('/doc/version/remove'),admin.version.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main/index')
  //register routes
  app.get(app.uri.add('/doc'),main.index)
  app.get(app.uri.add('/doc/:uri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/doc'),'Doc','file-alt')
  //register routes
  app.get(app.uri.add('/doc/project'),main.project.index)
  app.get(app.uri.add('/doc/project/:uri'),main.project.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/doc/project'),'Doc Project','project-diagram')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  if('project' === args[1]){
    args = args.splice(1,1)
    process.argv = args
    return ('./bin/DocProject')
  } else {
    require('./bin/doc')
  }
}
