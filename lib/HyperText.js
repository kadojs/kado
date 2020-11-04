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
const Connect = require('./Connect')
const ConnectEngine = Connect.ConnectEngine
const ETag = require('./ETag')
const Format = require('./Format')
const fs = require('./FileSystem')
const Mime = require('./Mime')
const Parser = require('./Parser')
const Router = require('./Router')
class StaticServer {
  static getMiddleware (root, options) {
    const server = new StaticServer(root, options)
    return (req, res) => { return server.request(req, res) }
  }

  constructor (root, options) {
    if (!options) options = {}
    Assert.isType('string', root)
    Assert.isOk(fs.exists(root), `${root} not found`)
    this.root = options.root || root
  }

  resolve (url) {
    return fs.path.join(this.root, url)
  }

  request (req, res) {
    const url = decodeURIComponent(req.url.split('?').shift())
    const testFile = this.resolve(url)
    if (!fs.exists(testFile)) return
    const type = Mime.getType(testFile) || Mime.getType('test.txt')
    return fs.stat(testFile)
      .then((stat) => {
        if (stat.isDirectory()) return
        const tag = ETag.getTag(stat)
        res.setHeader('Content-Length', stat.size)
        res.setHeader('Content-Type', type.type)
        res.setHeader('ETag', tag)
        if (req.headers['if-none-match'] === tag) {
          res.statusCode = 304
          res.end()
        } else {
          const rs = fs.createReadStream(testFile)
          rs.on('error', (e) => {
            console.error(`Error reading ${testFile}: ${e.message}`)
          })
          rs.pipe(res)
        }
        return true
      })
  }
}
class HyperTextEngine extends ConnectEngine {
  start () {
    this.checkEngine()
    throw new Error('HyperTextEngine.start() must be extended')
  }

  stop () {
    this.checkEngine()
    throw new Error('HyperTextEngine.stop() must be extended')
  }
}
class HyperTextServer extends HyperTextEngine {
  static finalHandler (req, res) {
    res.statusCode = 404
    res.end(`Cannot ${req.method} ${req.url}`)
  }

  constructor () {
    super()
    this.host = null
    this.port = 3000
    this.router = null
    this.ssl = false
  }

  setHost (host) {
    this.host = host
    return this
  }

  setPort (port) {
    this.port = port
    return this
  }

  setSSL (ssl) {
    Assert.isType('Object', ssl)
    if (ssl.key) {
      Assert.isType('string', ssl.key)
      Assert.isType('string', ssl.cert)
    } else if (ssl.pfx) {
      Assert.isType('string', ssl.pfx)
      Assert.isType('string', ssl.passphrase)
    } else {
      throw new Error(`Invalid SSL parameters ${ssl}`)
    }
    this.ssl = ssl
    return this
  }

  createServer (router) {
    if (this.ssl === false) {
      this.setEngine(require('http').createServer())
    } else {
      this.setEngine(require('https').createServer({
        key: this.ssl.key,
        cert: this.ssl.cert
      }))
    }
    if (router instanceof Router) return this.setRouter(router)
    return this
  }

  setRouter (router) {
    Assert.isOk(router instanceof Router, `${router} is not instance of Router`)
    this.router = router
    return this
  }

  getRouter () {
    Assert.isOk(this.router instanceof Router, 'Router is not defined')
    return this.router
  }

  onRequest (req, res) {
    req.on('error', (err) => {
      console.error('Request Error', err)
      res.statusCode = 400
      res.end(`Invalid ${req.method} request on ${req.url}`)
    })
    res.on('error', (err) => {
      console.error('Response Error', err)
    })
    return this.getRouter().request(req, res)
  }

  static handleRequest (req, res) { return this.onRequest(req, res) }

  start () {
    const eng = this.getEngine()
    eng.on('request', HyperTextServer.handleRequest.bind(this))
    if (this.host instanceof Array) {
      this.host.forEach((host) => { eng.listen(this.port, host) })
    } else {
      eng.listen(this.port, this.host)
    }
  }

  stop () {
    const eng = this.getEngine()
    eng.removeListener('request', HyperTextServer.handleRequest)
  }
}
class Proxy {
  static request (url, options) {
    const ssl = new URL(url).protocol === 'https:'
    const agent = ssl ? require('https') : require('http')
    return agent.request(url, options)
  }

  static cleanup (res, request, response) {
    if (res) res.destroy()
    if (request) request.destroy()
    if (response) response.destroy()
    return true
  }

  static pass (req, res, options = {}, follow = undefined) {
    const protocol = options.ssl ? 'https:' : 'http:'
    let url = `${protocol}//${options.host}:${options.port}${req.url}`
    if (follow) {
      const rd = new URL(follow)
      rd.port = rd.port || options.port
      url = `${rd.protocol}//${rd.hostname}:${rd.port}${rd.pathname}`
    }
    const opts = {
      method: req.method || options.method || 'GET',
      agent: false,
      pool: false
    }
    if (options.rejectUnauthorized !== undefined && options.ssl) {
      opts.rejectUnauthorized = options.rejectUnauthorized
    }
    if (options.maxRedirects === undefined) options.maxRedirects = 8
    if (options.referrer) opts.headers = { referer: options.referrer }
    const errorHandler = (e) => {
      res.statusCode = 500
      res.end('Invalid backend response')
      console.log(`Backend request failed to ${req.url}: ${e.message}`)
    }
    const request = Proxy.request(url, opts)
    request.on('response', (response) => {
      const headers = response.headers
      if (headers.location && response.statusCode > 300) {
        if (options.maxRedirects && options.count > options.maxRedirects) {
          return errorHandler(new Error('Max redirects followed'))
        }
        return Proxy.pass(req, res, options, headers.location)
      }
      for (const key in headers) {
        if (!Object.prototype.hasOwnProperty.call(headers, key)) continue
        if (key === 'x-powered-by') continue
        res.setHeader(key, headers[key])
      }
      res.setHeader('X-Powered-By', 'kado <support@kado.org>')
      response.on('error', (e) => {
        Proxy.cleanup(res, request, response)
        errorHandler(e)
      })
      res.on('error', (e) => {
        console.log(`Failed to respond to client(${req.ip}): ${e.message}`)
        Proxy.cleanup(res, request, response)
      })
      req.on('close', () => { Proxy.cleanup(res, request, response) })
      res.on('finish', () => { Proxy.cleanup(res, request, response) })
      response.pipe(res)
    })
    request.on('error', (e) => {
      Proxy.cleanup(res, request)
      errorHandler(e)
    })
    req.pipe(request)
    return true
  }
}
class HyperText extends Connect {
  static getInstance () { return new HyperText() }

