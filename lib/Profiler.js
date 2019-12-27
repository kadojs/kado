'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */

module.exports = class Profiler {
  static getInstance(){ return new Profiler() }
  constructor(){
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
  /**
   * Add query to the profiler
   */
  addQuery(sql,time){
    this.queryCount = this.queryCount + 1
    let entry = {sql: sql, time: time}
    this.queryLog.push(entry)
    return this.queryCount
  }
  /**
   * Start the render timer
   */
  startRender(){
    this.renderStart = +new Date()
    return this.renderStart
  }
  /**
   * Build profile
   * @param {string} version Kado version
   */
  build(version){
    if(0 === this.start) this.start = +new Date()
    if(0 === this.renderStart) this.renderStart = +new Date()
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
    if(version) h = h + 'Kado: v' + version
    h = h + '</div>'
    this.queryLog.forEach((q,i)=>{
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
