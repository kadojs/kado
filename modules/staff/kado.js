'use strict';

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
 */
exports.db = (K,db) => {
  let s = db.sequelize
  s.enabled = true
  s.import(__dirname + '/model/Staff.js')
  s.import(__dirname + '/model/StaffPermission.js')
  s.import(__dirname + '/model/StaffSession.js')
  let Staff = s.models.Staff
  let StaffPermission = s.models.StaffPermission
  Staff.hasMany(StaffPermission,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  StaffPermission.belongsTo(Staff,{onDelete: 'CASCADE', onUpdate: 'CASCADE'})
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
 * @param {K} K Master Kado Object
 * @param {Array} args
 */
exports.cli = (K,args) => {
  args.splice(2,1)
  process.argv = args
  require('./bin/staff')
}
