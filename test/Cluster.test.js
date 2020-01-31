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
const path = require('path')
const runner = require('../lib/TestRunner').getInstance('Kado')
const { expect } = require('../lib/Assert')
const Cluster = require('../lib/Cluster')
const cluster = new Cluster({
  maxConnections: 2,
  delayRespawn: 1,
  silent: true
})
runner.suite('Cluster', (it) => {
  it('should instantiate', () => {
    expect.isType('Cluster', cluster)
  })
  it('should fail to instantiate second instance', () => {
    try {
      expect.isType('Cluster', new Cluster())
    } catch (e) {
      expect.isType('Error', e)
      expect.eq(
        e.message,
        'Due to limitations of Node.JS only one master ' +
        'is allowed per process.'
      )
    }
  })
  it('should set env', () => {
    const rv = cluster.setEnv({ test: 'test' })
    expect.isType('Cluster', rv)
  })
  it('should have the set env', () => {
    const rv = cluster.getEnv()
    expect.isType('Object', rv)
    expect.eq(rv.test, 'test')
  })
  it('should set path', () => {
    const newPath = path.join(__dirname, '/fixture/worker.js')
    const rv = cluster.setPath(newPath)
    expect.isType('Cluster', rv)
    expect.eq(rv.path, newPath)
  })
  it('should start', async () => {
    const rv = await cluster.start()
    expect.isType('undefined', rv)
    expect.eq(cluster.started)
  })
  it('should send messages', () => {
    return new Promise((resolve, reject) => {
      const messageListener = (msg) => {
        if (msg !== 'pong') return false
        cluster.removeListener('message', messageListener)
        resolve(true)
      }
      cluster.on('message', messageListener)
      expect.eq(cluster.started)
      const rv = cluster.send('ping')
      expect.isType('Object', rv)
      expect.eq(Object.keys(rv).length, 1)
      setTimeout(() => { reject(new Error('Failed to send messages')) }, 5000)
    })
  })
  it('should respawn crashed workers', () => {
    return new Promise((resolve, reject) => {
      cluster.once('respawn', (worker) => {
        expect.isType('Worker', worker)
        resolve(true)
      })
      cluster.kill('SIGHUP')
      setTimeout(() => { reject(new Error('Failed to respawn in time')) }, 5000)
    })
  })
  it('should stop', async () => {
    const rv = await cluster.stop()
    expect.isType('boolean', rv)
    expect.eq(rv)
  })
  it('should start again', async () => {
    const rv = await cluster.start()
    expect.isType('undefined', rv)
    expect.eq(cluster.started)
  })
  it('should restart', async () => {
    const rv = await cluster.restart()
    expect.isType('undefined', rv)
    expect.eq(cluster.started)
  })
  it('should kill with SIGKILL', () => {
    return new Promise((resolve, reject) => {
      cluster.once('respawn', (worker) => {
        expect.isType('Worker', worker)
        resolve(true)
      })
      const rv = cluster.kill('SIGKILL')
      expect.isType('Object', rv)
      expect.eq(Object.keys(rv).length, 1)
      setTimeout(() => { reject(new Error('Failed to kill in time')) }, 5000)
    })
  })
  it('should kill with SIGHUP', () => {
    return new Promise((resolve, reject) => {
      cluster.once('respawn', (worker) => {
        expect.isType('Worker', worker)
        resolve(true)
      })
      const rv = cluster.kill('SIGHUP')
      expect.isType('Object', rv)
      expect.eq(Object.keys(rv).length, 1)
      setTimeout(() => { reject(new Error('Failed to kill in time')) }, 5000)
    })
  })
  it('should recycle worker after max connections', () => {
    return new Promise((resolve, reject) => {
      cluster.once('recycle', (worker) => {
        expect.isType('Worker', worker)
        resolve(true)
      })
      // send 3 requests to trigger a recycle
      cluster.send('request')
      cluster.send('request')
      cluster.send('request')
      setTimeout(() => { reject(new Error('Failed to recycle in time')) }, 5000)
    })
  })
  it('should destruct', () => {
    return cluster.destruct()
      .then((result) => {
        expect.isType('undefined', result)
      })
  })
  it('should exit', () => {
    const rv = cluster.exit()
    expect.eq(rv)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
