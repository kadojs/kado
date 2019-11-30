'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */


/**
 * Breadcrumb constructor
 * @constructor
 */
class Breadcrumb {
  constructor(){
    this.breadcrumb = []
  }
  middleware(app,req){
    let crumb
    this.restore(req)
    app.nav.all().map((g) => {
      g.nav.map((n) => {
        if('/' !== n.uri && req.url.match(new RegExp('^' +n.uri,'i'))){
          crumb = {
            uri: n.uri,
            name: g.name + ' ' + n.name,
            icon: n.icon || g.icon
          }
        }
      })
      if(
        !crumb && '/' !== g.uri &&
        req.url.match(new RegExp('^' + g.uri,'i'))
      ){
        crumb = {
          uri: g.uri,
          name: g.name,
          icon: g.icon
        }
      }
    })
    if(!crumb && !req.url.match(/(js|css|html|jpg|jpeg|png|svg)/i)){
      let parts = req.url.split('/')
      if(parts.length >= 3){
        let name = app.locals._capitalize(parts[1].replace(/\?.*/,'')) + ' ' +
          app.locals._capitalize(parts[2].replace(/\?.*/,''))
        crumb = {
          uri: req.url,
          name: name,
          icon: 'table'
        }
      }
    }
    if('GET' === req.method && crumb && crumb.uri !== '/'){
      this.add(req.url,crumb.name,crumb.icon)
    }
    this.save(req)
    return this.all()
  }
  /**
   * Add breadcrumb entry
   * @param {string} uri
   * @param {string} name
   * @param {string} icon
   */
  add(uri,name,icon){
    if(!this.breadcrumb.filter((f) => {return f.name === name}).length){
      this.breadcrumb.unshift({uri: uri, name: name, icon: icon})
    }
    if(this.breadcrumb.length >= 5){
      do {
        this.breadcrumb.pop()
      } while(this.breadcrumb.length >= 5)
    }
  }
  /**
   * Return all breadcrumb entries
   * @returns {Array|*}
   */
  all(){
    return this.breadcrumb
  }
  /**
   * Restore breadcrumb entries
   * @param {object} req
   */
  restore(req){
    if(!req.session) return
    this.breadcrumb = req.session.breadcrumb || []
  }
  /**
   * Save breadcrumb entries
   * @param {object} req
   */
  save(req){
    if(!req.session) return
    req.session.breadcrumb = this.breadcrumb || []
  }
}


/**
 * Export class
 * @type {Nav}
 */
module.exports = Breadcrumb
