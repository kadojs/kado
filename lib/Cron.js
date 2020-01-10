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

class CronJob {
  constructor (options) {
    if (!options) options = {}
    this.executeInitial = false
    this.handler = {}
    this.name = 'Job'
    this.processed = null
    this.processing = null
    this.schedule = null
    this.lastExecution = null
    if (options.executeInitial) this.executeInitial = options.executeInitial
    if (options.schedule) this.schedule = options.schedule
  }

  setName (name) {
    this.name = name
    return this
  }

  setSchedule (schedule) {
    this.schedule = schedule
    return this
  }

  addHandler (fn) {
    this.handler[Object.keys(this.handler).length] = fn
    return this
  }

  getHandler (name) {
    return this.handler[name]
  }

  removeHandler (name) {
    delete this.handler[name]
    return name
  }

  validateSecond (sec, against) {
    if (sec === '*') return true
    return sec === against.getSeconds()
  }

  validateMinute (min, against) {
    if (min === '*') return true
    return min === against.getMinutes()
  }

  validateHour (hour, against) {
    if (hour === '*') return true
    return hour === against.getHours()
  }

  validateMonthDay (monthDay, against) {
    if (monthDay === '*') return true
    return monthDay === against.getDate()
  }

  validateMonth (month, against) {
    if (month === '*') return true
    return month === against.getMonth()
  }

  validateWeekDay (weekDay, against) {
    if (weekDay === '*') return true
    return weekDay === against.getDay()
  }

  isRunnable (time, against) {
    return this.processed === null ||
      (time.sec !== '*' && +this.lastExecution + 1000 < +against) ||
      (time.min !== '*' && +this.lastExecution + 60000 < +against) ||
      (time.hour !== '*' && +this.lastExecution + 3600000 < +against) ||
      (time.monthDay !== '*' && +this.lastExecution + 2592000000 < +against) ||
      (time.month !== '*' && +this.lastExecution + 2592000000 < +against) ||
      (time.weekDay !== '*' && +this.lastExecution + 10080000 < +against)
  }

  isValid (valid, schedule, against) {
    return this.isRunnable(schedule, against) &&
      valid.sec &&
      valid.min &&
      valid.hour &&
      valid.monthDay &&
      valid.month &&
      valid.weekDay
  }

  testSchedule (againstDate) {
    // do the actual cron processing here
    const parts = this.schedule.split(' ')
    if (parts.length < 5) {
      throw new Error(`Invalid cron schedule for ${this.name}`)
    }
    if (parts.length === 5) parts.unshift('0')
    const schedule = {
      sec: parts[0] === '*' ? parts[0] : parseInt(parts[0], 10), // second
      min: parts[1] === '*' ? parts[1] : parseInt(parts[1], 10), // min
      hour: parts[2] === '*' ? parts[2] : parseInt(parts[2], 10), // hour
      monthDay: parts[3] === '*' ? parts[3] : parseInt(parts[3], 10), // day of month,
      month: parts[4] === '*' ? parts[4] : parseInt(parts[4], 10), // month,
      weekDay: parts[5] === '*' ? parts[5] : parseInt(parts[5], 10) // day of week
    }
    // first see if there has been a run of this cron
    if (!this.lastExecution) {
      // without knowing the last time the cron was ran we cannot check against
      // the last minute, so we just noop the cron and set the last execution,
      // the max delay this will cause is 60 seconds but typically less and only
      // applies to startup
      this.lastExecution = new Date()
      // depending on the setting of executeInitial it will change behavior
      return this.executeInitial
    }
    // now i think we validate each part and return a consensus
    const valid = {
      sec: this.validateSecond(schedule.sec, againstDate),
      min: this.validateMinute(schedule.min, againstDate),
      hour: this.validateHour(schedule.hour, againstDate),
      monthDay: this.validateMonthDay(schedule.monthDay, againstDate),
      month: this.validateMonth(schedule.month, againstDate),
      weekDay: this.validateWeekDay(schedule.weekDay, againstDate)
    }
    return this.isValid(valid, schedule, againstDate)
  }

  executeHandler (handlerKeys, handlers, now) {
    const key = handlerKeys.shift()
    const callHandler = (handler) => { return handler(now) }
    if (key && handlerKeys.length === 0) {
      return callHandler(handlers[key])
    } else {
      return Promise.resolve()
        .then(() => { return callHandler(handlers[key]) })
        .then(() => { return this.executeHandler(handlerKeys, handlers, now) })
    }
  }

  execute (now) {
    if (this.processing === true) {
      console.log(
        `Skipping ${this.name} at ${now}, processing jobs still active.`
      )
      return false
    } else {
      const handlerKeys = Object.keys(this.handler)
      this.processed = true
      this.processing = true
      this.lastExecution = new Date()
      return Promise.resolve()
        .then(() => {
          return this.executeHandler(handlerKeys, this.handler, now)
        })
        .then(() => { this.processing = false })
    }
  }
}

module.exports = class Cron {
  static getInstance () { return new Cron() }
  static newJob (options) { return new CronJob(options) }
  constructor () {
    this.cron = {}
    this.frequency = 500
    this.interval = null
  }

  add (name, cronJob) {
    cronJob.setName(name)
    this.cron[name] = cronJob
    return this.cron[name]
  }

  remove (name) {
    delete this.cron[name]
    return name
  }

  removeAll () {
    let deleteCount = 0
    for (const key in this.cron) {
      if (!Object.prototype.hasOwnProperty.call(this.cron, key)) continue
      delete this.cron[key]
      deleteCount++
    }
    return deleteCount
  }

  get (name) {
    return this.cron[name]
  }

  count () {
    return Object.keys(this.cron).length
  }

  all () {
    return this.cron
  }

  handleInterval () {
    const now = new Date()
    const promises = []
    for (const key in this.cron) {
      if (!Object.prototype.hasOwnProperty.call(this.cron, key)) continue
      const cron = this.cron[key]
      if (cron.testSchedule(now)) promises.push(cron.execute(now))
    }
    return Promise.all(promises)
  }

  start () {
    this.interval = setInterval(this.handleInterval.bind(this), this.frequency)
    return this.interval
  }

  stop () {
    clearInterval(this.interval)
    this.interval = null
    return true
  }
}
