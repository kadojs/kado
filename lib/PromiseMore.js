/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
