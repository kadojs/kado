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

class TestReporter {
  constructor (name, options) {
    if (!options) options = {}
    this.name = name || 'Test'
    this.options = {
      indent: options.indent || ''
    }
    this.level = 0
  }

  out (msg, indentLevel) {
    if (indentLevel === undefined) indentLevel = this.level || 0
    let wsp = ''
    for (let i = 0; i < indentLevel; i++) { wsp += ' ' }
    if (msg instanceof Error) return console.log(msg)
    if (msg === undefined || msg === null || msg === false) msg = ''
    msg = ('' + msg).split('\n').map(v => {
      return `${this.options.indent}${wsp}${v}`
    }).join('\n')
    return console.log(msg)
  }

  color (str, color, nextColor) {
    return `\x1b[0;${color}m${str}` +
      (nextColor ? `\x1b[;${nextColor}m` : '\x1b[0m')
  }

  colorRunner () { return 36 } // blue
  colorSuite () { return 35 } // magenta
  colorError () { return 31 } // red
  colorWarn () { return 33 } // yellow
  colorOk () { return 32 } // green
  colorPending () { return 96 } // bright cyan
  colorInfo () { return 90 } // gray
  colorDefault () { return 0 } // default term color
  duration (duration) {
    let msg = `(${duration}ms)`
    if (duration > 1000) {
      msg = this.color(msg, this.colorError())
    } else if (duration > 500) {
      msg = this.color(msg, this.colorWarn())
    } else if (duration < 100) {
      msg = this.color(msg, this.colorInfo())
    }
    return msg
  }

  printTitle (suite) {
    this.out(this.color(`${suite.name}`, this.colorSuite()), suite.level)
  }

  testComplete (test, verb, extra) {
    const failed = verb === 'failed'
    let flag = failed ? 'x' : 'o'
    const pendColor = this.colorPending()
    const flagColor = failed ? this.colorError() : this.colorOk()
    const nextColor = failed ? this.colorDefault() : null
    flag = this.color(flag, flagColor, nextColor)
    if (failed) extra = this.color(extra, flagColor)
    let duration = this.duration(test.duration)
    if (verb) duration = ' ' + duration
    if (test.pending === true) {
      flag = this.color('-', pendColor)
      test.testName = this.color(test.testName, pendColor)
      duration = ''
    }
    this.out(`${flag} ${test.testName} ${verb}${duration}${extra}`, test.level)
  }

  suiteComplete (suite) {
    const cok = this.colorOk()
    const cwarn = this.colorWarn()
    const cerr = this.colorError()
    const cpend = this.colorPending()
    let flag = this.color('o', cok)
    let testsPassing = suite.testsPassing - suite.testsPending
    testsPassing = this.color(testsPassing, cok)
    let testsFailing = this.color(0, cok)
    if (suite.testsFailing > 0) {
      testsFailing = this.color(suite.testsFailing, cerr)
      flag = this.color('~', cwarn)
    }
    if (suite.testsPassing === 0 && suite.testsFailing > 0) {
      flag = this.color('x', cerr)
    }
    const duration = this.duration(suite.duration)
    let pending = ''
    if (suite.testsPending > 0) {
      pending = ` ${this.color(suite.testsPending, cpend)} pending`
    }
    this.out(`${flag} ${suite.name} with ${testsPassing} passing ` +
      `and ${testsFailing} failed ${duration}${pending}`, suite.level)
  }

  printRunnerTitle (name, options) {
    let title = this.color(`${name} Tests`, this.colorRunner())
    let optTitle = ''
    if (options && Object.keys(options).length) {
      for (const key in options) {
        if (!Object.prototype.hasOwnProperty.call(options, key)) continue
        if (options[key] === null) continue
        optTitle += ` option ${key}: ${options[key]}`
      }
    }
    if (optTitle) title += ' with' + optTitle
    this.out(title)
  }

  allFinished (duration, suiteCount, testsPassing, testsFailing, testsPending) {
    const cok = this.colorOk()
    const cwarn = this.colorWarn()
    const cerr = this.colorError()
    const cpend = this.colorPending()
    let flag = this.color('o', cok)
    testsPassing -= testsPending
    testsPassing = this.color(testsPassing, cok)
    if (testsFailing > 0) {
      testsFailing = this.color(testsFailing, cerr)
      flag = this.color('~', cwarn)
    }
    if (testsPassing === 0) flag = this.color('x', cerr)
    duration = this.duration(duration)
    let pending = ''
    if (testsPending > 0) {
      pending = ` ${this.color(testsPending, cpend)} pending`
    }
    this.out(`${flag} Tested ${suiteCount.primary} suite(s) ` +
      `${suiteCount.sub} sub suite(s) with ${testsPassing} passing tests ` +
      `and ${testsFailing} failing ${duration}${pending}`)
  }

