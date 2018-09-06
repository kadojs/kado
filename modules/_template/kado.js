'use strict';

//module properties
exports._kado = {
  enabled: true,
  name: '{{moduleName}}',
  title: '{{moduleTitle}}',
  description: 'Manage and publish {{moduleName}} entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
  config.$load({
    {{moduleName}}: {
      title: 'Kado {{moduleTitle}}'
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
  db.sequelize.import(__dirname + '/models/{{moduleModelName}}.js')
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin')
  //register permissions
  app.permission.add('/{{moduleName}/create','Create {{moduleName}}')
  app.permission.add('/{{moduleName}/save','Save {{moduleName}}')
  app.permission.add('/{{moduleName}/list','List {{moduleName}}')
  app.permission.add('/{{moduleName}/edit','Edit {{moduleName}}')
  app.permission.add('/{{moduleName}/remove','Remove {{moduleName}}')
  //register views
  app.view.add('{{moduleName}}/create',__dirname + '/admin/view/create.html')
  app.view.add('{{moduleName}}/edit',__dirname + '/admin/view/edit.html')
  app.view.add('{{moduleName}}/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/{{moduleName}}'),'{{moduleTitle}}','{{moduleIcon}}')
  app.nav.addItem('{{moduleTitle}}',app.uri.add('/{{moduleName}}/list'),'List','list')
  app.nav.addItem('{{moduleTitle}}',app.uri.add('/{{moduleName}}/create'),'Create','plus')
  //register routes
  app.get(app.uri.get('/{{moduleName}}'),(req,res) => {
    res.redirect(301,app.uri.get('/{{moduleName}}/list'))
  })
  app.get(app.uri.get('/{{moduleName}}/list'),admin.list)
  app.get(app.uri.get('/{{moduleName}}/create'),admin.create)
  app.get(app.uri.add('/{{moduleName}}/edit'),admin.edit)
  app.post(app.uri.add('/{{moduleName}}/save'),admin.save)
  app.post(app.uri.get('/{{moduleName}}/list'),admin.listAction)
  app.post(app.uri.add('/{{moduleName}}/remove'),admin.remove)
  app.get(app.uri.get('/{{moduleName}}/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main')
  //register routes
  app.get(app.uri.add('/{{moduleName}}'),main.index)
  app.get(app.uri.add('/{{moduleName}}/:uri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/{{moduleName}}'),'{{moduleTitle}}','{{moduleIcon}}')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/{{moduleName}}')
}

