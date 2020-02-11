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
const Assert = require('./Assert')
const crypto = require('crypto')
const fs = require('./FileSystem')
const net = require('net')
class SessionStore {
  constructor (options = {}) {
    this.duration = options.duration || 21600000 // 6 hours
    this.pruneFrequency = options.pruneFrequency || 60000 // 1 minute
    this.pruneInterval = setInterval(() => {
      return this.prune()
    }, this.pruneFrequency)
  }

  clearInterval () { return clearInterval(this.pruneInterval) }

  save (sid, data) {
    Assert.isType('string', sid)
    Assert.isType('Object', data)
    throw new Error('The save method must be extended by the' +
      ' SessionStore implementor')
  }

  restore (sid) {
    Assert.isType('string', sid)
    throw new Error('The restore method must be extended by the' +
      ' SessionStore implementor')
  }

  prune () {
    throw new Error('The prune method must be extended by the' +
      ' SessionStore implementor')
  }
}
class SessionStoreLocal extends SessionStore {
  constructor (options = {}) {
    super(options)
    this.net = net
    this.host = options.host || 'localhost'
    this.port = options.port || 3001
  }

  request (command, data) {
    return new Promise((resolve, reject) => {
      try {
        Assert.isType('Object', data)
        Assert.isType('string', data.sid)
      } catch (e) { return reject(e) }
      data._written = +new Date()
      const client = net.createConnection({ port: this.port, host: this.host })
      let buffer = ''
      client.on('data', (data) => { buffer += data.toString('utf8') })
      client.on('close', () => {
        try {
          const data = JSON.parse(buffer)
          if (data.status !== 'ok') {
            if (!data.result) data.message = 'Empty response'
            return reject(
              new Error(`Invalid session response: ${data.message}`)
            )
          }
          return resolve(data)
        } catch (e) {
          if (e instanceof Error) return reject(e)
        }
      })
      client.on('connect', () => {
        client.end(JSON.stringify({ [command]: data }))
      })
      client.on('error', (e) => {
        if (e instanceof Error && e.message !== 'read ECONNRESET') {
          console.error(`Session client connect failed: ${e.message}`)
        }
      })
      setTimeout(() => {
        return reject(new Error('Could not save before' +
          ' timeout of 30 seconds'))
      }, 30000)
    })
  }

  save (sid, data) {
    return this.request('save', { sid: sid, data: data })
  }

  restore (sid) {
    return this.request('restore', { sid: sid })
      .then((data) => {
        if (!data.result) throw new Error('Empty session response')
        return data.result
      })
  }

  prune () {
    const now = +new Date()
    const boundary = now - this.duration
    let pruneCount = 0
    for (const i in this.data) {
      if (!Object.prototype.hasOwnProperty.call(this.data, i)) continue
      if (!this.data[i]._written || this.data[i]._written <= boundary) {
        pruneCount++
        delete this.data[i]
      }
    }
    return pruneCount
  }
}
class SessionStoreMemory extends SessionStore {
  constructor (options) {
    super(options)
    this.data = {}
  }

  save (sid, data) {
    return new Promise((resolve, reject) => {
      try {
        Assert.isType('string', sid)
        Assert.isType('Object', data)
      } catch (e) { return reject(e) }
      data._written = +new Date()
      this.data[sid] = data
      return resolve(this)
    })
  }

  restore (sid) {
    return new Promise((resolve, reject) => {
      try {
        Assert.isType('string', sid)
      } catch (e) { return reject(e) }
      if (!this.data[sid]) return resolve({})
      return resolve(this.data[sid])
    })
  }

  prune () {
    const now = +new Date()
    const boundary = now - this.duration
    let pruneCount = 0
    for (const i in this.data) {
      if (!Object.prototype.hasOwnProperty.call(this.data, i)) continue
      if (!this.data[i]._written || this.data[i]._written <= boundary) {
        pruneCount++
        delete this.data[i]
      }
    }
    return pruneCount
  }
}
class SessionStorage {
  static create (options) {
    const storage = new SessionStorage(options)
    storage.restoreFromDisk()
    return (message) => { return storage.handleMessage(message) }
  }

