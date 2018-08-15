'use strict';

//module properties
exports.kado = true
exports.name = 'blog'
exports.title = 'Blog'
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
  let admin = require('./admin')
  //register routes
  app.get('/blog',function(req,res){
    res.redirect(301,'/blog/list')
  })
  app.get('/blog/list',admin.list)
  app.get('/blog/find',admin.find)
  app.get('/blog/findAll',admin.findAll)
  app.get('/blog/create',admin.create)
  app.get('/blog/edit',admin.edit)
  app.post('/blog/save',admin.save)
  app.post('/blog/remove',admin.remove)
  //register navigation
  app.nav.addGroup('/blog','Blog','book')
  app.nav.addItem('Blog','/blog/list','List','list')
  app.nav.addItem('Blog','/blog/create','Create','plus')
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = function(K,app){
  let main = require('./main')
  //register routes
  app.get('/blog',main.index)
  app.get('/blog/:blogUri',main.entry)
  //register navigation
  app.nav.addGroup('/blog','Blog','book')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = function(K,args){
  args.splice(2,1)
  process.argv = args
  require('./bin/blog')
}
