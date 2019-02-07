'use strict';
<%&fileHeader%>

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
 * @param {K.db.sequelize} s Sequelize instance
 */
exports.db = (K,db,s) => {
  s.doImport(__dirname + '/models/<%moduleModelName%>.js')
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
  app.permission.add('/<%moduleName%>/create','Create <%moduleTitle%>')
  app.permission.add('/<%moduleName%>/save','Save <%moduleTitle%>')
  app.permission.add('/<%moduleName%>/list','List <%moduleTitle%>')
  app.permission.add('/<%moduleName%>/edit','Edit <%moduleTitle%>')
  app.permission.add('/<%moduleName%>/remove','Remove <%moduleTitle%>')
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
 */
exports.cli = () => {
  require('./cli/<%moduleName%>')
}


/**
 * Test Access
 */
exports.test = () => {
  return require('./test/' + exports._kado.name + '.test.js')
}
