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


/**
 * List
 * @param {object} req
 * @param {object} res
 */
exports.index = (req,res) => {
  let q = res.Q
  q.order = [['name','ASC']]
  DocProject.findAll(q)
    .then((results) => {
      res.render('doc/project/list',{
        projectList: results,
        _pageTitle: K._l.doc.doc_project + ' ' + K._l.list
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}


/**
 * Entry
 * @param {object} req
 * @param {object} res
 */
exports.entry = (req,res) => {
  DocProject.findByPk(req.query.id,res.Q)
    .then((result) => {
      res.render('doc/project/entry',{
        item: result,
        _pageTitle: result.name
      })
    })
    .catch((err) => {
      res.render('error',{error: err})
    })
}
