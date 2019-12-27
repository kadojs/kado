'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class History {
  static getInstance(){ return new History() }
  constructor(){
    this.breadcrumb = []
  }
  /**
   * Return all breadcrumb entries
   * @returns {Array|*}
   */
  all(){
    return this.breadcrumb
  }
  /**
   * Add breadcrumb entry
   * @param {string} uri
   * @param {string} name
   * @param {string} icon
   */
  add(uri,name,icon){
    let crumb = {uri: uri, name: name, icon: icon}
    if(!this.breadcrumb.filter((f) => {return f.name === crumb.name}).length){
      this.breadcrumb.unshift(crumb)
    }
    if(this.breadcrumb.length >= 5){
      do {
        this.breadcrumb.pop()
      } while(this.breadcrumb.length >= 5)
    }
    return crumb
  }
  /**
   * Save breadcrumb entries
   * @param {object} req
   */
  save(req){
    if(!req.session) return
    req.session.breadcrumb = this.breadcrumb || []
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
   * Handle incoming requests to build history
   * @param {Kado} app
   * @param {Request} req
   * @returns {Array|*}
   */
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
        let name = app.util.capitalize(parts[1].replace(/\?.*/,'')) + ' ' +
          app.util.capitalize(parts[2].replace(/\?.*/,''))
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
}
