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
    res.render(res.locals._view.get('doc/version/create'),{
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
  DocProjectVersion.findOne({where: {id: req.query.id}, include: [DocProject]})
    .then((result) => {
      if(!result) throw new Error(K._l.doc.entry_not_found)
      res.render(res.locals._view.get('doc/version/edit'),{
        item: result,
        _pageTitle: K._l.doc.doc_project_version + ' ' + K._l.list +
          ' ' + result.name
      })
    })
    .catch((err) => {
      res.render(res.locals._view.get('error'),{error: err})
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
      return res.render(res.locals._view.get('error'),errParams)
    }
  }
  DocProjectVersion.findOne({where: {id: data.id}})
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
      res.render(res.locals._view.get('error'),{error: err})
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
