'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
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

const Doc = sequelize.models.Doc
const DocProject = sequelize.models.DocProject
const DocProjectVersion = sequelize.models.DocProjectVersion


/**
 * Chain load into project
 */
exports.project = require('./project')


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  res.redirect('/doc/project')
}

/**
 * Display versions available for particular project
 * @param req
 * @param res
 */
exports.versionList = (req,res) => {
  let q = res.Q
  q.include = [{model: DocProject, where: {uri: req.params.project}}]
  DocProjectVersion.findAll(q)
    .then((result) => {
      if(!result || !result.length){
        throw new Error('This project has no versions')
      }
      res.render('doc/versionList',{
        project: result[0].DocProject,
        versionList: result,
        _pageTitle: K._l.doc.doc_project_version + ' ' + K._l.list
      })
    })
    .catch((err) => {
      res.render('error',{error: err.message})
    })
}


/**
 * Display documents in order given a particular project version
 * @param req
 * @param res
 */
exports.list = (req,res) => {
  let q = res.Q
  q.include = [
    {model: DocProjectVersion, where: {name: req.params.version}, include: [
        {model: DocProject, where: {uri: req.params.project}}
      ]}
  ]
  q.order = [['sortNum','ASC']]
  Doc.findAll(q)
    .then((result) => {
      if(!result || !result.length){
        throw new Error('This project version has no documents.')
      }
      res.render(res.locals._view.get('doc/list'),{
        project: result[0].DocProjectVersion.DocProject,
        version: result[0].DocProjectVersion,
        docList: result,
        _pageTitle: K._l.doc.doc + ' ' + K._l.list
      })
    })
    .catch((err) => {
      res.render('error',{error: err.message})
    })
}


/**
 * Entry
 * @param {object} req
 * @param {object} res
 */
exports.entry = (req,res) => {
  let docList
  let q = res.Q
  q.include = [
    {model: DocProjectVersion, where: {name: req.params.version}, include: [
        {model: DocProject, where: {uri: req.params.project}}
      ]}
  ]
  q.order = [['sortNum','ASC']]
  Doc.findAll(q)
    .then((result) => {
      docList = result
      return Doc.find({
        where: {uri: req.params.uri},
        include: [
          {
            model: DocProjectVersion,
            where: {name: req.params.version},
            include: [
              {model: DocProject,where: {uri: req.params.project}}
            ]
          }
        ]
      })
    })
    .then((result) => {
      if(!result) throw new Error('Document not found')
      result.content = K.base64js.fromByteArray(
        new Buffer(result.content,'utf-8'))
      res.render('doc/entry',{
        doc: result,
        docList: docList,
        _pageTitle: result.title
      })
    })
    .catch((err) => {
      if('Document not found' === err.message) res.status(404)
      res.render('error',{error: err})
    })
}
