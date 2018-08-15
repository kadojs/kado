'use strict';
const bcrypt = require('bcrypt')
const P = require('bluebird')

const K = require('../../../helpers/kado')

let listHelper = K.list
let sequelize = K.db.sequelize

//make some promises
P.promisifyAll(bcrypt)

let Staff = sequelize.models.Staff
let Op = sequelize.Op


/**
 * List staff members
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res)=>{
  let search = req.query.search || ''
  let start = listHelper.integerArgDefaulted(req.query.start,0,true)
  let limit = listHelper.integerArgDefaulted(req.query.limit,10,true)

  let findOpts = {}
  if('' !== search){
    findOpts.where = {
      [Op.or]: [
        {email: {like: '%' + search + '%'}},
        {name:  {like: '%' + search + '%'}}
      ]
    }
  }
  findOpts.order = ['name']
  findOpts.offset = start
  findOpts.limit = limit

  Staff.findAndCountAll(findOpts)
    .then((result)=>{
      res.render(__dirname + '/view/list',{
        page: listHelper.pagination(start,result.count,limit),
        count: result.count,
        search: search,
        limit: limit,
        list: result.rows
      })
    })
}


/**
 * List action
 * @param {object} req
 * @param {object} res
 */
exports.listAction = (req,res)=>{
  let removals = req.body.remove || []
  P.try(()=>{
    return removals
  })
    .each((staffId)=>{
      return Staff.destroy({where:{id:staffId}})
    })
    .each((idAffected)=>{
      let currentRow = removals.shift()
      if(currentRow === idAffected)
        req.flash('success','Staff removed successfully')
      else
        req.flash('error','Staff refused to delete?')
    })
    .then(()=>{
      res.redirect('/staff/list')
    })
}


/**
 * Create staff member
 * @param {object} req
 * @param {object} res
 */
exports.create = (req,res)=>{
  res.render(__dirname + '/view/create')
}


/**
 * Staff edit form
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res)=>{
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
exports.save = (req,res)=>{
  let form = req.body
  let staffId = form.id || false
  let staffEmail = form.staffEmail
  P.try(()=>{
    if(staffId){
      return Staff.find({where:{id:staffId}})
    } else {
      return Staff.build()
    }
  })
    .then((result)=>{
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
    .then((updated)=>{
      if(updated.dataValues){
        staffId = updated.dataValues.id
        staffEmail = updated.dataValues.email
      }
      let alert = {
        subject: 'Staff member',
        href: '/staff/edit?id=' + staffId,
        id: staffEmail
      }
      if(false !== updated){
        alert.action = 'saved'
        req.flashPug('success','subject-id-action',alert)
      } else {
        alert.action = 'unchanged (try again?)'
        req.flashPug('warning','subject-id-action',alert)
      }
      res.setHeader('staffid',staffId)
      res.redirect('/staff/list')
    })
    .catch((err)=>{
      res.render('error',{error: err})
    })
}


/**
 * Staff login
 * @param {object} req
 * @param {object} res
 */
exports.login = (req,res)=>{
  res.render('login')
}


exports.doLogin = function(email,password){
  let staff = {}
  return Staff.find({where: {email: email}})
    .then((result)=>{
      if(!result) throw new Error('Invalid login')
      staff = result
      if(!staff.password) throw new Error('Invalid login')
      return bcrypt.compareAsync(password,staff.password)
    })
    .then((match)=>{
      if(!match){
        staff.dateFail = sequelize.fn('NOW')
        staff.loginFailCount =  (+staff.loginFailCount || 0) + 1
        return staff.save()
          .then(()=>{
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
exports.loginAction = (req,res)=>{
  exports.doLogin(req.body.email,req.body.password)
    .then((staff)=>{
      //otherwise we are valid start the session
      req.session.staff = staff.dataValues
      res.redirect('/')
    })
    .catch((err)=>{
      req.flash('error',err.message)
      res.redirect('/login')
    })
}


/**
 * Staff logout
 * @param {object} req
 * @param {object} res
 */
exports.logout = (req,res)=>{
  req.session.destroy()
  delete res.locals.staff
  res.redirect('/login')
}
