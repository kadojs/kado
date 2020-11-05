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

module.exports = class Navigation {
  static checkActive () {
    return (text, render) => {
      const val = render(text)
      const parts = val.split(',')
      return parts.length > 1 && parts[0] === parts[1] ? 'active' : ''
    }
  }

  static getInstance () { return new Navigation() }
  constructor () {
    this.nav = {}
    this.group = []
    this.sanitizeRegexp = /[^0-9a-z]+/i
  }

  addGroup (uri, name, icon) {
    this.nav[name] = []
    const entry = {
      uri: uri,
      name: name,
      shortName: name.replace(this.sanitizeRegexp, ''),
      icon: icon,
      checkActive: this.checkActive,
      nav: this.nav[name]
    }
    this.group.push(entry)
    return entry
  }

  get (name) {
    return this.nav[name]
  }

  all () {
    return this.group
  }

  allNav () {
    return this.nav
  }

  addItem (group, uri, name, icon) {
    if (!this.nav[group]) this.addGroup('/', group)
    const entry = {
      uri: uri,
      name: name,
      shortName: name.replace(this.sanitizeRegexp, ''),
      icon: icon,
      checkActive: this.checkActive
    }
    this.nav[group].push(entry)
    return entry
  }
}
