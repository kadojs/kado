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
exports.name = 'setting'


/**
 * Module title for display purposes
 * @type {string}
 */
exports.title = 'Settings'


/**
 * Module description
 * @type {string}
 */
exports.description = 'Manage Kado settings directly to the config'


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = function(K,app){
  let admin = require('./admin')
  //register routes
  app.get('/setting',function(req,res){
    res.redirect(301,'/setting/list')
  })
  app.get('/setting/list',admin.list)
  app.get('/setting/edit',admin.edit)
  app.post('/setting/list',admin.listAction)
  app.post('/setting/save',admin.save)
}
