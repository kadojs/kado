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
  res.locals._asset.addScriptOnce('/dist/tuiViewer.js')
  res.locals._asset.addScriptOnce('/js/loadTuiViewer.js','defer')
  let uri = req.params.contentUri
  let q = res.Q
  q.where = {uri: uri, active: true}
  Content.findOne(q)
    .then((result) => {
      if(!result){
        //try and locate the content locally
        let contentList = K.config.module.content.content
        if(contentList[uri]){
          let content = contentList[uri]
          if(!K.fs.existsSync(content.templateFile)){
            throw new Error('Local content template not found: ' +
              content.templateFile)
          }
          //add the view to the view system
          res.locals._view.add('content/' + uri,content.templateFile)
          //now render with this template (so we have partials)
          content._pageTitle = content.title
          res.render('content/' + uri,content)
        } else {
          throw new Error('Content not found')
        }
      } else {
        result.contentRaw = result.content
        result.content = K.b64.fromByteArray(Buffer.from(result.content,'utf-8'))
        res.render('content/entry',{
          content: result,
          _pageTitle: result.title
        })
      }
    })
    .catch((err) => {
      if('Content not found' === err.message) res.status(404)
      res.render('error',{error: err})
    })
}