  constructor (options = {}) {
    this.data = {}
    this.host = options.host || null
    this.net = net
    this.port = options.port || 3001
    Assert.isType('string', options.saveFile)
    this.saveFile = options.saveFile
    this.saveFrequency = options.saveFrequency || 15000
    this.saveInterval = setInterval(() => {
      return this.saveToDisk()
    }, this.saveFrequency)
    this.server = this.net.createServer({ allowHalfOpen: true }, (socket) => {
      return this.handleSocket(socket)
    })
  }

  handleSocket (socket) {
    let buffer = ''
    let data = null
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
    })
    socket.on('end', () => {
      try {
        data = JSON.parse(buffer)
      } catch (e) {
        if (e instanceof Error) {
          console.log(`Failed to receive session request ${e.message}`)
          socket.end(JSON.stringify({ status: 'error', message: e.message }))
        }
      }
      if (data.save) {
        this.save(data.save.sid, data.save.data)
        socket.end(JSON.stringify({ status: 'ok' }))
      } else if (data.restore) {
        const result = this.restore(data.restore.sid)
        socket.end(JSON.stringify({ status: 'ok', result: result }))
      } else {
        socket.end(JSON.stringify({ status: 'error', message: 'no action' }))
      }
    })
    socket.on('error', (e) => {
      if (e instanceof Error && e.message !== 'read ECONNRESET') {
        console.log(`Session request failed: ${e.message}`)
      }
    })
  }

  save (sid, data) {
    Assert.isType('string', sid)
    Assert.isType('Object', data)
    this.data[sid] = data
    return this
  }

  restore (sid) {
    Assert.isType('string', sid)
    if (!this.data[sid]) return {}
    return this.data[sid]
  }

  saveToDisk () {
    return fs.writeFile(this.saveFile, JSON.stringify(this.data))
      .catch((e) => {
        console.log(`Failed to save sessions to disk ${e.message}`)
      })
  }

  restoreFromDisk () {
    if (!fs.exists(this.saveFile)) {
      fs.writeFileSync(this.saveFile, JSON.stringify({}))
    }
    const data = fs.readFileSync(this.saveFile)
    try {
      this.data = JSON.parse(data)
    } catch (e) {
      console.log(`Failed to restore sessions from disk ${e.message}`)
    }
    return this.data
  }

  clearInterval () { return clearInterval(this.saveInterval) }

  listen (port, host) {
    if (!port) port = this.port
    if (!host) host = this.host
    return new Promise((resolve, reject) => {
      this.server.listen(port, host, (e) => {
        if (e instanceof Error) return reject(e)
        return resolve()
      })
    })
  }
}
class Session {
  static getMiddleware (options) {
    return (req, res) => { return Session.request(req, res, options) }
  }

  static generateId (ip, userAgent) {
    const sha1 = crypto.createHash('sha1')
    const idString = +(new Date()) + ip + userAgent
    sha1.update(idString)
    return sha1.digest('hex')
  }

  static request (req, res, options) {
    const sid = req.cookie.session ||
      Session.generateId(req.ip, req.headers['user-agent'])
    const name = options.name || 'session'
    req[name] = new Session(sid, options.store)
    if (!req.cookie.session) {
      res.setHeader('Set-Cookie', 'session=' + req[name].sid)
    }
    res.once('close', () => { return req[name].save() })
    return req[name].restore()
  }

  constructor (sid, store) {
    this.data = {}
    this.sid = sid
    Assert.isOk(store instanceof SessionStore, 'Invalid SessionStore engine')
    this.store = store
    this.written = false
  }

  restore () {
    return this.store.restore(this.sid)
      .then((result) => {
        if (typeof result !== 'object') return false
        this.data = result
        return this.data
      })
  }

  set (key, value) {
    Assert.isType('string', key)
    this.data[key] = value
    this.written = true
    return this
  }

  get (key) { return this.data[key] }

  save () {
    if (this.written === false) return true
    return this.store.save(this.sid, this.data)
  }
}
Session.SessionStore = SessionStore
Session.SessionStorage = SessionStorage
Session.SessionStoreLocal = SessionStoreLocal
Session.SessionStoreMemory = SessionStoreMemory
module.exports = Session
