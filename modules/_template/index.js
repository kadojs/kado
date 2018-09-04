'use strict';


/**
 * Identify that we are a Kado module
 * @type {boolean}
 */
exports.kado = true


/**
 * Module Name
 * @type {string}
 */
exports.name = '{{moduleName}}'


/**
 * Module title for display purposes
 * @type {string}
 */
exports.title = '{{moduleTitle}}'


/**
 * Module description
 * @type {string}
 */
exports.description = 'Manage and publish {{moduleName}} entries'


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
  //register routes
  app.get('/{{moduleName}}',(req,res) => {
    res.redirect(301,'/{{moduleName}}/list')
  })
  app.get('/{{moduleName}}/list',admin.list)
  app.get('/{{moduleName}}/create',admin.create)
  app.get('/{{moduleName}}/edit',admin.edit)
  app.post('/{{moduleName}}/save',admin.save)
  app.post('/{{moduleName}}/list',admin.listAction)
  //register navigation
  app.nav.addGroup('/{{moduleName}}','{{moduleTitle}}','{{moduleIcon}}')
  app.nav.addItem('{{moduleTitle}}','/{{moduleName}}/list','List','list')
  app.nav.addItem('{{moduleTitle}}','/{{moduleName}}/create','Create','plus')
}


/**
 * Register in the API Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.api = (K,app) => {
  let api = require('./api')
  app.post('/{{moduleName}}/findAll',api.findAll)
  app.post('/{{moduleName}}/find',api.find)
  app.post('/{{moduleName}}/save',api.save)
  app.post('/{{moduleName}}/remove',api.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main')
  //register routes
  app.get('/{{moduleName}}',main.index)
  app.get('/{{moduleName}}/:uri',main.entry)
  //register navigation
  app.nav.addGroup('/{{moduleName}}','{{moduleTitle}}','{{moduleIcon}}')
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

