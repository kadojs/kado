'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
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
const CronJob = require('cron').CronJob


/**
 * Event constructor
 * @constructor
 */
class Cron {
  constructor(K){
    this.K = K
    this.cron = {}
  }


  /**
   * Create a cron job
   * @param {name} name
   * @param {string} cronTime
   * @param {function} onTick
   * @param {object} opts
   *
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
    this.cron[name] = new CronJob(params)
    this.cron[name].start()
    return this.cron[name]
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
    Object.keys(cron).map((cronName)=>{
      cron[cronName].start()
    })
    return true
  }


  /**
   * Stop all cron jobs
   */
  stop(){
    let cron = this.cron
    Object.keys(cron).map((cronName)=>{
      cron[cronName].stop()
    })
    return true
  }


  /**
   * Destroy all cron jobs
   * @returns {boolean}
   */
  destroy(){
    let cron = this.cron
    Object.keys(cron).map((cronName)=>{
      cron[cronName].stop()
      delete cron[cronName]
    })
    return true
  }
}


/**
 * Export class
 * @type {Cron}
 */
module.exports = Cron
