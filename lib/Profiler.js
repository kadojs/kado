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

module.exports = class Profiler {
  static getInstance () { return new Profiler() }
  constructor () {
    this.start = +new Date()
    this.end = 0
    this.buildTime = 0
    this.totalTime = 0
    this.renderStart = 0
    this.renderEnd = 0
    this.renderTime = 0
    this.queryCount = 0
    this.queryLog = []
    this.HTML = ''
  }

  addQuery (sql, time) {
    this.queryCount = this.queryCount + 1
    const entry = { sql: sql, time: time }
    this.queryLog.push(entry)
    return this.queryCount
  }

  startRender () {
    this.renderStart = +new Date()
    return this.renderStart
  }

  build (version) {
    if (this.start === 0) this.start = +new Date()
    if (this.renderStart === 0) this.renderStart = +new Date()
    this.renderEnd = +new Date()
    this.renderTime = this.renderEnd - this.renderStart
    this.end = +new Date()
    this.totalTime = this.end - this.start
    this.buildTime = this.totalTime - this.renderTime
    let h = '<div id="kado-profiler">'
    h = h + '<h5>Kado Page Performance Profile</h5>'
    h = h + '<div class="kado-profiler-stats">'
    h = h + `Execution Time: ${this.totalTime}ms | `
    h = h + `Build Time: ${this.buildTime}ms | `
    h = h + `Render Time: ${this.renderTime}ms | `
    h = h + `Query Count: ${this.queryCount} | `
    if (version) h = h + 'Kado: v' + version
    h = h + '</div>'
    this.queryLog.forEach((q, i) => {
      h = h + '<div class="kado-profiler-query">'
      h = h + '<div class="kado-profiler-query-header">'
      h = h + `Query #${i} took ${q.time}ms</div>`
      h = h + '<p class="kado-profiler-query-content">'
      h = h + `SQL: ${q.sql}</p>`
      h = h + '</div>'
    })
    h = h + '</div>'
    this.HTML = h
    return {
      start: this.start,
      end: this.end,
      buildTime: this.buildTime,
      totalTime: this.totalTime,
      renderTime: this.renderTime,
      queryCount: this.queryCount,
      queryLog: this.queryLog,
      HTML: this.HTML
    }
  }
}