  failedTests (failed) {
    const cerr = this.colorError()
    for (const [i, test] of failed.entries()) {
      this.out()
      this.out(this.color(
        `${i + 1}) ${test.testPath}->${test.testName}`,
        cerr
      ))
      this.out(test.error)
    }
  }
}

class TestSuite {
  static executeHook (hookKeys, hookObj, reporter) {
    if (!(hookKeys instanceof Array && hookKeys.length && hookObj)) {
      return Promise.resolve()
    }
    if (!reporter) reporter = new TestReporter('Hook')
    const key = hookKeys.shift()
    const hook = hookObj[key]
    const callHook = (hook) => {
      return typeof hook === 'function' ? hook(reporter) : null
    }
    if (key && hookKeys.length === 0) {
      return Promise.resolve().then(() => { return callHook(hook) })
    } else {
      return Promise.resolve().then(() => { return callHook(hook) })
        .then(() => { return TestSuite.executeHook(hookKeys, hookObj, reporter) })
    }
  }

  constructor (name) {
    this._after = {}
    this._afterEach = {}
    this._before = {}
    this._beforeEach = {}
    this._only = null
    this.duration = null
    this.failed = []
    this.level = 1
    this.name = name
    this.path = this.name
    this.reporter = new TestReporter(name)
    this.suiteCount = 0
    this.suites = {}
    this.testsPassing = 0
    this.testsPending = 0
    this.testsFailing = 0
    this.tests = {}
  }

  setReporter (reporter) {
    if (!reporter || typeof reporter !== 'object') return false
    this.reporter = reporter
    return this
  }

  before (fn) {
    this._before[Object.keys(this._before).length] = fn
    return this
  }

  beforeEach (fn) {
    this._beforeEach[Object.keys(this._beforeEach).length] = fn
    return this
  }

  afterEach (fn) {
    this._afterEach[Object.keys(this._afterEach).length] = fn
    return this
  }

  after (fn) {
    this._after[Object.keys(this._after).length] = fn
    return this
  }

  suite (name, suiteWrapper) {
    Assert.isOk(name, 'No name defined for suite')
    const suite = new TestSuite(name, this.reporter)
    this.suites[name] = suite
    if (typeof suiteWrapper === 'function') {
      suiteWrapper(suite.it.bind(suite), suite)
    }
    return suite
  }

  it (name, test, flags = {}) {
    if (flags.only === true) {
      this._only = { name: name, test: test, flags: flags }
    }
    this.tests[Object.keys(this.tests).length] = {
      name: name,
      pending: test === undefined,
      skip: flags.skip || false,
      test: test
    }
    return this
  }

  executeSuite (suiteKeys, runner, testResult, options) {
    if (!suiteKeys || !suiteKeys.length) return Promise.resolve()
    const key = suiteKeys.shift()
    const suite = this.suites[key]
    suite.level = this.level + 1
    suite.path = `${this.path}->${suite.path}`
    return Promise.resolve()
      .then(() => {
        return suite.execute(runner, testResult, options)
      })
      .then((result) => {
        this.testsPassing += suite.testsPassing
        this.testsPending += suite.testsPending
        this.testsFailing += suite.testsFailing
        this.suiteCount += suite.suiteCount
        this.failed = this.failed.concat(suite.failed)
        if (key && suiteKeys.length === 0) {
          return result
        } else {
          return this.executeSuite(suiteKeys, runner, testResult, options)
        }
      })
  }

  executeTest (testKeys, runner, testResult) {
    const key = testKeys.shift()
    const test = this.tests[key]
    // skip undefined tests altogether
    if (!test) return Promise.resolve()
    try {
      return Promise.resolve().then(() => {
        return TestSuite.executeHook(
          Object.keys(this._beforeEach),
          this._beforeEach,
          this.reporter
        )
      })
        .then(() => {
          return runner(test.name,
            test.test && !test.skip ? test.test : test.pending)
        })
        .then((result) => {
          return TestSuite.executeHook(
            Object.keys(this._afterEach),
            this._afterEach,
            this.reporter
          ).then(() => { return result })
        })
        .then((result) => {
          result.testName = test.name
          result.testPath = this.path
          if (result.pending) this.testsPending += 1
          if (result.passed) this.testsPassing += 1
          if (result.failed) {
            this.testsFailing += 1
            this.failed.push(result)
          }
          result.level = this.level + 1
          return testResult(result, this.reporter)
        })
        .then((result) => {
          if (key && testKeys.length === 0) {
            return result
          } else {
            return this.executeTest(testKeys, runner, testResult)
          }
        })
    } catch (e) {
      this.testsFailing += 1
      this.out(e)
    }
  }

