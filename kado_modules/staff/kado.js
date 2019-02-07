'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */

//module properties
exports._kado = {
  enabled: true,
  name: 'staff',
  title: 'Staff',
  description: 'Manage Kado Staff',
  admin: {
    providesAuthentication: true
  }
}


/**
 * Initialize database access
 * @param {K} K Master Kado Object
 * @param {K.db} db
 * param {K.db.sequelize} s Sequelize instance
 */
exports.db = (K,db,s) => {
  let opts = s._relate.cascade()
  let Staff = s.doImport(__dirname + '/model/Staff.js')
  let StaffPermission = s.doImport(__dirname + '/model/StaffPermission.js')
  s.doImport(__dirname + '/model/StaffSession.js')
  s.doImport('../blog/models/Blog.js')
  Staff.hasMany(StaffPermission,opts)
  StaffPermission.belongsTo(Staff,opts)
}


/**
 * Provide search
 * @param {K} K Master Kado Object
 * @param {object} app
 * @param {array} keywords
 * @param {number} start
 * @param {number} limit
 * @return {Promise}
 */
exports.search = (K,app,keywords,start,limit) => {
  //restrict searching staff from main
  if('main' === app._interfaceName) return K.bluebird.try(() => {})
  let s = K.db.sequelize
  let Staff = s.models.Staff
  let where = {[s.Op.or]: []}
  keywords.forEach((w) => {
    where[s.Op.or].push({name: {[s.Op.like]: '%'+w+'%'}})
    where[s.Op.or].push({email: {[s.Op.like]: '%'+w+'%'}})
  })
  return Staff.findAll({where: where, start: start, limit: limit})
    .then((result) => {return result.map((r) => {return {
      title: r.name || r.email,
      description: r.email,
      uri: app.uri.get('/staff/edit') + '?id=' + r.id,
      updatedAt: r.updatedAt
    }})})
}


/**
 * Authenticate requests
 * @param {K} K Master Kado Object
 * @param {string} username
 * @param {string} password
 * @param {function} done
 */
exports.authenticate = (K,username,password,done) => {
  let admin = require('./admin')
  let userLogin = (email,password) => {
    return admin.doLogin(email,password)
  }
  userLogin(username,password)
    .then((user) => {
      done(null,true,user.dataValues)
    })
    .catch((e) => {
      done(e,false)
    })
}


/**
 * Register in Admin Interface
 * @param {K} K Master Kado Object
 * @param {object} app
 */
exports.admin = (K,app) => {
  let admin = require('./admin')
  //register permissions
  app.permission.add('/staff/create','Create staff member')
  app.permission.add('/staff/list','List staff members')
  app.permission.add('/staff/edit','Edit staff member')
  app.permission.add('/staff/save','Save staff member')
  app.permission.add('/staff/remove','Remove staff member')
  app.permission.add('/staff/grant','Grant staff member permission')
  app.permission.add('/staff/revoke','Revoke staff member permission')
  //register views
  app.view.add('staff/create',__dirname + '/admin/view/create.html')
  app.view.add('staff/edit',__dirname + '/admin/view/edit.html')
  app.view.add('staff/list',__dirname + '/admin/view/list.html')
  //staff routes
  app.uri.add('/login')
  app.uri.add('/logout')
  app.get(app.uri.add('/staff'),(req,res) => {
    res.redirect(301,app.uri.add('/staff/list'))
  })
  app.post(app.uri.add('/staff/save'),admin.save)
  app.get(app.uri.add('/staff/list'),admin.list)
  app.get(app.uri.add('/staff/create'),admin.create)
  app.get(app.uri.add('/staff/edit'),admin.edit)
  app.get(app.uri.add('/staff/grant'),admin.grant)
  app.get(app.uri.add('/staff/revoke'),admin.revoke)
  app.post(app.uri.add('/staff/remove'),admin.remove)
  app.get(app.uri.add('/staff/remove'),admin.remove)
}


/**
 * CLI Access
 */
exports.cli = () => {
  require('./cli/staff')
}


/**
 * Test Access
 */
exports.test = () => {
  return require('./test/' + exports._kado.name + '.test.js')
}
