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
const Model = require('./Model')
const net = require('net')
const Schema = require('./Schema')
class SessionStore {
  constructor (options = {}) {
    this.duration = options.duration || 21600000 // 6 hours
    this.pruneFrequency = options.pruneFrequency || 60000 // 1 minute
    this.pruneInterval = setInterval(() => {
      return this.prune()
    }, this.pruneFrequency)
  }

  clearInterval () { return clearInterval(this.pruneInterval) }

  save (sid, ip, agent, uid, data) {
    Assert.isType('string', sid)
    Assert.isType('string', ip)
    Assert.isType('string', agent)
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
        if (e instanceof Error) {
          console.error(`Session client connect failed: ${e.message}`)
          console.log(e)
        }
        client.destroy()
      })
      setTimeout(() => {
        return reject(new Error('Could not save before' +
          ' timeout of 30 seconds'))
      }, 30000)
    })
  }

  save (sid, ip, agent, uid, data) {
    return this.request('save', {
      sid: sid, ip: ip, agent: agent, uid: uid, data: data
    })
  }

  restore (sid) {
    return this.request('restore', { sid: sid })
      .then((data) => {
        if (!data.result) throw new Error('Empty session response')
        return data.result
      })
  }

  prune () { return 0 }
}
class SessionStoreModel extends Model {
  static fieldList () {
    return {
      id: Model.fieldPrimary(),
      sid: Model.fieldString('0', false),
      ip: Model.fieldString(),
      agent: Model.fieldString(),
      uid: Model.fieldString(),
      data: { type: 'LONGTEXT' },
      createdAt: Model.fieldDate(false, false),
      updatedAt: Model.fieldDate(false)
    }
  }

  static createTable () {
    const table = Schema.SQL.create(Session.SessionStoreTableName)
    const fields = SessionStoreModel.fieldList()
    for (const name in fields) {
      if (!Object.prototype.hasOwnProperty.call(fields, name)) continue
      table.field(name, fields[name])
    }
    table.primary('id')
    table.index('sid_unique', ['sid'], { unique: true })
    table.index('ip_index', ['ip'])
    table.index('agent_index', ['agent'])
    table.index('uid_index', ['uid'])
    table.index('data_index', ['data'])
    table.index('createdAt_index', ['createdAt'])
    table.index('updatedAt_index', ['updatedAt'])
    return table
  }

  static delete () { return Model.deleteQuery(Session.SessionStoreTableName) }

  static insert (fields) {
    if (fields === null) {
      fields = Model.filterFields(SessionStoreModel.fieldList(), {
        insert: false
      })
    }
    return Model.insertQuery(Session.SessionStoreTableName, fields)
  }

  static update (fields) {
    if (fields === null) {
      fields = Model.filterFields(SessionStoreModel.fieldList(), {
        writable: false
      })
    }
    return Model.updateQuery(Session.SessionStoreTableName, fields)
  }

  static byId (id) {
    return Model.byIdQuery(Session.SessionStoreTableName, id)
  }

  static bySid (sid) {
    return Model.byIdQuery(Session.SessionStoreTableName, sid, null, 'sid')
  }

  static byIp (ip) {
    return Model.byIdQuery(Session.SessionStoreTableName, ip, null, 'ip')
  }

  static byUid (uid) {
    return Model.byIdQuery(Session.SessionStoreTableName, uid, null, 'uid')
  }

  static pruneSession (boundary) {
    const query = Model.deleteQuery(Session.SessionStoreTableName)
    query.where('updatedAt', '<=', '?')
    query.value(new Date(boundary))
    return query
  }
}
class SessionStoreSQL extends SessionStore {
  constructor (options = {}) {
    super(options)
    this.db = options.db
    if (!this.db) throw new Error('SessionStoreSQL requires a db handle')
    this.model = options.model
    if (!this.model) throw new Error('SessionStoreSQL requires a db model')
  }

  async save (sid, ip = '127.0.0.1', agent = 'ie1', uid = 0, data = {}) {
    const now = new Date()
    const query = this.model.bySid(sid)
    const rv = await query.execute(this.db)
    const row = rv[0][0]
    if (row && row.sid === sid) {
      const query = this.model.update([
        'ip', 'agent', 'uid', 'data', 'updatedAt'
      ])
      query.value(ip)
      query.value(agent)
      query.value(uid)
      query.value(JSON.stringify(data))
      query.value(now)
      query.where('sid').value(sid)
      return query.execute(this.db)
    } else {
      const query = this.model.insert(
        ['sid', 'ip', 'agent', 'uid', 'data', 'createdAt', 'updatedAt']
      )
      query.value([sid, ip, agent, uid, JSON.stringify(data), now, now])
      return query.execute(this.db)
    }
  }

