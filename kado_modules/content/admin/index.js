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
const crypto = require('crypto')
const sequelize = K.db.sequelize

const Content = sequelize.models.Content
const ContentRevision = sequelize.models.ContentRevision


/**
 * Chain load into nav manager
 */
exports.nav = require('./nav')


/**
 * List content
 * @param {object} req
 * @param {object} res
 */
exports.list = (req,res) => {
  if(!req.query.length){
    res.render(res.locals._view.get('content/list'),{
      _pageTitle: K._l.content.content + ' ' + K._l.list})
  } else {
    K.datatable(Content,req.query)
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
  res.render(res.locals._view.get('content/create'),{
    _pageTitle: K._l.content.content + ' ' + K._l.create})
}


/**
 * Edit
 * @param {object} req
 * @param {object} res
 */
exports.edit = (req,res) => {
  Content.findOne({where: {id: req.query.id}})
    .then((content) => {
      if(!content) throw new Error(K._l.content_entry_not_found)
      content.content = encodeURIComponent(content.content)
      res.render(res.locals._view.get('content/edit'),{
        content: content,
        _pageTitle: K._l.edit + ' ' + K._l.content.content + ' ' + content.title
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
  let hash
  let content
  let isNewRevision = false
  let isNew = false
  let json = K.isClientJSON(req)
  Content.findOne({where: {id: data.id}})
    .then((result) => {
      content = result
      if(!content){
        isNew = true
        content = Content.build({
          content: '',
          html: ''
        })
      }
      if(data.title) content.title = data.title
      if(data.uri) content.uri = data.uri
      if('undefined' === typeof data.active) content.active = false
      if(data.active) content.active = true
      //first hash them
      if(!data.content) data.content = ''
      if(!data.html) data.html = ''
      let cipher = crypto.createHash('sha256')
      hash = cipher.update(data.content + data.html).digest('hex')
      return ContentRevision.findOne({where: {
          hash: hash, ContentId: content.id}})
    })
    .then((result) => {
      if(!result){
        isNewRevision = true
        let revParams = {
          content: data.content,
          html: data.html,
          hash: hash,
          ContentId: content.id
        }
        return ContentRevision.create(revParams)
      } else {
        return result
      }
    })
    .then(() => {
      content.content = data.content
      content.html = data.html
      return content.save()
    })
    .then((content) => {
      if(json){
        res.json({content: content.dataValues})
      } else {
        req.flash('success',{
          message: K._l.content.content_entry + ' ' +
            (isNew ? K._l.created : K._l.saved),
          href: '/content/edit?id=' + content.id,
          name: content.id
        })
        res.redirect('/content/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message})
      } else {
        console.log(err)
        res.render(res.locals._view.get('error'),{error: err})
      }
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
  K.modelRemoveById(Content,req.body.remove)
    .then(() => {
      if(json){
        res.json({success: K._l.content.content_removed})
      } else {
        req.flash('success',K._l.content.content_removed)
        res.redirect('/content/list')
      }
    })
    .catch((err) => {
      if(json){
        res.json({error: err.message || K._l.content.content_removal_error})
      } else {
        res.render(res.locals._view.get('error'),{error: err.message})
      }
    })
}
