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
 * Export locations of models
 * @param {object} sequelize
 */
exports.model = function(sequelize){
  sequelize.import(__dirname + '/models/Blog.js')
}


/**
 * Export Model Key Mapping
 * @param {object} sequelize
 */
//exports.modelKeyMapping = function(sequelize){
  //do some key mapping here
//}


/**
 * Register in Admin Interface
 * @param {object}app
 */
exports.admin = function(app){
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
 * @param {object} app
 */
exports.main = function(app){
  var main = require('./main')
  //register routes
  app.get('/blog',main.list)
  app.get('/blog/:uri',main.entry)
  //register navigation
  app.nav.addGroup('/blog','Blog','book')
}
