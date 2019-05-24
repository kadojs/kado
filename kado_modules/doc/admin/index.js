'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
    res.locals._asset.addScriptOnce('/dist/dataTables.js')
    res.locals._asset.addScriptOnce('/js/dataTableList.js','defer')
    res.render('doc/list',{
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
  let q = res.Q
  q.include = [DocProject]
  DocProjectVersion.findAll(q)
    .then((result) => {
      res.render('doc/create',{
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
  res.locals._asset.addScriptOnce('/dist/tuiEditor.js')
  res.locals._asset.addScriptOnce('/js/loadTuiEditor.js')
  let q = res.Q
  q.include = [{model: DocRevision}]
  Doc.findByPk(req.query.id,q)
    .then((result) => {
      if(!result) throw new Error(K._l.doc.entry_not_found)
      result.content = K.b64.fromByteArray(Buffer.from(result.content,'utf-8'))
      res.render('doc/edit',{
        item: result,
        _pageTitle: K._l.edit + ' ' + K._l.doc.doc + ' ' + result.title
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
  let hash
  let doc
  let isNewRevision = false
  if(!data.DocProjectVersionId){
    let errParams = {error: 'Missing DocProjectVersionId'}
    if(json) return res.json(errParams)
    else return res.render(res.locals._view.get('error'),errParams)
  }
  Doc.findByPk(data.id)
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
        res.render('error',{error: err.message})
      }
    })
}


/**
 * Revert Doc to previous version
 * @param {object} req
 * @param {object} res
 */
exports.revert = (req,res) => {
  let revision
  let doc
  let data = req.body
  DocRevision.findByPk(data.revisionId)
    .then((result)=>{
      revision = result
      if(!revision) throw new Error('Revision Not Found')
      return Doc.findByPk(data.docId)
        .then((result)=>{
          doc= result
          if(!doc) throw new Error('Doc Not Found')
          return doc
        })
    })
    .then(()=>{
      doc.content = revision.content
      doc.html = revision.html
      revision.save()
      return doc.save()
    })
    .then(() => {
      res.json({
        status: 'ok',
        message: 'Document Reverted',
      })
    })
    .catch((err) => {
      res.status(500)
      res.json({
        status: 'error',
        message: err.message
      })
    })
}