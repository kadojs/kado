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

class CronJob {
  constructor(options){
    if(!options) options = {}
    this.handler = {}
    this.name = 'Job'
    this.processing = null
    this.schedule = null
    if(options.schedule) this.schedule = options.schedule
  }
  setName(name){
    this.name = name
    return this
  }
  setSchedule(schedule){
    this.schedule = schedule
    return this
  }
  addHandler(name,fn){
    this.handler[name] = fn
    return this
  }
  getHandler(name){
    return this.handler[name]
  }
  removeHandler(name){
    delete this.handler[name]
    return name
  }
  testSchedule(againstDate){
    //do the actual cron processing here
    return false
  }
  executeHandler(handlerKeys,handlers){
    const key = handlerKeys.shift()
    if(key && handlerKeys.length === 0){
      return handlers[key]()
    } else {
      return Promise.resolve()
        .then(()=>{ return handlers[key]() })
        .then(()=>{ return this.executeHandler(handlerKeys,handlers) })
    }
  }
  execute(now){
    if(this.processing === true){
      console.log(
        `Skipping ${this.name} at ${now}, processing jobs still active.`
      )
      return false
    } else {
      const handlerKeys = Object.keys(this.handler)
      this.processing = true
      return Promise.resolve()
        .then(()=>{ return this.executeHandler(handlerKeys,this.handler)})
        .then(()=>{ this.processing = false })
    }
  }
}

module.exports = class Cron {
  static getInstance(){ return new Cron() }
  static newJob(options){ return new CronJob(options) }
  constructor(){
    this.cron = {}
    this.frequency = 500
    this.interval = null
  }
  add(name,cronJob){
    cronJob.setName(name)
    this.cron[name] = cronJob
    return this.cron[name]
  }
  remove(name){
    delete this.cron[name]
    return name
  }
  removeAll(){
    let deleteCount = 0
    for(const key in this.cron){
      if(!this.cron.hasOwnProperty(key)) continue
      delete this.cron[key]
      deleteCount++
    }
    return deleteCount
  }
  get(name){
    return this.cron[name]
  }
  count(){
    return Object.keys(this.cron).length
  }
  all(){
    return this.cron
  }
  handleInterval(){
    const now = new Date()
    const promises = []
    for(const key in this.cron){
      if(!this.cron.hasOwnProperty(key)) continue
      const cron = this.cron[key]
      if(cron.testSchedule(now)) promises.push(this.cron.execute(now))
    }
    return Promise.all(promises)
  }
  start(){
    this.interval = setInterval(this.handleInterval.bind(this),this.frequency)
    return this.interval
  }
  stop(){
    clearInterval(this.interval)
    this.interval = null
    return true
  }
}
