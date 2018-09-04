'use strict';
const bcrypt = require('bcrypt')
const P = require('bluebird')
const K = require('../../../helpers/kado')

let sequelize = K.db.sequelize
let Staff = sequelize.models.Staff

//make some promises
P.promisifyAll(bcrypt)


/**
 * List staff
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.render(__dirname + '/view/list')
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
  res.render(__dirname + '/view/create')
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
  if(0>=Object.keys(search).length){
    res.render('error',{error: 'id? email?'})
  } else
    Staff.findOne({where:search})
      .then((result)=>{
        if(!result || !result.dataValues)
          throw new Error('No staff found for given args ' +
            encodeURIComponent(JSON.stringify(search)))
        res.render(__dirname + '/view/edit',{staff: result.dataValues})
      })
      .catch((err)=>{
        res.render('error',{error: err.message})
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
      if(false !== updated){
        req.flash('success',{
          message: 'Staff member saved',
          href: '/staff/edit?id=' + staffId,
          name: staffEmail
        })
      } else {
        req.flash('warning',{
          message: 'Staff member unchanged',
          href: '/staff/edit?id=' + staffId,
          name: staffEmail
        })
      }
      res.setHeader('staffid',staffId)
      res.redirect('/staff/list')
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}


/**
 * Staff login
 * @param {object} req
 * @param {object} res
 */
exports.login = (req,res) => {
  res.render('login')
}


exports.doLogin = (email,password) => {
  let staff = {}
  return Staff.find({where: {email: email}})
    .then((result) => {
      if(!result) throw new Error('Invalid login')
      staff = result
      if(!staff.password) throw new Error('Invalid login')
      return bcrypt.compareAsync(password,staff.password)
    })
    .then((match) => {
      if(!match){
        staff.dateFail = sequelize.fn('NOW')
        staff.loginFailCount =  (+staff.loginFailCount || 0) + 1
        return staff.save()
          .then(() => {
            throw new Error('Invalid login')
          })
      }
      staff.dateSeen = sequelize.fn('NOW')
      staff.loginCount = (+staff.loginCount || 0) + 1
      return staff.save()
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
      res.redirect('/')
    })
    .catch((err) => {
      req.flash('error',err.message)
      res.redirect('/login')
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
  res.redirect('/login')
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
        res.json({success: 'Staff removed'})
      } else {
        req.flash('success','Staff removed')
        res.redirect('/blog/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || 'Staff removal error'})
      } else {
        res.render('error',{error: err.message})
      }
    })
}
