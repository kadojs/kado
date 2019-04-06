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

const DocProject = sequelize.models.DocProject
const DocProjectVersion = sequelize.models.DocProjectVersion

/**
 * Create entry
 * @param {object} req
 * @param {object} res
 */
exports.create = (req,res) => {
  if(!req.query.project){
    res.render(res.locals._view.get('error'),{error: 'Missing project id'})
  } else {
    res.render('doc/version/create',{
      project: req.query.project,
      _pageTitle: K._l.doc.doc_project_version + ' ' + K._l.list
    })
  }
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  if(req.query.DocProjectVersionId) req.query.id = req.query.DocProjectVersionId
  let o = res.Q
  o.include = [DocProject]
  DocProjectVersion.findByPk(req.query.id,o)
    .then((result) => {
      if(!result) throw new Error(K._l.doc.entry_not_found)
      res.render('doc/version/edit',{
        item: result,
        _pageTitle: K._l.doc.doc_project_version + ' ' + K._l.list +
          ' ' + result.name
      })
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
  if(!data.DocProjectId){
    let errParams = {error: 'Missing project'}
    if(json){
      return res.json(errParams)
    } else {
      return res.render('error',errParams)
    }
  }
  DocProjectVersion.findByPk(data.id)
    .then((result) => {
      if(!result){
        isNew = true
        result = DocProjectVersion.build({
          DocProjectId: data.DocProjectId
        })
      }
      if(data.name) result.name = data.name
      return result.save()
    })
    .then((result) => {
      return DocProjectVersion.findOne({
        where: {id: result.id}, include: [DocProject]
      })
    })
    .then((result) => {
      if(json){
        res.json({item: result.dataValues})
      } else {
        req.flash('success',{
          message: K._l.doc.entry + ' ' + (isNew ? K._l.created : K._l.saved),
          href: '/doc/version/edit?id=' + result.id,
          name: result.id
        })
        res.redirect('/doc/project/edit?id=' + result.DocProject.id)
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
  if(req.query.project) req.body.project = req.query.project
  if(req.query.DocProjectId) req.body.project = req.query.DocProjectId
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  K.modelRemoveById(DocProjectVersion,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.doc.removed_version})
      } else {
        req.flash('success',K._l.doc.removed_version)
        if(req.body.project){
          res.redirect(301,'/doc/project/edit?id=' + req.body.project)
        } else {
          res.redirect('/doc/project/list')
        }
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.doc.removal_error})
      } else {
        res.render(res.locals._view.get('error'),{error: err.message})
      }
    })
}
