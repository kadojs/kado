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
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const fs = require('../lib/FileSystem')
const Cluster = require('../lib/Cluster')
const cluster = new Cluster({
  count: 1,
  maxConnections: 2,
  delayRespawn: 1,
  silent: true
})
runner.suite('Cluster', (it) => {
  it('should instantiate', () => {
    Assert.isType('Cluster', cluster)
  })
  it('should fail to instantiate second instance', () => {
    try {
      Assert.isType('Cluster', new Cluster())
    } catch (e) {
      Assert.isType('AssertionError', e)
      Assert.eq(
        e.message,
        'Due to limitations of Node.JS only one master ' +
        'is allowed per process.'
      )
    }
  })
  it('should set env', () => {
    const rv = cluster.setEnv({ test: 'test' })
    Assert.isType('Cluster', rv)
  })
  it('should have the set env', () => {
    const rv = cluster.getEnv()
    Assert.isType('Object', rv)
    Assert.eq(rv.test, 'test')
  })
  it('should check if master', () => {
    Assert.eq(cluster.isMaster())
  })
  it('should check if worker', () => {
    Assert.eq(cluster.isWorker(), false)
  })
  it('should get scheduling policy', () => {
    Assert.eq(cluster.getSchedulingPolicy(), cluster.cluster.SCHED_RR)
  })
  it('should set scheduling policy', () => {
    cluster.setSchedulingPolicy(cluster.cluster.SCHED_NONE)
    Assert.eq(cluster.getSchedulingPolicy(), cluster.cluster.SCHED_NONE)
    cluster.setSchedulingPolicy(cluster.cluster.SCHED_RR)
  })
  it('should get settings', () => {
    Assert.isType('Object', cluster.getSettings())
  })
  it('should set path', () => {
    const newPath = fs.path.join(__dirname, '/fixture/clusterWorker.js')
    const rv = cluster.setPath(newPath)
    Assert.isType('Cluster', rv)
    Assert.eq(rv.path, newPath)
  })
  it('should watch a file', () => {
    return cluster.start().then(() => {
      return new Promise((resolve, reject) => {
        // lower watch timeout
        cluster.timeout.watch = 1
        // set watcher
        const watchPath = fs.path.join(__dirname, '/fixture/changeme.js')
        const rv = cluster.watch(watchPath)
        Assert.isType('Object', rv)
        Assert.eq(rv[0].path, watchPath)
        // change the file
        const watchData = fs.readFileSync(watchPath)
        fs.writeFileSync(watchPath, watchData + '\n')
        cluster.once('restart', () => {
          cluster.unwatch(watchPath)
          fs.writeFileSync(watchPath, watchData)
          cluster.stop().then(() => { return resolve() })
        })
        setTimeout(() => {
          reject(new Error('Failed to restart cluster before' +
            ' timeout of 1000ms'))
        }, 1000)
      })
    })
  })
  it('should start', async () => {
    const rv = await cluster.start()
    Assert.isType('undefined', rv)
    Assert.eq(cluster.started)
  })
  it('should send messages', () => {
    return new Promise((resolve, reject) => {
      const messageListener = (msg) => {
        if (msg !== 'pong') return false
        cluster.removeListener('message', messageListener)
        resolve(true)
      }
      cluster.on('message', messageListener)
      Assert.eq(cluster.started)
      const rv = cluster.send('ping')
      Assert.isType('Object', rv)
      Assert.eq(Object.keys(rv).length, 1)
      setTimeout(() => { reject(new Error('Failed to send messages')) }, 5000)
    })
  })
  it('should respawn crashed workers', () => {
    return new Promise((resolve, reject) => {
      cluster.once('respawn', (worker) => {
        Assert.isType('Worker', worker)
        resolve(true)
      })
      cluster.kill('SIGHUP')
      setTimeout(() => { reject(new Error('Failed to respawn in time')) }, 5000)
    })
  })
  it('should stop', async () => {
    const rv = await cluster.stop()
    Assert.isType('boolean', rv)
    Assert.eq(rv)
  })
  it('should start again', async () => {
    const rv = await cluster.start()
    Assert.isType('undefined', rv)
    Assert.eq(cluster.started)
  })
  it('should restart', async () => {
    const rv = await cluster.restart()
    Assert.isType('undefined', rv)
    Assert.eq(cluster.started)
  })
  it('should kill with SIGKILL', () => {
    return new Promise((resolve, reject) => {
      cluster.once('respawn', (worker) => {
        Assert.isType('Worker', worker)
        resolve(true)
      })
      const rv = cluster.kill('SIGKILL')
      Assert.isType('Object', rv)
      Assert.eq(Object.keys(rv).length, 1)
      setTimeout(() => { reject(new Error('Failed to kill in time')) }, 5000)
    })
  })
  it('should kill with SIGHUP', () => {
    return new Promise((resolve, reject) => {
      cluster.once('respawn', (worker) => {
        Assert.isType('Worker', worker)
        resolve(true)
      })
      const rv = cluster.kill('SIGHUP')
      Assert.isType('Object', rv)
      Assert.eq(Object.keys(rv).length, 1)
      setTimeout(() => { reject(new Error('Failed to kill in time')) }, 5000)
    })
  })
  it('should recycle worker after max connections', () => {
    return new Promise((resolve, reject) => {
      cluster.once('recycle', (worker) => {
        Assert.isType('Worker', worker)
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
        Assert.isType('undefined', result)
      })
  })
  it('should exit', () => {
    const rv = cluster.exit()
    Assert.eq(rv)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
