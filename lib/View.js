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
const fs = require('./FileSystem')
class ViewEngine extends ConnectEngine {
  render () {
    this.checkEngine()
    throw new Error('ViewEngine.render() must be extended')
  }
}
class ViewMustache extends ViewEngine {
  constructor (viewFolder, options = {}) {
    super()
    this.setEngine(require('./Mustache'))
    Assert.isType('string', viewFolder)
    Assert.isType('Object', options)
    this.folder = {}
    this.partial = {}
    this.partialCache = options.partialCache !== undefined
      ? options.partialCache
      : false
    this.template = {}
    this.templateCache = options.templateCache !== undefined
      ? options.templateCache
      : false
    this.viewExtension = options.viewExtension ? options.viewExtension : 'html'
    if (process.NODE_ENV === 'production') {
      if (options.partialCache === undefined) this.partialCache = true
      if (options.templateCache === undefined) this.templateCache = true
    }
    this.addFolder(viewFolder)
  }

  addFolder (folderPath) {
    this.folder[Object.keys(this.folder).length] = folderPath
  }

  addPartial (name, template) {
    if (!this.partialCache) return false
    this.partial[name] = template
    return this.partial[name]
  }

  getPartial (name) {
    if (this.partial[name]) return this.partial[name]
    return false
  }

  addTemplate (path, template, partials) {
    if (!this.templateCache) return false
    this.template[path] = { template: template, partials: partials }
    return this.template[path]
  }

  getTemplate (path) {
    if (this.template[path]) return this.template[path]
    return false
  }

  findPartials (template, tags = ['{{', '}}']) {
    const Mustache = this.getEngine()
    const result = Mustache.parse(template, tags)
    const promises = []
    const partials = {}
    result.forEach((tag) => {
      if (tag[0] !== '>' || !(typeof tag[1] === 'string') || !tag[1].length) {
        return false
      }
      const partialName = tag[1]
      const partial = this.getPartial(partialName)
      if (partial !== false) {
        partials[partialName] = partial
        return true
      }
      const promise = this.loadTemplate(partialName)
        .then((result) => {
          const [template, morePartials] = result
          this.addPartial(partialName, template)
          partials[partialName] = template
          if (!(morePartials instanceof Object)) return
          for (const i in morePartials) {
            if (!Object.prototype.hasOwnProperty.call(morePartials, i)) {
              continue
            }
            partials[i] = morePartials[i]
          }
        })
      promises.push(promise)
    })
    return Promise.all(promises).then(() => { return partials })
  }

  resolveTemplate (templateName) {
    for (const i in this.folder) {
      if (!Object.prototype.hasOwnProperty.call(this.folder, i)) continue
      const testFile = fs.path.join(
        this.folder[i],
        `${templateName}.${this.viewExtension}`
      )
      if (fs.exists(testFile)) return testFile
    }
    return false
  }

  loadTemplate (templateName, tags) {
    let template = null
    let templateFile = null
    return Promise.resolve()
      .then(() => {
        templateFile = this.resolveTemplate(templateName)
        Assert.isOk(templateFile, `${templateName} does not exist`)
        template = this.getTemplate(templateFile)
        if (template && template.template) {
          return [template.template, template.partials]
        } else {
          return fs.readFile(templateFile, { encoding: 'utf-8' })
            .then((result) => {
              Assert.isType('string', result)
              template = result
              return this.findPartials(template, tags)
            })
            .then((partials) => {
              this.addTemplate(templateFile, template, partials)
              return [template, partials]
            })
        }
      })
  }

  render (req, res, templateName, params, options = {}) {
    const Mustache = this.getEngine()
    let tags = ['{{', '}}']
    if (options.tags) tags = options.tags
    this.loadTemplate(templateName, tags)
      .then((result) => {
        const [template, partials] = result
        const rv = Mustache.render(template, params, partials, tags)
        const tag = ETag.getTag(rv)
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Length', rv.length)
        res.setHeader('ETag', tag)
        if (req.headers['if-none-match'] === tag) {
          res.statusCode = 304
          res.end()
        } else {
          res.end(rv)
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          res.statusCode = 500
          const msg = `Error rendering view: ${err.message}`
          res.setHeader('Content-Type', 'text/plain')
          res.setHeader('Content-Length', msg.length)
          res.end(msg)
        } else {
          const msg = 'Unknown rendering error'
          console.error(msg, err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain')
          res.setHeader('Content-Length', msg.length)
          res.end(msg)
        }
      })
  }
}
class View extends Connect {
  static getInstance () { return new View() }
  constructor () {
    super()
    this.view = {}
  }

  add (name, view) {
    if (!view) view = name
    this.view[name] = view
    return view
  }

  update (name, view) {
    this.view[name] = view
    return view
  }

  remove (name) {
    const view = this.view[name]
    delete this.view[name]
    return view
  }

  get (name) {
    return this.view[name]
  }

  all () {
    return this.view
  }
}
View.ViewEngine = ViewEngine
View.ViewMustache = ViewMustache
module.exports = View
