'use strict';
<%&fileHeader%>

//module properties
exports._kado = {
  enabled: true,
  name: '<%moduleName%>',
  title: '<%moduleTitle%>',
  description: 'Manage and publish <%moduleName%> entries',
  languagePacks: [
    __dirname + '/lang/eng.js',
    __dirname + '/lang/spa.js'
  ]
}


/**
 * Initialize database access
 * @param {Kado} app
 */
exports.db = (app) => {
  app.db.sequelize.doImport(__dirname + '/models/<%moduleModelName%>.js')
}


/**
 * Provide search
 * @param {Kado} app
 * @param {array} keywords
 * @param {number} start
 * @param {number} limit
 * @return {Promise}
 */
exports.search = (app,keywords,start,limit) => {
  let s = K.db.sequelize
  let <%moduleModelName%> = s.models.<%moduleModelName%>
  let where = {[s.Op.or]: []}
  keywords.map((w) => {
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
 * @param {Kado} app
 */
exports.admin = (app) => {
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
  app.nav.addGroup('/<%moduleName%>','<%moduleTitle%>','<%moduleIcon%>')
  app.nav.addItem('<%moduleTitle%>','/<%moduleName%>/list','List','list')
  app.nav.addItem('<%moduleTitle%>','/<%moduleName%>/create','Create','plus')
  //register routes
  app.get('/<%moduleName%>',(req,res) => {
    res.redirect(301,'/<%moduleName%>/list')
  })
  app.get('/<%moduleName%>/list',admin.list)
  app.get('/<%moduleName%>/create',admin.create)
  app.get('/<%moduleName%>/edit',admin.edit)
  app.post('/<%moduleName%>/save',admin.save)
  app.post('/<%moduleName%>/remove',admin.remove)
  app.get('/<%moduleName%>/remove',admin.remove)
}


/**
 * Register in Main Interface
 * @param {Kado} app
 * @param {object} app
 */
exports.main = (app) => {
  let main = require('./main/index')
  //register routes
  app.get('/<%moduleName%>',main.index)
  app.get('/<%moduleName%>/:uri',main.entry)
  //register navigation
  app.nav.addGroup('/<%moduleName%>','<%moduleTitle%>','<%moduleIcon%>')
}


/**
 * CLI Access
 * @param {Kado} app
 */
exports.cli = (app) => {
  require('./cli/<%moduleName%>')(app)
}


/**
 * Test Access
 */
exports.test = () => {
  return require('./test/' + exports._kado.name + '.test.js')
}
