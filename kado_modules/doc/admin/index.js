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
const crypto = require('crypto')

const K = require('../../../index')
const sequelize = K.db.sequelize

const Doc = sequelize.models.Doc
const DocRevision = sequelize.models.DocRevision
const DocProject = sequelize.models.DocProject
const DocProjectVersion = sequelize.models.DocProjectVersion


/**
 * Chain load into project manager
 */
exports.project = require('./project')


/**
 * Chain load into version manager
 */
exports.version = require('./version')


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.render(res.locals._view.get('doc/list'),{
      _pageTitle: K._l.doc.doc + ' ' + K._l.list})
  } else {
    K.datatable(Doc,req.query,{
      include: [{model: DocProjectVersion, include: [DocProject]}]
    })
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
  DocProjectVersion.find({include: [DocProject]})
    .then((result) => {
      res.render(res.locals._view.get('doc/create'),{
        projects: result,
        _pageTitle: K._l.doc.doc + ' ' + K._l.create
      })
    })
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  Doc.find({where: {id: req.query.id}})
    .then((result) => {
      if(!result) throw new Error(K._l.doc.entry_not_found)
      result.content = encodeURIComponent(result.content)
      res.render(res.locals._view.get('doc/edit'),{
        item: result,
        _pageTitle: K._l.edit + ' ' + K._l.doc.doc + ' ' + result.title
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
  let hash
  let doc
  let isNewRevision = false
  if(!data.DocProjectVersionId){
    let errParams = {error: 'Missing DocProjectVersionId'}
    if(json) return res.json(errParams)
    else return res.render(res.locals._view.get('error'),errParams)
  }
  Doc.findOne({where: {id: data.id}})
    .then((result) => {
      doc = result
      if(!doc){
        isNew = true
        data.html = ''
        data.content = ''
        doc = Doc.build()
      }
      if(data.title) doc.title = data.title
      if(data.uri) doc.uri = data.uri
      if(data.sortNum) doc.sortNum = data.sortNum
      doc.DocProjectVersionId = data.DocProjectVersionId
      //Deal with the doc revision to save the content
      //here is how this is going to go, first we hash the content and the html
      //if both match then we do nothing, if they don't match then we make a new
      //revision record and then finally store the current content and html into
      //the main doc record as the revisions only support the doc not depend on
      //it
      if(!data.content) data.content = ''
      if(!data.html) data.html = ''
      //first hash them
      let cipher = crypto.createHash('sha256')
      hash = cipher.update(data.html + data.content).digest('hex')
      return DocRevision.findOne({where: {hash: hash, DocId: doc.id}})
    })
    .then((result) => {
      if(!result){
        isNewRevision = true
        let revParams = {
          content: data.content,
          html: data.html,
          hash: hash,
          DocId: doc.id
        }
        return DocRevision.create(revParams)
      } else {
        return result
      }
    })
    .then(() => {
      doc.content = data.content
      doc.html = data.html
      return doc.save()
    })
    .then(() => {
      if(json){
        res.json({item: doc.dataValues})
      } else {
        req.flash('success',{
          message: K._l.doc.entry + ' ' + (isNew ? K._l.created : K._l.saved),
          href: res.locals._u._doc_edit + '?id=' + doc.id,
          name: doc.id
        })
        res.redirect('/doc/list')
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
  if(!(req.body.remove instanceof Array)) req.body.remove = [req.body.remove]
  K.modelRemoveById(Doc,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.doc.removed})
      } else {
        req.flash('success',K._l.doc.removed)
        res.redirect('/doc/list')
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
