'use strict';

//module properties
exports._kado ={
  enabled: true,
  name: 'setting',
  title: 'Settings',
  description: 'Manage Kado settings directly to the config'
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin')
  //register routes
  app.get('/setting',(req,res) => {
    res.redirect(301,'/setting/list')
  })
  app.get('/setting/list',admin.list)
  app.get('/setting/edit',admin.edit)
  app.post('/setting/list',admin.listAction)
  app.post('/setting/save',admin.save)
}