  async restore (sid) {
    const query = this.model.bySid(sid)
    const rv = await query.execute(this.db)
    const row = rv[0][0]
    if (!row || !row.data || !row.data.match(/^{/)) return {}
    return JSON.parse(row.data)
  }

  async prune () {
    const now = +new Date()
    const boundary = now - this.duration
    const query = this.model.pruneSession(boundary)
    await query.execute(this.db)
    return 1
  }
}
class SessionStoreMemory extends SessionStore {
  constructor (options) {
    super(options)
    this.data = {}
  }

  save (sid, ip = '127.0.0.1', agent = 'ie1', uid = 0, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        Assert.isType('string', sid)
        Assert.isType('string', ip)
        Assert.isType('string', agent)
        Assert.isType('Object', data)
      } catch (e) { return reject(e) }
      data._written = +new Date()
      this.data[sid] = { ip: ip, agent: agent, uid: uid, data: data }
      return resolve(this)
    })
  }

  restore (sid) {
    return new Promise((resolve, reject) => {
      try {
        Assert.isType('string', sid)
      } catch (e) { return reject(e) }
      if (!this.data[sid]) return resolve({})
      return resolve(this.data[sid].data)
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
          console.log(e)
          return socket.destroy()
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
      if (e instanceof Error) {
        console.log(`Session request failed: ${e.message}`)
        console.log(e)
      }
      socket.destroy()
    })
  }

  save (sid, ip = '127.0.0.1', agent = 'ie1', uid = 0, data = {}) {
    Assert.isType('string', sid)
    Assert.isType('string', ip)
    Assert.isType('string', agent)
    Assert.isType('Object', data)
    this.data[sid] = { ip: ip, agent: agent, uid: uid, data: data }
    return this
  }

  restore (sid) {
    Assert.isType('string', sid)
    if (!this.data[sid]) return {}
    return this.data[sid].data
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
      this.data = {}
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

  static generateId (ip, userAgent, secret = '') {
    Assert.isType('string', secret)
    Assert.isOk(secret !== '', 'Empty Secret Not Allowed')
    const sha1 = crypto.createHash('sha1')
    const bSecret = Buffer.from(secret, 'utf8')
    const bDateStamp = Buffer.from('' + new Date(), 'utf8')
    const bTimeNS = Buffer.from(process.hrtime.bigint().toString(), 'utf8')
    const bIP = Buffer.from(ip || '0.0.0.0', 'utf8')
    const bUA = Buffer.from(userAgent || 'unknown', 'utf8')
    const randomSalt = Buffer.from([Math.random() * 100])
    const idString = Buffer.concat([
      bSecret,
      bDateStamp, bTimeNS,
      bIP, bUA,
      randomSalt
    ])
    sha1.update(idString)
    return sha1.digest('hex')
  }

  static async request (req, res, options) {
    const ip = req.ip
    const agent = req.headers['user-agent']
    const sid = req.cookie.session ||
      Session.generateId(ip, agent, options.secret)
    const name = options.name || 'session'
    const uid = 0
    req[name] = new Session(sid, ip, agent, uid, options.store)
    if (!req.cookie.session) {
      const cookieOptions = {
        httpOnly: true,
        path: '/'
      }
      if (options.domain !== undefined) {
        cookieOptions.domain = options.domain
      }
      if (options.httpOnly !== undefined) {
        cookieOptions.httpOnly = options.httpOnly
      }
      if (options.path !== undefined) {
        cookieOptions.path = options.path
      }
      if (options.sameSite !== undefined) {
        cookieOptions.sameSite = options.sameSite
      }
      res.cookie('session', req[name].sid, cookieOptions)
    }
    res.once('close', () => { return req[name].save() })
    const data = await req[name].restore()
    // notify display support
    req.locals._notify = data._notify
    delete data._notify
    req.locals._session = data
    req[name].set('_notify', [])
  }

  constructor (sid, ip, agent, uid, store) {
    this.data = {}
    this.sid = sid
    this.ip = ip
    this.agent = agent
    this.uid = uid
    Assert.isOk(store instanceof SessionStore, 'Invalid SessionStore engine')
    this.store = store
    this.written = false
  }

  async restore () {
    const rv = await this.store.restore(this.sid)
    if (typeof rv !== 'object') return false
    this.data = rv
    return this.data
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
    return this.store.save(this.sid, this.ip, this.agent, this.uid, this.data)
  }
}
Session.SessionStore = SessionStore
Session.SessionStorage = SessionStorage
Session.SessionStoreLocal = SessionStoreLocal
Session.SessionStoreMemory = SessionStoreMemory
Session.SessionStoreModel = SessionStoreModel
Session.SessionStoreSQL = SessionStoreSQL
Session.SessionStoreTableName = 'Session'
module.exports = Session
