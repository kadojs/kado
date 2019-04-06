'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
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
