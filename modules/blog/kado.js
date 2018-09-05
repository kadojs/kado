'use strict';

//module properties
exports._kado = {
  enabled: true,
  name: 'blog',
  title: 'Blog',
  description: 'Manage and publish blog entries'
}


/**
 * Export config structure
 * @param {object} config
 */
exports.config = (config) => {
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
exports.db = (K,db) => {
  db.sequelize.enabled = true
  db.sequelize.import(__dirname + '/models/Blog.js')
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin')
  //register permissions
  app.permission.add('/blog/create','Create blog')
  app.permission.add('/blog/save','Save blog')
  app.permission.add('/blog/list','List blog')
  app.permission.add('/blog/edit','Edit blog')
  app.permission.add('/blog/remove','Remove blog')
  //register views
  app.view.add('blog/create',__dirname + '/admin/view/create.html')
  app.view.add('blog/edit',__dirname + '/admin/view/edit.html')
  app.view.add('blog/list',__dirname + '/admin/view/list.html')
  //register navigation
  app.nav.addGroup(app.uri.add('/blog'),'Blog','book')
  app.nav.addItem('Blog',app.uri.add('/blog/list'),'List','list')
  app.nav.addItem('Blog',app.uri.add('/blog/create'),'Create','plus')
  //register routes
  app.get(app.uri.get('/blog'),(req,res) => {
    res.redirect(301,app.uri.get('/blog/list'))
  })
  app.get(app.uri.get('/blog/list'),admin.list)
  app.get(app.uri.get('/blog/create'),admin.create)
  app.get(app.uri.add('/blog/edit'),admin.edit)
  app.post(app.uri.add('/blog/save'),admin.save)
  app.post(app.uri.add('/blog/remove'),admin.remove)
  app.get(app.uri.get('/blog/remove'),admin.remove)
}


/**
 * Register in Main Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.main = (K,app) => {
  let main = require('./main')
  //register routes
  app.get(app.uri.add('/blog'),main.index)
  app.get(app.uri.add('/blog/:blogUri'),main.entry)
  //register navigation
  app.nav.addGroup(app.uri.get('/blog'),'Blog','book')
}


/**
 * CLI Access
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/blog')
}
