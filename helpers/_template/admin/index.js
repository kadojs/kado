'use strict';
<%&fileHeader%>
const K = require('kado')
const sequelize = K.db.sequelize

const <%moduleModelName%> = sequelize.models.<%moduleModelName%>


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.locals._asset.addScriptOnce('/dist/dataTables.js')
    res.locals._asset.addScriptOnce('/js/dataTableList.js')
    res.render('<%moduleName%>/list')
  } else {
    K.datatable(<%moduleModelName%>,req.query)
      .then((result) => {
        res.json(result)
      })
      .catch((err) => {
        res.json({error: err.message})
      })
  }
}


/**
 * Create entry
 * @param {object} req
 * @param {object} res
 */
exports.create = (req,res) => {
  res.render('<%moduleName%>/create')
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  <%moduleModelName%>.findByPk(req.query.id,res.Q)
    .then((result) => {
      if(!result) throw new Error(K._l.<%moduleName%>.entry_not_found)
      res.render('<%moduleName%>/edit',{item: result})
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}


/**
 * Save
 * @param {object} req
 * @param {object} res
 */
exports.save = (req,res) => {
  let data = req.body
  let isNew = false
  let json = K.isClientJSON(req)
  <%moduleModelName%>.findByPk(data.id)
    .then((result) => {
      if(!result){
        isNew = true
        result = <%moduleModelName%>.build()
      }
      <%#moduleFields%>
      if(data.<%fieldName%>) result.<%fieldName%> = data.<%fieldName%>
      <%/moduleFields%>
      return result.save()
    })
    .then((result) => {
      if(json){
        res.json({item: result.dataValues})
      } else {
        req.flash('success',{
          message: K._l.<%moduleName%>.entry + ' ' + (isNew ? K._l.created : K._l.saved),
          href: '/<%moduleName%>/edit?id=' + result.id,
          name: result.id
        })
        res.redirect('/<%moduleName%>/list')
      }
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
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
  K.modelRemoveById(<%moduleModelName%>,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.<%moduleName%>.entry_removed})
      } else {
        req.flash('success',K._l.<%moduleName%>.entry_removed)
        res.redirect('/<%moduleName%>/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.<%moduleName%>.removal_error})
      } else {
        res.render('error',{error: err.message})
      }
    })
}
