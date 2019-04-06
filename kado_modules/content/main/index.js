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

const Content = sequelize.models.Content

/**
 * Entry
 * @param {object} req
 * @param {object} res
 */
exports.entry = (req,res) => {
  res.locals._asset.addScript('/dist/tuiViewer.js')
  res.locals._asset.addScript('/js/loadTuiViewer.js')
  let q = res.Q
  q.where = {uri: req.params.contentUri, active: true}
  Content.findOne(q)
    .then((result) => {
      if(!result) throw new Error('Content not found')
      result.contentRaw = result.content
      result.content = K.b64.fromByteArray(Buffer.from(result.content,'utf-8'))
      res.render('content/entry',{
        content: result,
        _pageTitle: result.title
      })
    })
    .catch((err) => {
      if('Content not found' === err.message) res.status(404)
      res.render('error',{error: err})
    })
}
