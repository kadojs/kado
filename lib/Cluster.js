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
const cluster = require('cluster')
const EventEmitter = require('events').EventEmitter
const Mapper = require('./Mapper')
const net = require('net')
const path = require('path')

const instance = { master: null }

class Cluster extends EventEmitter {
  static handleSigint () {
    if (process.platform !== 'win32') return false
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.on('SIGINT', () => { process.emit('SIGINT') })
    return true
  }

  static child (server, title, start, stop) {
    if (!(server instanceof net.Server)) {
      throw new Error('Server passed is not instance of net.Server')
    }
    const heartbeatDelay = process.env.HEARTBEAT_INTERVAL || 1000
    const checkHeartbeat = () => {
      if (process._heartbeat === undefined) return true
      const maxDelay = heartbeatDelay * 32
      const minimumTimestamp = +new Date() - maxDelay
      if (process._heartbeat < minimumTimestamp) {
        if (typeof process.send === 'function') {
          process.send({
            error: new Error(`Connection to master lost for ${process.pid}`)
          }, (e) => { if (e instanceof Error) console.log(e) })
        }
        process.exit(11)
      }
    }
    const heartbeatInterval = setInterval(() => {
      checkHeartbeat()
    }, heartbeatDelay)
    const stopChild = () => {
      clearInterval(heartbeatInterval)
      return Promise.resolve()
        .then(() => { return stop() })
        .then(() => {
          process.send('SIGSTOP')
          process.exit(0)
        })
        .catch((err) => {
          if (!(err instanceof Error)) return false
          console.log(err)
          process.send({ error: err })
        })
    }
    process.title = title
    process.on('message', (message) => {
      if (message === 'SIGSTOP') return stopChild()
      if (message.match('hb:')) {
        process._heartbeat = +message.replace(/\D+/ig, '')
      }
    })
    if (typeof process.send === 'function') {
      process.on('SIGTERM', () => {})
      process.on('SIGINT', () => {})
      process.on('SIGHUP', () => { return stopChild() })
    } else {
      Cluster.handleSigint()
      process.on('SIGTERM', () => { return stopChild() })
      process.on('SIGINT', () => { return stopChild() })
    }
    return Promise.resolve().then(() => { return start() })
      .then(() => {
        process.send('SIGSTART')
        server.on('request', () => {
          return process.send && process.connected ? process.send('request')
            : false
        })
      })
      .catch((err) => {
        if (!(err instanceof Error)) return false
        console.log(err)
        process.send({ error: err })
      })
  }

  static getInstance (options) { return new Cluster(options) }

  constructor (options) {
    if (instance.master !== null) {
      throw new Error('Due to limitations of Node.JS only one master ' +
        'is allowed per process.')
    }
    super()
    if (!options) options = {}
    this.count = 1
    this.delay = {
      heartbeat: options.delayHeartbeat || 5000,
      respawn: options.delayRespawn || 1000
    }
    this.env = { HEARTBEAT_INTERVAL: this.delay.heartbeat }
    this.masterOptions = {
      silent: options.silent || false
    }
    this.interval = { heartbeat: null }
    this.max = {
      connections: options.maxConnections || 1000000
    }
    this.pid = { master: process.pid }
    this.recycleTimeout = options.recycleTimeout || null
    this.requests = { total: 0 }
    this.respawn = true
    this.schedulingPolicy = options.schedulingPolicy || cluster.SCHED_RR
    this.stopTimeout = options.stopTimeout || 5000
    this.started = null
    this.status = null
    this.timeout = {
      recycle: options.recycleTimeout || 5000,
      respawn: options.respawnTimeout || 5000,
      start: options.startTimeoiut || 5000,
      stop: options.stopTimeout || 5000
    }
    this.path = options.path || process.argv[1]
    this.worker = {}
    this.registerExitHandler()
    this.setupCluster()
    instance.master = this
  }

  registerExitHandler () {
    process.on('exit', () => { this.kill('SIGKILL') })
  }

