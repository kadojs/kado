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
  name: '<%moduleName%>',
  title: '<%moduleTitle%>',
  description: 'Manage and publish <%moduleName%> entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    <%moduleName%>: {
      title: 'Kado <%moduleTitle%>'
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
  db.sequelize.import(__dirname + '/models/<%moduleModelName%>.js')
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
  let <%moduleModelName%> = s.models.<%moduleModelName%>
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({id: {[s.Op.like]: '%'+w+'%'}})
  })
  return <%moduleModelName%>.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.id,
      description: r.id,
      uri: app.uri.get('/<%moduleName%>/edit') + '?id=' + r.id,
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
  app.permission.add('/<%moduleName%>/create','Create <%moduleName%>')
  app.permission.add('/<%moduleName%>/save','Save <%moduleName%>')
  app.permission.add('/<%moduleName%>/list','List <%moduleName%>')
  app.permission.add('/<%moduleName%>/edit','Edit <%moduleName%>')
  app.permission.add('/<%moduleName%>/remove','Remove <%moduleName%>')
  //register views
  app.view.add('<%moduleName%>/create',__dirname + '/admin/view/create.html')
  app.view.add('<%moduleName%>/edit',__dirname + '/admin/view/edit.html')
  app.view.add('<%moduleName%>/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/<%moduleName%>'),'<%moduleTitle%>','<%moduleIcon%>')
  app.nav.addItem('<%moduleTitle%>',app.uri.add('/<%moduleName%>/list'),'List','list')
  app.nav.addItem('<%moduleTitle%>',app.uri.add('/<%moduleName%>/create'),'Create','plus')
  //register routes
  app.get(app.uri.get('/<%moduleName%>'),(req,res) => {
    res.redirect(301,app.uri.get('/<%moduleName%>/list'))
  })
  app.get(app.uri.get('/<%moduleName%>/list'),admin.list)
  app.get(app.uri.get('/<%moduleName%>/create'),admin.create)
  app.get(app.uri.add('/<%moduleName%>/edit'),admin.edit)
  app.post(app.uri.add('/<%moduleName%>/save'),admin.save)
  app.post(app.uri.get('/<%moduleName%>/list'),admin.listAction)
  app.post(app.uri.add('/<%moduleName%>/remove'),admin.remove)
  app.get(app.uri.get('/<%moduleName%>/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main/index')
  //register routes
  app.get(app.uri.add('/<%moduleName%>'),main.index)
  app.get(app.uri.add('/<%moduleName%>/:uri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/<%moduleName%>'),'<%moduleTitle%>','<%moduleIcon%>')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/<%moduleName%>')
}

