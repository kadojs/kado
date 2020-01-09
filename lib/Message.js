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

module.exports = class Message {
  static getInstance () { return new Message() }
  constructor () {
    this.handlers = {}
  }

  allHandlers () {
    return this.handlers
  }

  addHandler (name, onMessage) {
    this.handlers[name] = {
      name: name,
      message: true,
      onMessage: onMessage
    }
  }

  getHandler (name) {
    return this.handlers[name]
  }

  removeHandler (name) {
    delete this.handlers[name]
    return name
  }

  /**
   * Send a message
   * @param {string} to
   * @param {string} message
   * @param {object} options
   * return {Promise}
   */
  send (to, message, options) {
    if (!to && !message && !options) {
      throw new Error('No parameters sent to message send')
    }
    if (options !== null && typeof options !== 'object' && message) {
      options = { text: message }
    } else if (options && !options.text && message) {
      options.text = message
    }
    // assign recipient
    if (options) options.to = to
    const handlers = this.handlers
    const mods = []
    // select messaging modules
    Object.keys(handlers).map((key) => {
      const mod = handlers[key]
      if (mod.message === true) {
        mods.push(mod)
      }
    })
    // sort messaging modules
    mods.sort((a, b) => {
      return (a.message.priority || 0) - (b.message.priority || 0)
    })
    // ship message to accepting modules and await their promises
    const promises = []
    for (const mod of mods) { promises.push(mod.onMessage(options)) }
    return Promise.all(promises)
  }
}
