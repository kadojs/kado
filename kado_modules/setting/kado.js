'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2018 NULLIVEX LLC. All rights reserved.
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
