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
const Stream = require('stream')
class StreamChain extends Stream.Readable {
  constructor (options = {}) {
    super({ highWaterMark: options.highWaterMark })
    this.currentStream = null
    this.busy = false
    this.paused = true
    this.pending = false
    this.released = false
    this.streams = []
    this.writable = false
  }

  addStream (stream) {
    const isStream = this.isLikeStream(stream)
    if (isStream) {
      this.handleErrors(stream)
      if (this.paused) stream.pause()
    }
    this.streams.push(stream)
    return this
  }

  destroy () {
    this.reset()
    this.emit('close')
  }

  emitError (err) {
    this.reset()
    this.emit('error', err)
  }

  end () {
    this.reset()
    this.emit('end')
  }

  findStream () {
    const stream = this.streams.shift()
    if (stream === undefined) {
      return this.end()
    }
    if (typeof stream === 'function') {
      stream(function (stream) {
        const isStream = this.isLikeStream(stream)
        if (isStream) { this.handleErrors(stream) }
        this.pipeStream(stream)
      }.bind(this))
    } else {
      this.pipeStream(stream)
    }
  }

  handleErrors (stream) {
    if (this.isLikeStream(stream)) {
      stream.on('error', (err) => { this.emitError(err) })
    }
  }

  isLikeStream (stream) {
    return (typeof stream !== 'function') &&
      (typeof stream !== 'string') &&
      (typeof stream !== 'boolean') &&
      (typeof stream !== 'number') &&
      (!Buffer.isBuffer(stream))
  }

  nextStream () {
    this.currentStream = null
    if (this.busy) {
      this.pending = true
      return
    }
    this.busy = true
    try {
      do {
        this.pending = false
        this.findStream()
      } while (this.pending)
    } finally {
      this.busy = false
    }
  }

  pipe (dest, options = {}) {
    const str = Stream.prototype.pipe.call(this, dest, options)
    this.resume()
    return str
  }

  pipeStream (stream) {
    this.currentStream = stream
    const isStream = this.isLikeStream(stream)
    if (isStream) {
      stream.on('end', this.nextStream.bind(this))
      stream.pipe(this, { end: false })
      return
    }
    this.write(stream)
    this.nextStream()
  }

  pause () {
    if (!this.paused) return
    if (this.currentStream) this.currentStream.pause()
    this.emit('pause')
  }

  reset () {
    this.writable = false
    this.streams = []
    this.currentStream = null
  }

  resume () {
    if (!this.released) {
      this.released = true
      this.writable = true
      this.nextStream()
    }
    if (this.paused && this.currentStream.resume) {
      this.currentStream.resume()
    }
    this.emit('resume')
  }

  write (data) { this.emit('data', data) }
}
module.exports = StreamChain
