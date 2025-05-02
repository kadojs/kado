/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