  prepareWorker (worker) {
    let listeners = worker.process.listeners('exit')[0]
    const exit = listeners[Object.keys(listeners)[0]]
    listeners = worker.process.listeners('disconnect')[0]
    const disconnect = listeners[Object.keys(listeners)[0]]
    if (typeof exit === 'function') {
      worker.process.removeListener('exit', exit)
    }
    worker.process.once('exit', (exitCode, signalCode) => {
      if (worker.state !== 'disconnected' && typeof disconnect === 'function') {
        disconnect()
      }
      if (typeof exit === 'function') exit(exitCode, signalCode)
    })
    return worker
  }

  fork () {
    return this.prepareWorker(cluster.fork(this.getEnv()))
  }

  checkRecycle (worker) {
    return this.requests[worker.process.pid] > this.max.connections
  }

  recycleWorker (worker) {
    worker.recycling = true
    const replacement = this.fork()
    const killTimeout = setTimeout(() => {
      worker.killed = true
      worker.kill('SIGKILL')
    }, this.timeout.recycle)
    const startListener = (message) => {
      if (message !== 'SIGSTART') return false
      replacement.removeListener('message', startListener)
      this.emit('recycle', worker, replacement)
      worker.on('exit', () => { clearTimeout(killTimeout) })
      worker.send('SIGSTOP')
      worker.disconnect()
    }
    replacement.on('message', startListener)
    return replacement
  }

  handleWorkerMessage (worker, message) {
    if (typeof message === 'object' && message.status === 'error') {
      if (message.message && message.message === 'Connection to master lost') {
        this.emit('orphan', worker)
      }
      return true
    }
    if (!message || message !== 'request') return this.emit('message', message)
    this.requests.total++
    if (!this.requests[worker.process.pid]) {
      this.requests[worker.process.pid] = 0
    }
    this.requests[worker.process.pid]++
    return this.checkRecycle(worker) ? this.recycleWorker(worker) : true
  }

  setupWorker (worker) {
    worker.send(`hb:${+new Date()}`)
    this.pid[worker.process.pid] = worker
    worker.on('exit', (code, signal) => {
      delete this.pid[worker.process.pid]
      delete this.requests[worker.process.pid]
      this.emit('exit', worker, code, signal)
    })
    const startListener = (message) => {
      if (message !== 'SIGSTART') return
      worker.removeListener('message', startListener)
      this.emit('worker', worker)
    }
    worker.on('message', startListener)
    worker.on('message', (message) => {
      this.handleWorkerMessage(worker, message)
    })
  }

  respawnWorker (worker, code, signal) {
    return new Promise((resolve, reject) => {
      const procFile = path.basename(worker.process.spawnargs[1])
      if (!(
        worker.exitedAfterDisconnect === false &&
        this.started === true &&
        this.respawn === true
      )) {
        if (this.status === 'stopping') {
          return resolve(false)
        } else {
          return reject(new Error(
            `(${worker.process.pid})${procFile} Not eligible for respawn, ` +
            `isExitedAfterDisconnect: ${worker.exitedAfterDisconnect}, ` +
            `isStarted: ${this.started}, isRespawn: ${this.respawn}`
          ))
        }
      }
      cluster.once('online', (replacement) => {
        replacement.on('message', (message) => {
          if (message !== 'SIGSTART') return false
          this.emit('respawn', worker, replacement, code, signal)
          resolve({
            worker: worker,
            replacement: replacement,
            code: code,
            signal: signal
          })
        })
      })
      setTimeout(() => { this.fork() }, this.delay.respawn)
      setTimeout(() => {
        const err = new Error('Replacement worker failed to start ' +
          `after timeout: ${this.timeout.respawn}ms`
        )
        this.emit('error', err)
        reject(err)
      }, this.timeout.respawn)
    })
  }

  setupCluster () {
    cluster.schedulingPolicy = this.schedulingPolicy
    cluster.on('online', (worker) => { this.setupWorker(worker) })
    cluster.on('exit', (code, signal) => {
      this.respawnWorker(code, signal)
        .catch((e) => {
          if (e instanceof Error) {
            console.error(`Failed to respawn worker: ${e.message}`)
          } else {
            console.log(e)
            process.exit(12)
          }
        })
    })
    cluster.on('stop', () => { clearInterval(this.interval.heartbeat) })
  }

