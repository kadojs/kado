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
  //register permissions
  app.permission.add('/setting/list','List settings')
  app.permission.add('/setting/edit','Edit etting')
  app.permission.add('/setting/save','Save etting')
  //register routes
  app.get(app.uri.add('/setting'),(req,res) => {
    res.redirect(301,app.uri.add('/setting/list'))
  })
  app.get(app.uri.add('/setting/list'),admin.list)
  app.get(app.uri.add('/setting/edit'),admin.edit)
  app.post(app.uri.add('/setting/list'),admin.listAction)
  app.post(app.uri.add('/setting/save'),admin.save)
}
