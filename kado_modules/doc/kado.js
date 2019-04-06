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
 * @param {K.db.sequelize} s Sequelize instance
 */
exports.db = (K,db,s) => {
  let opts = s._relate.cascade()
  let Doc = s.doImport(__dirname + '/models/Doc.js')
  let DocRevision = s.doImport(__dirname + '/models/DocRevision.js')
  let DocProject = s.doImport(__dirname + '/models/DocProject.js')
  let DocProjectVersion = s.doImport(__dirname + '/models/DocProjectVersion.js')
  Doc.hasMany(DocRevision,opts)
  DocRevision.belongsTo(Doc,opts)
  DocProject.hasMany(DocProjectVersion,opts)
  DocProjectVersion.belongsTo(DocProject,opts)
  DocProjectVersion.hasMany(Doc,opts)
  Doc.belongsTo(DocProjectVersion,opts)
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
  let DocProject = s.models.DocProject
  let DocProjectVersion = s.models.DocProjectVersion
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({id: {[s.Op.like]: '%'+w+'%'}})
  })
  return Doc.findAll({where: where, start: start, limit: limit, include: [
    {model: DocProjectVersion, include: [DocProject]}
  ]})
    .then((result) => {return result.map((r) => {
      let uri = app.uri.get('/doc/edit') + '?id=' + r.id
      if('main' === app._interfaceName){
        uri = app.uri.get('/doc') + '/' + r.uri
      }
      return {
        title: r.id,
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
  let admin = require('./admin/index')
  //register permissions
  //doc permissions
  app.permission.add('/doc/create','Create Doc')
  app.permission.add('/doc/save','Save Doc')
  app.permission.add('/doc/list','List Doc')
  app.permission.add('/doc/edit','Edit Doc')
  app.permission.add('/doc/remove','Remove Doc')
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
  app.nav.addGroup(app.uri.p('/doc'),'Doc','file-alt')
  app.nav.addItem('Doc',app.uri.p('/doc/list'),'List','list')
  app.nav.addItem('Doc',app.uri.p('/doc/create'),'Create','plus')
  app.nav.addItem('Doc',app.uri.p('/doc/project/list'),
    'List Projects','umbrella')
  //register routes
  //main doc routes
  app.get(app.uri.p('/doc'),(req,res) => {
    res.redirect(301,app.uri.p('/doc/list'))
  })
  app.get(app.uri.p('/doc/list'),admin.list)
  app.get(app.uri.p('/doc/create'),admin.create)
  app.get(app.uri.p('/doc/edit'),admin.edit)
  app.post(app.uri.p('/doc/save'),admin.save)
  app.post(app.uri.p('/doc/remove'),admin.remove)
  app.get(app.uri.p('/doc/remove'),admin.remove)
  //project routes
  app.get(app.uri.p('/doc/project'),(req,res) => {
    res.redirect(301,app.uri.p('/doc/project/list'))
  })
  app.get(app.uri.p('/doc/project/list'),admin.project.list)
  app.get(app.uri.p('/doc/project/create'),admin.project.create)
  app.get(app.uri.p('/doc/project/edit'),admin.project.edit)
  app.post(app.uri.p('/doc/project/save'),admin.project.save)
  app.post(app.uri.p('/doc/project/remove'),admin.project.remove)
  app.get(app.uri.p('/doc/project/remove'),admin.project.remove)
  //version routes
  app.get(app.uri.p('/doc/version/create'),admin.version.create)
  app.get(app.uri.p('/doc/version/edit'),admin.version.edit)
  app.post(app.uri.p('/doc/version/save'),admin.version.save)
  app.post(app.uri.p('/doc/version/remove'),admin.version.remove)
  app.get(app.uri.p('/doc/version/remove'),admin.version.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main/index')
  //register routes
  app.get(app.uri.p('/doc/project'),main.project.index)
  app.get(app.uri.p('/doc/project/:uri'),main.project.entry)
  app.get(app.uri.p('/doc'),main.index)
  app.get(app.uri.p('/doc/:project/:version/:uri'),main.entry)
  app.get(app.uri.p('/doc/:project/:version'),main.list)
  app.get(app.uri.p('/doc/:project'),main.versionList)
  //register navigation
  app.nav.addGroup(app.uri.p('/doc'),'Documentation','file-alt')
  //register views
  app.view.add('doc/entry',__dirname + '/main/view/entry.html')
  app.view.add('doc/versionList',__dirname + '/main/view/versionList.html')
  app.view.add('doc/list',__dirname + '/main/view/list.html')
  app.view.add('doc/project/entry',__dirname + '/main/view/project/entry.html')
  app.view.add('doc/project/list',__dirname + '/main/view/project/list.html')
}


/**
 * Test Access
 */
exports.test = () => {
  return require('./test/' + exports._kado.name + '.test.js')
}