  execute (runner, testResult, options) {
    if (!options) options = {}
    if (options.reporter) this.setReporter(options.reporter)
    this.start = new Date()
    const suiteKeys = Object.keys(this.suites)
    let testKeys = Object.keys(this.tests)
    if (options.only) {
      testKeys = testKeys.filter((v) => {
        const t = this.tests[v]
        return t.name === options.only
      })
    }
    if (options.focus) {
      testKeys = testKeys.filter((v) => { return v.match(options.focus) })
    }
    const hasTests = !!testKeys.length
    if (!options.only || (options.only && hasTests)) {
      this.reporter.printTitle(this)
    }
    this.suiteCount = suiteKeys.length
    return Promise.resolve()
      .then(() => {
        return TestSuite.executeHook(
          Object.keys(this._before),
          this._before,
          this.reporter
        )
      })
      .then(() => {
        if (!testKeys || !testKeys.length) return
        return this.executeTest(testKeys, runner, testResult)
      })
      .then(() => {
        if (!suiteKeys || !suiteKeys.length) return
        return this.executeSuite(suiteKeys, runner, testResult, options)
      })
      .then(() => {
        return TestSuite.executeHook(
          Object.keys(this._after),
          this._after,
          this.reporter
        )
      })
      .then(() => {
        this.finished = new Date()
        this.duration = (+this.finished) - (+this.start)
        if (!options.only || (options.only && hasTests)) {
          this.reporter.suiteComplete(this)
        }
      })
  }
}

class TestRunner {
  static runTest (name, test) {
    if (test === true || test === false || test === undefined || test.skip) {
      test = { pending: true }
    }
    return Promise.resolve()
      .then(() => {
        test.start = new Date()
        test.testName = name
        return new Promise((resolve, reject) => {
          test.timeout = (timeoutMs) => {
            setTimeout(
              () => { reject(new Error(`Exceeded timeout of ${timeoutMs}ms`)) },
              timeoutMs
            )
          }
          const rv = typeof test === 'function' ? test.call(test) : true
          if (rv instanceof Promise) rv.then(resolve).catch(reject)
          else if (rv === false) {
            reject(new Error(`test ${name} returned false`))
          } else resolve()
        })
      })
      .then((result) => {
        test.passed = true
        if (result === false) {
          test.passed = false
          test.failed = true
          test.errorMessage = 'test returned false'
          test.error = new Error(test.errorMessage)
        }
        test.finished = new Date()
        test.duration = (+test.finished) - (+test.start)
        return test
      })
      .catch((e) => {
        test.finished = new Date()
        test.duration = (+test.finished) - (+test.start)
        test.failed = true
        test.error = e
        test.errorMessage = e.message
        return test
      })
  }

  static testResult (result, reporter) {
    let extra = ''
    let noun = ''
    if (result.failed) {
      noun = 'failed'
      extra = ` error: ${result.errorMessage}`
    }
    result.level = (result.level || 1)
    if (reporter && reporter.testComplete) {
      reporter.testComplete(result, noun, extra)
    }
    return result
  }

  static getInstance (name) {
    if (!TestRunner.instances[name]) {
      TestRunner.instances[name] = new TestRunner(name)
    }
    return TestRunner.instances[name]
  }

  constructor (name) {
    this._before = {}
    this._after = {}
    this._only = null
    this.failed = []
    this.name = name || 'Test'
    this.options = {
      focus: null,
      indent: null,
      hideFailed: null,
      reporter: null,
      only: null,
      suite: null
    }
    this.reporter = new TestReporter(this.name, this.options.indent || '')
    this.suiteCount = {
      primary: 0,
      sub: 0
    }
    this.suites = {}
    this.tests = {}
    this.testsFailing = 0
    this.testsPassing = 0
  }

  setName (name) {
    this.name = name
    return this
  }

  setReporter (reporter) {
    this.reporter = reporter
    return this
  }

  before (fn) {
    this._before[Object.keys(this._before).length] = fn
    return this
  }

  after (fn) {
    this._after[Object.keys(this._after).length] = fn
    return this
  }

  suite (name, suiteWrapper) {
    Assert.isOk(name, 'No name defined for suite')
    const suite = new TestSuite(name, this.reporter)
    this.suites[name] = suite
    if (typeof suiteWrapper === 'function') {
      suiteWrapper(suite.it.bind(suite), suite)
    }
    return suite
  }