  getMasterOptions () {
    const obj = {}
    Mapper.mergeObject(obj, this.masterOptions)
    obj.exec = this.path
    return obj
  }

  prepareCluster () {
    cluster.setupMaster(this.getMasterOptions())
    this.interval.heartbeat = setInterval(() => {
      this.send(`hb:${+new Date()}`)
    }, this.delay.heartbeat)
  }

  each (fn) {
    const rv = {}
    for (const i in cluster.workers) {
      if (!Object.prototype.hasOwnProperty.call(cluster.workers, i)) continue
      if (typeof fn === 'function') rv[i] = fn(cluster.workers[i])
    }
    return rv
  }

  kill (signal = 'SIGTERM') {
    return this.each((worker) => {
      try {
        if (signal === 'SIGHUP') {
          worker.send(signal)
        } else {
          worker.process.kill(signal)
        }
      } catch (e) {
        console.log(e)
        return false
      }
    })
  }

  destruct () {
    return this.stop()
      .then(() => {
        return new Promise((resolve, reject) => {
          cluster.disconnect((e, result) => {
            if (e instanceof Error) return reject(e)
            instance.master = null
            resolve(result)
          })
        })
      })
  }

  exit (code = 0, exitNow = false) {
    this.setStatus('exiting', code)
    this.kill('SIGKILL')
    if (exitNow === true) process.exit(code)
    return true
  }

  send (message) {
    return this.each((worker) => {
      try {
        return worker.send(message, (e) => {
          if (e instanceof Error) this.emit('messageError', e)
        })
      } catch (e) {
        this.emit('messageError', e)
        return e
      }
    })
  }

  setStatus (status) {
    this.emit('status', status)
    this.status = status
    return this
  }

  setEnv (env) {
    this.env = env
    return this
  }

  getEnv () {
    const env = {}
    Mapper.mergeObject(env, process.env)
    Mapper.mergeObject(env, this.env)
    return env
  }

  setPath (path) {
    this.path = path
    this.emit('path', path)
    return this
  }

  start () {
    let workersOnline = 0
    this.setStatus('starting')
    this.prepareCluster()
    for (let i = 1; i <= this.count; i++) this.worker[i] = this.fork()
    const startListener = () => { workersOnline++ }
    this.on('worker', startListener)
    return new Promise((resolve, reject) => {
      const startTimeout = setTimeout(() => {
        this.removeListener('worker', startListener)
        reject(new Error(
          `Cluster start timeout exceeded: ${this.timeout.start}ms`
        ))
      }, this.timeout.start)
      const startInterval = setInterval(() => {
        if (workersOnline === this.count) {
          this.started = true
          clearTimeout(startTimeout)
          clearInterval(startInterval)
          this.removeListener('worker', startListener)
          this.setStatus('started')
          resolve()
        }
      }, 100)
    })
  }

  stop () {
    this.started = false
    this.setStatus('stopping')
    let workersOnline = Object.keys(this.pid).length
    this.send('SIGSTOP')
    const exitListener = () => { workersOnline-- }
    this.on('exit', exitListener)
    return new Promise((resolve, reject) => {
      const stopTimeout = setTimeout(() => {
        this.kill('SIGKILL')
        this.removeListener('exit', exitListener)
        reject(new Error('Killed cluster after stop timeout ' +
          `exceeded ${this.timeout.stop}ms`
        ))
      }, this.timeout.stop)
      const stopInterval = setInterval(() => {
        if (workersOnline > 1) return false
        clearTimeout(stopTimeout)
        clearInterval(stopInterval)
        this.removeListener('exit', exitListener)
        this.setStatus('stopped')
        resolve(true)
      }, 1)
    })
  }

  restart () {
    return this.stop().then(() => { return this.start() })
  }
}
module.exports = Cluster
