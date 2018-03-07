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
exports.name = 'blog'


/**
 * Module title for display purposes
 * @type {string}
 */
exports.title = 'Blog'


/**
 * Module description
 * @type {string}
 */
exports.description = 'Manage and publish blog entries'


/**
 * Export config structure
 * @param {object} config
 */
exports.config = function(config){
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
exports.db = function(K,db){
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/models/Blog.js')
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = function(K,app){
  var admin = require('./admin')
  //register routes
  app.get('/blog',function(req,res){
    res.redirect(301,'/blog/list')
  })
  app.get('/blog/list',admin.list)
  app.get('/blog/create',admin.create)
  app.get('/blog/edit',admin.edit)
  app.post('/blog/save',admin.save)
  //register navigation
  app.nav.addGroup('/blog/list','Blog','book')
  app.nav.addItem('Blog','/blog/list','List','list')
  app.nav.addItem('Blog','/blog/create','Create','plus')
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = function(K,app){
  var main = require('./main')
  //register routes
  app.get('/blog',main.list)
  app.get('/blog/:uri',main.entry)
  //register navigation
  app.nav.addGroup('/blog','Blog','book')
}
