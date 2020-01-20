# Cron
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Cron = require('kado/lib/Cron')
```
This library will introduce scheduled Cron support that mimics the UNIX
cron support commonly found in operating systems.

There is a nice enhancement with this library that will increase the resolution
of the execution to second level. This is done by taking 6 arguments instead of
5. When 5 arguments are provided like traditional Cron the system will
substitute 0 for the first argument to mimic UNIX cron behavior.

## Class: CronJob

### CronJob.constructor(options)
* `options` {object} containing options to define the cron runner.

Available options
* `executeInitial` {boolean} when `true` crons will execute when added.
* `schedule` {string} cron configuration string such as `0 * * * *` for a
cron job that execute every minute.

### CronJob.setName(name)
* `name` {string} Name of the cron job
Return {object} instance of CronJob

### CronJob.setSchedule(schedule)
* `schedule` {string} new schedule to set on the cron job
Return {object} instance of CronJob

### CronJob.addHandler(fn)
* `fn` {function} that returns an option {Promise} to execute on schedule.
Return {object} instance of CronJob

### CronJob.getHandler(name)
* `name` {string} key of the handler to return
Return {function} requested handler function or undefined

### CronJob.removeHandler(name)
* `name` {string} key of the handler to remove
* Return {string} name of the handler removed

### CronJob.isExecutableSecond(sec, against)
* `sec` {number} our schedule second
* `against` {Date} to validate against
Return {boolean} `true` when second matches against date.

Note: Always returns true when set to `*`

### CronJob.isExecutableMinute(min, against)
* `min` {number} our schedule minute
* `against` {Date} to validate against
Return {boolean} `true` when minute matches against date.

Note: Always returns true when set to `*`

### CronJob.isExecutableHour(hour, against)
* `hour` {number} our schedule hour
* `against` {Date} to validate against
Return {boolean} `true` when hour matches against date.

Note: Always returns true when set to `*`

### CronJob.isExecutableMonthDay(monthDay, against)
* `monthDay` {number} our schedule monthDay
* `against` {Date} to validate against
Return {boolean} `true` when monthDay matches against date.

Note: Always returns true when set to `*`

### CronJob.isExecutableMonth(month, against)
* `month` {number} our schedule month
* `against` {Date} to validate against
Return {boolean} `true` when month matches against date.

Note: Always returns true when set to `*`

### CronJob.isExecutableWeekDay(weekDay, against)
* `weekDay` {number} our schedule weekDay
* `against` {Date} to validate against
Return {boolean} `true` when weekDay matches against date.

Note: Always returns true when set to `*`

### CronJob.isExecutable(against)
* `against` {date} the date to test against
* Return {boolean} `true` when the job has a valid schedule and is available to
run.

Confirm the job is safe for execution based on currency and schedule.

### CronJob.testSchedule(againstDate)
* `againstDate` {date} to test if the cron will run against
* Return {boolean} `true` when the cron is valid, ready to run and tests okay
against the current time slot.

### CronJob.executeHandler(handlerKeys, handlers, now)
* `handlerKeys` {array} of handlers to be ran
* `handlers` {object} of handlers to be ran
* `now` {date} date to run the handlers with
* Return {Promise} resolved when the handlers are complete.

### CronJob.execute(now)
* `now` {date} current date to try and execute against
* Return {Promise} that will resolve when all handlers are complete.

## Class: Cron

### static Cron.getInstance()
* Return {Cron} new instance of the cron system

### static Cron.newJob(options)
* Return {CronJob} a new cron job using provided `options`

### Cron.constructor()
* Return {Cron} new cron instance

### Cron.add(name, cronJob)
* `name` {string} name of the cron job
* `cronJob` {CronJob} instance of the CronJob to use
Return {CronJob} newly added cron job instance

### Cron.remove(name)
* `name` {string} name of the cron job to remove
* Return {string} name of the cron job removed

### Cron.removeAll()
* Return {number} of cron jobs removed

### Cron.get(name)
* `name` {string} name of the cron job to get

### Cron.count()
* Return {number} of registered cron jobs

### Cron.all()
* Return {object} store of the cron jobs

### Cron.handleInterval()
* Return {Promise} that resolves when all jobs have been tested and executed.

### Cron.start()
* Return {Timeout} new interval to check cron loop.

### Cron.stop()
* Return {boolean} `true` when the cron interval has been cleared and the loop
stopped.
