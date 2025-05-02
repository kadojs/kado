/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Assert = require('./Assert')
class PathExp {
  constructor (path, options) {
    Assert.isType('string', path)
    if (!options) options = {}
    this.end = options.end !== undefined ? options.end : true
    this.exp = {}
    this.keys = {}
    this.options = options || {}
    this.path = path
    this.sensitive = options.sensitive !== undefined ? options.sensitive : false
    this.start = options.start !== undefined ? options.start : true
    this.strict = options.strict !== undefined ? options.strict : false
  }

  build (path) {
    Assert.isType('string', path)
    if (this.exp[path]) return this.exp[path]
    // take the path and make a regular express
    // so like lets start with a regular expression and build it
    let expStr = this.start ? '^' : ''
    // now we need to just look for the start and stop of tokens because this
    // is a custom string parser, which is why i named it PathExp theoretically
    // its a type of regular expression, like typescript is a type of javascript
    const paramExp = new RegExp(
      '(:[A-Za-z0-9_]+)',
      'g' + (this.sensitive ? '' : 'i')
    )
    const params = {}
    let param
    let i = 0
    let lastIndex = 0
    while ((param = paramExp.exec(path)) !== null) {
      const str = param[1] === ':__all' ? '([^\\s]+?)' : '([^/]+?)'
      this.keys[i] = param[1].replace(':', '')
      params[i] = { key: i, param: param, exp: str }
      // apply any chars not used to the exp and then the new portion
      expStr += path.slice(lastIndex, param.index) + str
      lastIndex = param.index + param[1].length
      i++
    }
    expStr += path.slice(lastIndex, path.length)
    expStr += this.strict ? '/?' : ''
    expStr += this.end ? '$' : ''
    this.exp[path] = expStr
    return this.exp[path]
  }

  match (against, params) {
    if (!params) params = {}
    const exp = new RegExp(
      this.build(this.path), 'g' + (this.sensitive ? '' : 'i')
    )
    Assert.isType('RegExp', exp)
    Assert.isType('Object', params)
    let param
    let i = 0
    do {
      param = exp.exec(against)
      if (!param && i === 0) return false
      if (!param && i > 0) break
      if (param.length < 2) continue
      for (const value of param.slice(1, param.length)) {
        params[this.keys[i]] = value
        i++
      }
    } while (param instanceof Array)
    return true
  }
}
module.exports = PathExp
