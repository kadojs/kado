'use strict';
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

module.exports = class Cron {
  static getInstance(){ return new Cron() }
  constructor(){
    this.CronJob = require('cron').CronJob
    this.cron = {}
  }
  /**
   * Create a cron job
   * @param {name} name
   * @param {string} cronTime
   * @param {function} onTick
   * @param {object} opts
   */
  create(name,cronTime,onTick,opts){
    let params = {}
    if(cronTime) params.cronTime = cronTime
    if(onTick) params.onTick = onTick
    if(!cronTime || !onTick){
      throw new Error('cronTime and onTick required to schedule a cron job')
    }
    if(opts.onComplete) params.onComplete = opts.onComplete
    if(opts.start) params.start = opts.start
    if(opts.timeZone) params.timeZone = opts.timeZone
    if(opts.context) params.context = opts.context
    if(opts.runOnInit) params.runOnInit = opts.runOnInit
    if(opts.utcOffset) params.utcOffset = opts.utcOffset
    if(opts.unrefTimeout) params.unrefTimeout = opts.unrefTimeout
    this.cron[name] = new this.CronJob(params)
    this.cron[name].start()
    return this.cron[name]
  }
  /**
   * Get cron entry by name
   * @param {string} name
   * @return {*}
   */
  get(name){
    return this.cron[name]
  }
  /**
   * Return all cron entries
   * @returns {{}|*}
   */
  all(){
    return this.cron
  }
  /**
   * Count current cron jobs
   * @return {Number}
   */
  count(){
    return Object.keys(this.cron).length
  }
  /**
   * Stop all cron jobs
   */
  start(){
    let cron = this.cron
    let startCount = 0
    Object.keys(cron).map((cronName)=>{
      cron[cronName].start()
      startCount++
    })
    return startCount
  }
  /**
   * Stop all cron jobs
   */
  stop(){
    let cron = this.cron
    let stopCount = 0
    Object.keys(cron).map((cronName)=>{
      cron[cronName].stop()
      stopCount++
    })
    return stopCount
  }
  /**
   * Destroy all cron jobs
   * @returns {boolean}
   */
  destroy(){
    let cron = this.cron
    let deleteCount = 0
    Object.keys(cron).map((cronName)=>{
      cron[cronName].stop()
      delete cron[cronName]
      deleteCount++
    })
    return deleteCount
  }
}
