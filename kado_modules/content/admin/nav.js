'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../../../index')
const sequelize = K.db.sequelize

const ContentNav = sequelize.models.ContentNav


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.locals._asset.addScriptOnce('/dist/dataTables.js')
    res.locals._asset.addScriptOnce('/js/dataTableList.js','defer')
    res.render('content/nav/list')
  } else {
    K.datatable(ContentNav,req.query)
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
  res.render('content/nav/create')
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  ContentNav.findByPk(req.query.id,res.Q)
    .then((result) => {
      if(!result) throw new Error(K._l.content.entry_not_found)
      res.render(res.locals._view.get('content/nav/edit'),{item: result})
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
  ContentNav.findByPk(data.id)
    .then((result) => {
      if(!result){
        isNew = true
        result = ContentNav.build()
      }
      if(data.title) result.title = data.title
      if(data.uri) result.uri = data.uri
      if(data.sortNum) result.sortNum = data.sortNum
      return result.save()
    })
    .then((result) => {
      if(json){
        res.json({item: result.dataValues})
      } else {
        req.flash('success',{
          message: K._l.content.content_entry + ' ' +
            (isNew ? K._l.created : K._l.saved),
          href: '/content/nav/edit?id=' + result.id,
          name: result.id
        })
        res.redirect('/content/nav/list')
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
  K.modelRemoveById(ContentNav,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.content.removed_nav})
      } else {
        req.flash('success',K._l.content.removed_nav)
        res.redirect('/content/nav/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.doc.removal_error})
      } else {
        res.render('error',{error: err.message})
      }
    })
}
