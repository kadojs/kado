'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
const Util = require('./Util')

module.exports = class History {
  static getInstance () { return new History() }
  constructor () {
    this.breadcrumb = []
  }

  all () {
    return this.breadcrumb
  }

  add (uri, name, icon) {
    const crumb = { uri: uri, name: name, icon: icon }
    if (!this.breadcrumb.filter((f) => { return f.name === crumb.name }).length) {
      this.breadcrumb.unshift(crumb)
    }
    if (this.breadcrumb.length >= 5) {
      do {
        this.breadcrumb.pop()
      } while (this.breadcrumb.length >= 5)
    }
    return crumb
  }

  save (req) {
    if (!req.session) return
    req.session.breadcrumb = this.breadcrumb || []
  }

  restore (req) {
    if (!req.session) return
    this.breadcrumb = req.session.breadcrumb || []
  }

  middleware (app, req) {
    let crumb
    this.restore(req)
    app.nav.all().map((g) => {
      g.nav.map((n) => {
        if (n.uri !== '/' && req.url.match(new RegExp('^' + n.uri, 'i'))) {
          crumb = {
            uri: n.uri,
            name: g.name + ' ' + n.name,
            icon: n.icon || g.icon
          }
        }
        return n
      })
      if (
        !crumb && g.uri !== '/' &&
        req.url.match(new RegExp('^' + g.uri, 'i'))
      ) {
        crumb = {
          uri: g.uri,
          name: g.name,
          icon: g.icon
        }
      }
      return g
    })
    if (!crumb && !req.url.match(/(js|css|html|jpg|jpeg|png|svg)/i)) {
      const parts = req.url.split('/')
      if (parts.length >= 3) {
        const name = Util.capitalize(parts[1].replace(/\?.*/, '')) + ' ' +
          Util.capitalize(parts[2].replace(/\?.*/, ''))
        crumb = {
          uri: req.url,
          name: name,
          icon: 'table'
        }
      }
    }
    if (req.method === 'GET' && crumb && crumb.uri !== '/') {
      this.add(req.url, crumb.name, crumb.icon)
    }
    this.save(req)
    return this.all()
  }
}
