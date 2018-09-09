'use strict';
/**
 * Kado - Awesome module system for Enterprise Grade applications.
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
const bcrypt = require('bcrypt')
const P = require('bluebird')
const K = require('../../../helpers/kado')

let sequelize = K.db.sequelize
let Staff = sequelize.models.Staff
let StaffPermission = sequelize.models.StaffPermission

//make some promises
P.promisifyAll(bcrypt)


/**
 * List staff
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.render(res.locals._view.get('staff/list'))
  } else {
    K.datatable(Staff,req.query)
      .then((result) => {
        res.json(result)
      })
      .catch((err) => {
        res.json({error: err.message})
      })
  }
}


/**
 * Create staff member
 * @param {object} req
 * @param {object} res
 */
exports.create = (req,res) => {
  res.render(res.locals._view.get('staff/create'))
}


/**
 * Staff edit form
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  let search = {}
  if(0 < req.query.id) search.id = +req.query.id
  if(req.query.email) search.email = req.query.email
  if(0 >= Object.keys(search).length){
    res.render('error',{error: K._l.staff.missing_id_or_email})
  } else{
    Staff.findOne({where: search,include: [StaffPermission]})
      .then((result) => {
        if(!result || !result.dataValues){
          throw new Error(K._l.staff.no_staff_for_args +
            encodeURIComponent(JSON.stringify(search)))
        }
        let perm = []
        res.locals._permission.all().forEach((p) => {
          let allowed = false
          result.StaffPermissions.forEach((sp) => {
            if(sp.name === p.name) allowed = true
          })
          p.allowed = allowed
          perm.push(p)
        })
        res.render(res.locals._view.get('staff/edit'),{
          staff: result.dataValues,
          perm: perm
        })
      })
      .catch((err) => {
        res.render(res.locals._view.get('error'),{error: err.message})
      })
  }
}


/**
 * Grant permission to staff
 * @param {object} req
 * @param {object} res
 */
exports.grant = (req,res) => {
  let id = req.query.id
  let name = req.query.name
  let json = K.isClientJSON(req)
  Staff.find({where: {id: id}})
    .then((result) => {
      if(!result) throw new Error(K._l.staff.err_staff_not_found)
      return StaffPermission.create({
        name: name,
        isAllowed: true,
        StaffId: result.id
      })
        .catch(K.db.sequelize.UniqueConstraintError,()=>{})
    })
    .then(() => {
      if(json){
        res.json({success: K._l.staff.permission_granted})
      } else {
        req.flash('success',K._l.staff.permission_granted)
        res.redirect(301,res.locals._uri.get('/staff/edit') + '?id=' + id)
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message})
      } else {
        req.flash('warning',err.message)
        res.redirect(301,res.locals._uri.get('/staff/edit') + '?id=' + id)
      }
    })
}


/**
 * Revoke staff permission
 * @param {object} req
 * @param {object} res
 */
exports.revoke = (req,res) => {
  let id = req.query.id
  let name = req.query.name
  let json = K.isClientJSON(req)
  Staff.find({where: {id: id}})
    .then((result) => {
      if(!result) throw new Error(K._l.staff.err_staff_not_found)
      return StaffPermission.find({where: {
        name: name,
        StaffId: result.id
      }})
    })
    .then((result) =>{
      if(!result) throw new Error(K._l.staff.err_no_permission_to_revoke)
      return result.destroy()
    })
    .then(() => {
      if(json){
        res.json({success: K._l.staff.premission_revoked})
      } else {
        req.flash('success',K._l.staff.premission_revoked)
        res.redirect(301,res.locals._uri.get('/staff/edit') + '?id=' + id)
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message})
      } else {
        req.flash('warning',err.message)
        res.redirect(301,res.locals._uri.get('/staff/edit') + '?id=' + id)
      }
    })
}


/**
 * Save staff member
 * @param {object} req
 * @param {object} res
 */