  static logRequest (app, options = {}) {
    const formatMessage = (params = {}) => {
      params.size = Format.magnitude(params.size)
      return `${Format.color(params.method, 'Yellow')} ` +
      `${Format.color(params.statusCode, params.statusColor)} ` +
      `${Format.color(`${params.time}ms`, params.timeColor)} ` +
      `${params.url} ` +
      `${params.size ? Format.color(`${params.size}`, 'Light Gray') : ''}\n`
    }
    Assert.isOk(typeof options === 'object', 'Invalid options')
    if (!options.formatMessage) options.formatMessage = formatMessage
    if (!options.statusWarnLevel) options.statusWarnLevel = 300
    if (!options.statusErrorLevel) options.statusErrorLevel = 400
    if (!options.timeWarnLevel) options.timeWarnLevel = 500
    if (!options.timeErrorLevel) options.timeErrorLevel = 1000
    Assert.isOk(typeof options.formatMessage === 'function',
      'Invalid format method for HTTP request logging')
    return (req, res) => {
      const startTime = +new Date()
      res.on('finish', () => {
        const size = res.getHeader('content-length') || 0
        const time = +new Date() - startTime
        let timeColor = 'Light Gray'
        if (time > options.timeWarnLevel) timeColor = 'Yellow'
        if (time > options.timeErrorLevel) timeColor = 'Red'
        const statusCode = res.statusCode
        let statusColor = 'Green'
        if (statusCode >= options.statusWarnLevel) statusColor = 'Cyan'
        if (statusCode >= options.statusErrorLevel) statusColor = 'Red'
        app.log.dump(options.formatMessage({
          method: req.method,
          statusCode: statusCode,
          statusColor: statusColor,
          time: time,
          timeColor: timeColor,
          size: size,
          url: req.url
        }))
      })
    }
  }

  start (name, options) {
    return Connect.each(this, name, options, 'start')
  }

  stop (name) {
    return Connect.each(this, name, null, 'stop')
  }
}
class WebSocket {
  static pack (op, arg) {
    return JSON.stringify({ op: op, arg: arg })
  }

  static unpack (payload) {
    return JSON.parse(payload)
  }

  static hOP (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
  }

  static handleGen (len) {
    len = len || 16
    let handle = ''
    while (handle.length < len) {
      handle += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ' +
        'abcdefghiklmnopqrstuvwxyz'[(Math.random() * 60) | 0]
    }
    return handle
  }

  static register (app, sessionParser) {
    /* example sessionParser
    const sessionParser = Session.getMiddleware({
      secret: cfg.main.cookieSecret || 'admin',
      store: new Session.SessionStoreLocal()
    })
     */
    const ws = require('ws')
    const wss = new ws.Server({
      noServer: true,
      perMessageDeflate: {
        zlibDeflateOptions: {
          // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
      }
    })
    wss.on('connection', (ws, req) => {
      const client = req.session.sid
      console.log(`Received connection from user ${client}`)
      if (!WebSocket.hOP(app.session, client)) app.session[client] = {}
      ws.command = (op, arg) => {
        console.log(`Sending ${op} to user ${client} with arg:`)
        console.log(arg)
        ws.send(WebSocket.pack(op, arg))
      }

      ws.on('message', (msg) => {
        const pkt = WebSocket.unpack(msg)
        if (!pkt.op || !pkt.arg) return
        console.log(`Received ${pkt.op} from user ${client} with arg:`)
        console.log(pkt.arg)
        switch (pkt.op) {
          case 'ping':
            ws.command('pong', pkt.arg)
            break
          case 'taskreg':
            pkt.arg.handle = WebSocket.handleGen()
            if (!WebSocket.hOP(app.session[client], pkt.arg.handle)) {
              app.session[client][pkt.arg.handle] = {
                command: pkt.arg.command
              }
            }
            ws.command(pkt.op, pkt.arg)
            break
          case 'taskrun':
            if (!WebSocket.hOP(app.session[client], pkt.arg.handle)) break
            ws.command('taskout', {
              handle: pkt.arg.handle,
              line: 'wut wut wut?'
            })
            break
          default:
            break
        }
      })
    })
    app.http.getEngine('http').engine.on('upgrade', async (req, sock, head) => {
      req.locals = {}
      req.cookie = Parser.cookie('' + req.headers.cookie)
      await sessionParser(req, sock)
      wss.handleUpgrade(req, sock, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    })
  }
}
HyperText.HyperTextEngine = HyperTextEngine
HyperText.HyperTextServer = HyperTextServer
HyperText.Proxy = Proxy
HyperText.StaticServer = StaticServer
HyperText.WebSocket = WebSocket
module.exports = HyperText