  test (name, test, flags = {}) {
    Assert.isOk(name, 'No name defined for test')
    if (flags.only === true) {
      this._only = { name: name, test: test, flags: flags }
    }
    this.tests[Object.keys(this.tests).length] = {
      duration: null,
      name: name,
      passed: false,
      processed: false,
      skip: flags.skip || false,
      test: test
    }
    return this
  }

  executeSuite (suiteKeys, options) {
    if (!suiteKeys || !suiteKeys.length) return Promise.resolve()
    const key = suiteKeys.shift()
    const suite = this.suites[key]
    return Promise.resolve()
      .then(() => {
        return suite.execute(TestRunner.runTest, TestRunner.testResult, options)
      })
      .then((result) => {
        this.suiteCount.sub += suite.suiteCount
        this.failed = this.failed.concat(suite.failed)
        if (key && suiteKeys.length === 0) {
          return result
        } else {
          return this.executeSuite(suiteKeys, options)
        }
      })
  }

  executeTest (testKeys) {
    if (!testKeys || !testKeys.length) return Promise.resolve()
    const key = testKeys.shift()
    const test = this.tests[key]
    return TestRunner.runTest(test.name, test.test)
      .then((result) => {
        result.testName = test.name
        result.testPath = '(base)'
        if (result.passed) this.testsPassing += 1
        if (result.failed) {
          this.testsFailing += 1
          this.failed.push(result)
        }
        return TestRunner.testResult(result, this.reporter)
      })
      .then((result) => {
        if (key && testKeys.length === 0) {
          return result
        } else {
          return this.executeTest(testKeys)
        }
      })
  }

  execute (options) {
    if (!options) options = {}
    let suiteKeys = Object.keys(this.suites)
    let testKeys = Object.keys(this.tests)
    for (const key of suiteKeys) {
      if (this.suites[key]._only) this._only = this.suites[key]._only
    }
    if (options.focus) this.options.focus = options.focus
    if (options.hideFailed) this.options.hideFailed = options.hideFailed
    if (options.only) this.options.only = options.only
    if (this._only) {
      this.options.only = this._only.name
      this.options.focus = null
      this.options.suite = null
    }
    if (options.reporter) this.options.reporter = options.reporter
    if (options.suite) this.options.suite = options.suite
    this.reporter.printRunnerTitle(this.name, this.options)
    if (this.options.focus) {
      testKeys = testKeys.filter((v) => {
        const t = this.tests[v]
        return t.name.match(this.options.focus)
      })
    }
    if (this.options.only) {
      testKeys = testKeys.filter((v) => {
        const t = this.tests[v]
        return t.name === this.options.only
      })
      // so if we have a match locally dont search the suites, zero em
      if (testKeys.length > 0) suiteKeys = []
    }
    if (this.options.suite) {
      testKeys = []
      suiteKeys = suiteKeys.filter((v) => { return v === this.options.suite })
    }
    // set reporter to options so it will propagate
    if (!this.options.reporter) this.options.reporter = this.reporter
    return Promise.resolve().then(() => {
      return TestSuite.executeHook(
        Object.keys(this._before),
        this._before,
        this.reporter
      )
    })
      .then(() => { return this.executeTest(testKeys) })
      .then(() => { return this.executeSuite(suiteKeys, this.options) })
      .then(() => {
        return TestSuite.executeHook(
          Object.keys(this._after),
          this._after,
          this.reporter
        )
      })
      .then(() => {
        let duration = 0
        let testCount = 0
        let testsPassing = this.testsPassing || 0
        let testsPending = this.testsPending || 0
        let testsFailing = this.testsFailing || 0
        for (const suiteKey in this.suites) {
          if (!Object.prototype.hasOwnProperty.call(this.suites, suiteKey)) {
            continue
          }
          const suite = this.suites[suiteKey]
          this.suiteCount.primary += 1
          testCount = testCount + Object.keys(suite.tests).length
          testsPassing = testsPassing + suite.testsPassing
          testsPending = testsPending + suite.testsPending
          testsFailing = testsFailing + suite.testsFailing
          duration = duration + suite.duration
        }
        const suiteCount = this.suiteCount
        this.reporter.allFinished(
          duration,
          suiteCount,
          testsPassing,
          testsFailing,
          testsPending
        )
        if (!this.options.hideFailed) this.reporter.failedTests(this.failed)
        return testsFailing
      })
  }
}

TestRunner.instances = {}
TestRunner.TestReporter = TestReporter
TestRunner.TestSuite = TestSuite
module.exports = TestRunner