exports.save = (req,res) => {
  let form = req.body
  let staffId = form.id || false
  let staffEmail = form.staffEmail
  let json = K.isClientJSON(req)
  P.try(() => {
    if(staffId){
      return Staff.find({where:{id:staffId}})
    } else {
      return Staff.build()
    }
  })
    .then((result) => {
      let doc = result
      let updated = false
      form.staffActive = ('on' === form.staffActive)
      if(doc.email !== form.staffEmail){
        doc.email = form.staffEmail
        updated = true
      }
      if(doc.name !== form.staffName){
        doc.name = form.staffName
        updated = true
      }
      if('' !== form.staffPassword+form.staffPasswordConfirm){
        if(form.staffPassword === form.staffPasswordConfirm){
          doc.datePassword = sequelize.fn('NOW')
          doc.password = form.staffPassword
          updated = true
        }
      }
      if(doc.active !== form.staffActive){
        doc.active = form.staffActive
        updated = true
      }
      if(!updated){
        return P.try(()=>{return false})
      } else {
        return doc.save()
      }
    })
    .then((updated) => {
      if(updated.dataValues){
        staffId = updated.dataValues.id
        staffEmail = updated.dataValues.email
      }
      if(json){
        res.json({staff: updated.dataValues})
      } else {
        if(false !== updated){
          req.flash('success',{
            message: K._l.staff.staff_saved,
            href: res.locals._uri.get('/staff/edit') + '?id=' + staffId,
            name: staffEmail
          })
        } else {
          req.flash('warning',{
            message: K._l.staff.staff_unchanged,
            href: res.locals._uri.get('/staff/edit') + '?id=' + staffId,
            name: staffEmail
          })
        }
        res.redirect(res.locals._uri.get('/staff/list'))
      }
    })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
    })
}


/**
 * Staff login
 * @param {object} req
 * @param {object} res
 */
exports.login = (req,res) => {
  res.render(res.locals._view.get('login'))
}


exports.doLogin = (email,password) => {
  let staff = {}
  return Staff.find({where: {email: email}})
    .then((result) => {
      if(!result) throw new Error(K._l.invalid_login)
      staff = result
      if(!staff.password) throw new Error(K._l.invalid_login)
      return bcrypt.compareAsync(password,staff.password)
    })
    .then((match) => {
      if(!match){
        staff.dateFail = sequelize.fn('NOW')
        staff.loginFailCount =  (+staff.loginFailCount || 0) + 1
        return staff.save()
          .then(() => {
            throw new Error(K._l.invalid_login)
          })
      }
      staff.dateSeen = sequelize.fn('NOW')
      staff.loginCount = (+staff.loginCount || 0) + 1
      return staff.save()
    })
    .then(() => {
      return Staff.find({where: {email: email}, include: [StaffPermission]})
    })
    .then((result) => {
      //no permissions set makes the staff a super admin
      if(!result.dataValues.StaffPermissions.length){
        delete result.dataValues.StaffPermissions
        result.dataValues.permission = false
        return result
      }
      //otherwise apply permission profile
      let permission = new K.Permission()
      result.dataValues.StaffPermissions.forEach((perm) => {
        if(perm.isAllowed) permission.add(perm.name)
      })
      delete result.dataValues.StaffPermissions
      result.dataValues.permission = permission.digest()
      return result
    })
}


/**
 * Login action
 * @param {object} req
 * @param {object} res
 */
exports.loginAction = (req,res) => {
  exports.doLogin(req.body.email,req.body.password)
    .then((staff) => {
      //otherwise we are valid start the session
      req.session.staff = staff.dataValues
      console.log(req.body)
      res.redirect(301,req.body.referrer || '/')
    })
    .catch((err) => {
      req.flash('error',err.message)
      res.redirect(res.locals._uri.get('/login'))
    })
}


/**
 * Staff logout
 * @param {object} req
 * @param {object} res
 */
exports.logout = (req,res) => {
  req.session.destroy()
  delete res.locals.staff
  res.redirect(res.locals._uri.get('/login'))
}


/**
 * Process removals
 * @param {object} req
 * @param {object} res
 */
exports.remove = (req,res) => {
  let json = K.isClientJSON(req)
  if(req.query.id) req.body.remove = req.query.id.split(',')
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  K.modelRemoveById(Staff,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.staff.staff_removed})
      } else {
        req.flash('success',K._l.staff.staff_removed)
        res.redirect(res.local._uri.get('/staff/list'))
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.staff.err_staff_removed})
      } else {
        res.render('error',{error: err.message})
      }
    })
}
