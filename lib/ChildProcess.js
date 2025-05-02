/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')
const cp = require('child_process')
const EventEmitter = require('events').EventEmitter
const Mapper = require('./Mapper')

class ChildProcess extends EventEmitter {
  constructor (options) {
    super()
    if (!options) options = {}
    this.child = {}
    this.env = {}
    this.fork = {
      cwd: process.cwd(),
      detached: false,
      env: this.getEnv()
    }
    Mapper.mergeObject(this.fork, options.fork || {})
    this.path = false
    this.pid = {}
    this.respawn = options.respawn || true
    this.started = false
    this.timeout = options.timeout || 10000
    this.registerExitHandler()
    if (options.path) this.setPath(options.path)
    this.setStatus('offline')
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

  setStatus (status) {
    this.status = status
    this.emit('status', this.status)
    return this
  }

  setPath (path) {
    this.path = path
    this.emit('path', path)
    return this
  }

  onExit (signal = 'SIGKILL') {
    let kc = 0
    for (const i in this.child) {
      if (!Object.prototype.hasOwnProperty.call(this.child, i)) continue
      this.child[i].kill(signal)
      kc++
    }
    return kc
  }

  registerExitHandler () {
    process.on('exit', () => { this.stop() })
  }

  handleMessage (proc, message) {
    this.emit('message', { proc: proc, message: message })
  }

  respawnChild () {
    if (this.respawn === true && this.started === true && this.pid === false) {
      this.addChild(cp.fork(this.path, this.fork))
    }
  }

  addChild (proc) {
    proc.on('exit', (code) => { this.emit('exit', code) })
    proc.on('close', () => {
      delete this.pid[proc.pid]
      this.respawnChild()
    })
    proc.on('message', (msg) => { this.handleMessage(proc, msg) })
    this.pid[proc.pid] = proc
    this.emit('child', proc.pid)
    this.started = true
    this.child[Object.keys(this.child).length] = proc
    return proc
  }

  stopChild (proc) {
    return new Promise((resolve, reject) => {
      proc.once('exit', (code) => {
        if (code > 0) {
          const err = new Error(`${this.path} unusual exit code: ${code}`)
          this.emit('stopError', err)
          return reject(err)
        }
        return resolve(code)
      })
      setTimeout(() => {
        proc.kill('SIGKILL')
        reject(new Error(`Timeout exceeded stopping ${this.pid}`))
      }, this.timeout)
      proc.send('SIGSTOP')
    })
  }

  send (message, sendHandle, options) {
    const rv = {}
    for (const i in this.child) {
      if (!Object.prototype.hasOwnProperty.call(this.child, i)) continue
      rv[this.child[i].pid] = this.child[i].send(
        message, sendHandle, options, (e) => {
          if (e instanceof Error) {
            this.emit('messageError', { proc: this.child[i], error: e })
          }
        }
      )
    }
    return rv
  }

  kill (signal = 'SIGTERM') {
    return this.onExit(signal)
  }

  start () {
    this.setStatus('starting')
    return Promise.resolve()
      .then(() => {
        Assert.isOk(this.started !== true,
          `Process ${this.path} already started: ${this.pid}`)
        Assert.isOk(this.path !== false,
          `${this.path} must be an executable program`)
        const proc = this.addChild(cp.fork(this.path, this.fork))
        this.setStatus('online')
        return proc
      })
  }

  stop () {
    this.setStatus('stopping')
    return Promise.resolve()
      .then(() => {
        Assert.isOk(this.started !== false,
          `Child process ${this.path} is not running`)
        // prevent re spawns
        this.started = false
        const promises = []
        for (const i in this.child) {
          if (!Object.prototype.hasOwnProperty.call(this.child, i)) continue
          promises.push(this.stopChild(this.child[i]))
        }
        return Promise.all(promises)
      })
  }
}
module.exports = ChildProcess
