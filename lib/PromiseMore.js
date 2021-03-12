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
class PromiseMore {
  static hoist () {
    let _resolve = () => {}
    let _reject = () => {}
    const promise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    promise.resolve = _resolve
    promise.reject = _reject
    return promise
  }

  static make () {
    const args = Array.prototype.slice.call(arguments)
    const context = args.shift()
    const method = args.shift()
    const promise = PromiseMore.hoist()
    const callback = function () {
      const args = Array.prototype.slice.call(arguments)
      const err = args.shift()
      if (err) return promise.reject(err)
      promise.resolve.apply(context, args)
    }
    args.push(callback)
    method.apply(context, args)
    return promise
  }

  static async series (
    input = [], callback = () => {}, ctx = {}, output = [], idx = 0
  ) {
    if (input.length === 0) return output
    const item = input.shift()
    idx++
    output.push(await callback(item, idx, ctx))
    return PromiseMore.series(input, callback, ctx, output, idx)
  }

  static while (condition, promise) {
    return new Promise(function (resolve, reject) {
      const loop = function () {
        if (!condition()) return resolve()
        return promise().then(loop).catch(reject)
      }
      process.nextTick(loop)
    })
  }
}
module.exports = PromiseMore
