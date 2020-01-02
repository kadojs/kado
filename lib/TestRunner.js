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

class TestColor {
  static runnerTitle(){ return 36 } //blue
  static suiteTitle(){ return 35 } //magenta
  static error(){ return 31 } //red
  static warn(){ return 33 } //yellow
  static ok(){ return 32 } //green
  static info(){ return 90 } //gray
  static default(){ return 0 } //default term color
}

class TestReporter {
  static color(str,color,nextColor){
    return `\x1b[0;${color}m${str}` +
      (nextColor ? `\x1b[;${nextColor}m` : '\x1b[0m')
  }
  static duration(duration){
    let msg = `(${duration}ms)`
    if(duration > 1000){
      msg = TestReporter.color(msg,TestColor.error())
    } else if (duration > 500){
      msg = TestReporter.color(msg,TestColor.warn())
    } else if (duration < 100){
      msg = TestReporter.color(msg,TestColor.info())
    }
    return msg
  }
  static printRunnerTitle(name,options){
    const title = TestReporter.color(`${name} Tests`,TestColor.runnerTitle())
    let indent = ''
    let optTitle = ''
    if(options && Object.keys(options).length){
      for(const key in options){
        if(!options.hasOwnProperty(key)) continue
        if('indent' === key){
          indent = options.indent
          continue
        }
        if(null === options[key]) continue
        optTitle += ` option ${key}: ${options[key]}`
      }
    }
    let rv = indent + title
    if(optTitle) rv += ' with' + optTitle
    console.log(rv)
  }
  static allFinished(duration,suiteCount,testsPassing,testsFailing,indent){
    let flag = TestReporter.color('o',TestColor.ok())
    testsPassing = TestReporter.color(testsPassing,TestColor.ok())
    if(testsFailing > 0){
      testsFailing = TestReporter.color(testsFailing,TestColor.error())
      flag = TestReporter.color('~',TestColor.warn())
    }
    if(testsPassing === 0) flag = TestReporter.color('x',TestColor.error())
    duration = TestReporter.duration(duration)
    console.log(indent + `${flag} - Tested ${suiteCount.primary} suite(s) ` +
      `${suiteCount.sub} sub suite(s) with ${testsPassing} passing tests ` +
      `and ${testsFailing} failing ${duration}`)
  }
  static failedTests(failed,indent){
    for(const [i, test] of failed.entries()){
      console.log()
      console.log(indent + TestReporter.color(
        `${i+1}) ${test.testPath}->${test.testName}`,
        TestColor.error()
      ))
      console.log(indent + test.error)
    }
  }
  constructor(name,indent){
    this.name = name || 'Test'
    this.indent = indent || ''
    this.out = (msg) => console.log(this.indent + msg)
  }
  printTitle(suite){
    let wsp = ' '
    for(let i = 0; i < suite.level; i++){ wsp += ' ' }
    this.out(
      TestReporter.color(`${wsp}${suite.name}`,TestColor.suiteTitle())
    )
  }
  testComplete(test,noun,extra){
    let failed = noun === 'failed'
    let flag = failed ? 'x': 'o'
    let flagColor = failed ? TestColor.error() : TestColor.ok()
    let nextColor = failed ? TestColor.default() : null
    flag = TestReporter.color(flag,flagColor,nextColor)
    if(failed) extra = TestReporter.color(extra,flagColor)
    let duration = TestReporter.duration(test.duration)
    if(noun) duration = ' ' + duration
    let wsp = '  '
    for(let i = 0; i < test.level; i++){ wsp += ' ' }
    this.out(`${wsp}${flag} - ${test.testName} ${noun}${duration}${extra}`)
  }
  suiteComplete(suite){
    let flag = TestReporter.color('o',TestColor.ok())
    let testsPassing = suite.testsPassing
    testsPassing = TestReporter.color(testsPassing,TestColor.ok())
    let testsFailing = TestReporter.color(0,TestColor.ok())
    if(suite.testsFailing > 0){
      testsFailing = TestReporter.color(suite.testsFailing,TestColor.error())
      flag = TestReporter.color('~',TestColor.warn())
    }
    if(suite.testsPassing === 0){
      flag = TestReporter.color('x',TestColor.error())
    }
    let duration = TestReporter.duration(suite.duration)
    let wsp = ' '
    for(let i = 0; i < suite.level; i++){ wsp += ' ' }
    this.out(`${wsp}${flag} - ${suite.name} ` +
      `with ${testsPassing} passing and ${testsFailing} failed ${duration}`)
  }
}

class TestSuite {
  static executeHook(hookKeys,hookObj){
    if(!(hookKeys instanceof Array && hookKeys.length && hookObj)){
      return Promise.resolve()
    }
    const key = hookKeys.shift()
    const hook = hookObj[key]
    if(key && hookKeys.length === 0){
      return Promise.resolve().then(()=>{
        if(typeof hook === 'function'){
          return hook()
        }
      })
    } else {
      return Promise.resolve().then(()=> {
        return typeof hook === 'function' ? hook() : null
      })
        .then(()=>{ return TestSuite.executeHook(hookKeys,hookObj) })
    }
  }
  constructor(name,reporter){
    this._after = {}
    this._afterEach = {}
    this._before = {}
    this._beforeEach = {}
    this._only = null
    this.duration =  null
    this.failed = []
    this.level = 0
    this.name = name
    this.ONLY = 'ONLY'
    this.path = this.name
    this.reporter = reporter || new TestReporter(name)
    this.suiteCount = 0
    this.suites = {}
    this.testsPassing = 0
    this.testsFailing = 0
    this.tests = {}
  }
  before(fn){
    this._before[Object.keys(this._before).length] = fn
  }
  beforeEach(fn){
    this._beforeEach[Object.keys(this._beforeEach).length] = fn
  }
  afterEach(fn){
    this._afterEach[Object.keys(this._afterEach).length] = fn
  }
  after(fn){
    this._after[Object.keys(this._after).length] = fn
  }
  suite(name,suiteWrapper){
    if(!name) throw new Error('No name defined for suite')
    const suite = new TestSuite(name,this.reporter)
    this.suites[name] = suite
    if(typeof suiteWrapper === 'function'){
      suiteWrapper(suite.it.bind(suite),suite)
    }
    return suite
  }
  it(name,test,flags){
    if(this.ONLY === flags) this._only = name
    this.tests[Object.keys(this.tests).length] = {
      name: name,
      test: test
    }
    return name
  }
  executeSuite(suiteKeys,runner,testResult,options){
    if(!suiteKeys || !suiteKeys.length) return Promise.resolve()
    const key = suiteKeys.shift()
    const suite = this.suites[key]
    suite.level = this.level + 1
    suite.path = `${this.path}->${suite.path}`
    return Promise.resolve()
      .then(()=>{
        return suite.execute(runner,testResult,options)
      })
      .then((result)=>{
        this.testsPassing += suite.testsPassing
        this.testsFailing += suite.testsFailing
        this.suiteCount += suite.suiteCount
        this.failed = this.failed.concat(suite.failed)
        if(key && suiteKeys.length === 0){
          return result
        } else {
          return this.executeSuite(suiteKeys,runner,testResult,options)
        }
      })
  }
  executeTest(testKeys,runner,testResult){
    const key = testKeys.shift()
    const test = this.tests[key]
    try {
      return Promise.resolve().then(() => {
        return TestSuite.executeHook(
          Object.keys(this._beforeEach),
          this._beforeEach
        )
      })
        .then(() => {
          if(typeof test.test === 'function'){
            return runner(test.name,test.test)
          }
        })
        .then((result) => {
          return TestSuite.executeHook(
            Object.keys(this._afterEach),
            this._afterEach
          ).then(() => {
            return result
          })
        })
        .then((result) =>{
          result.testName = test.name
          result.testPath = this.path
          if(result.passed) this.testsPassing += 1
          if(result.failed){
            this.testsFailing += 1
            this.failed.push(result)
          }
          result.level = this.level
          return testResult(result,this.reporter)
        })
        .then((result) =>{
          if(key && testKeys.length === 0){
            return result
          } else {
            return this.executeTest(testKeys,runner,testResult)
          }
        })
    } catch(e){
      this.testsFailing += 1
      this.out(e)
    }
  }
  execute(runner,testResult,options){
    if(!options) options = {}
    this.reporter.printTitle(this)
    this.start = new Date()
    let suiteKeys = Object.keys(this.suites)
    let testKeys = Object.keys(this.tests)
    if(options.only){
      testKeys = testKeys.filter((v) => { return v === options.only })
    }
    if(options.focus){
      testKeys = testKeys.filter((v) => { return v.match(options.focus) })
    }
    this.suiteCount = suiteKeys.length
    return Promise.resolve()
      .then(()=>{
        return TestSuite.executeHook(Object.keys(this._before),this._before)
      })
      .then(()=>{ return this.executeTest(testKeys,runner,testResult) })
      .then(()=>{
        return this.executeSuite(suiteKeys,runner,testResult,options)
      })
      .then(()=>{
        return TestSuite.executeHook(Object.keys(this._after),this._after)
      })
      .then(()=>{
        this.finished = new Date()
        this.duration = (+this.finished) - (+this.start)
        this.reporter.suiteComplete(this)
      })
  }
}

class TestRunner {
  static runTest(name,test){
    return Promise.resolve()
      .then(()=>{
        test.start = new Date()
        test.testName = name
        return new Promise((resolve,reject)=> {
          test.timeout = (timeoutMs) => {
            setTimeout(
              () => { reject(new Error(`Exceeded timeout of ${timeoutMs}ms`)) },
              timeoutMs
            )
          }
          const rv = test.call(test)
          if(rv instanceof Promise) rv.then(resolve).catch(reject)
          else if(false === rv) reject('test returned false')
          else resolve()
        })
      })
      .then((result)=> {
        test.passed = true
        if(result === false){
          test.passed = false
          test.failed = true
          test.errorMessage = `test returned false`
          test.error = new Error(test.errorMessage)
        }
        test.finished = new Date()
        test.duration = (+test.finished) - (+test.start)
        return test
      })
      .catch((e)=>{
        test.finished = new Date()
        test.duration = (+test.finished) - (+test.start)
        test.failed = true
        test.error = e
        test.errorMessage = e.message
        return test
      })
  }
  static testResult(result,reporter){
    let extra = ''
    let noun = ''
    if(result.failed){
      noun = 'failed'
      extra = ` error: ${result.errorMessage}`
    }
    if(reporter && reporter.testComplete){
      reporter.testComplete(result,noun,extra)
    }
    return result
  }
  static getInstance(name,indent){
    if(!TestRunner.instances[name]){
      TestRunner.instances[name] = new TestRunner(name,indent)
    }
    return TestRunner.instances[name]
  }
  constructor(name,indent){
    this._before = {}
    this._after = {}
    this._only = null
    this.failed = []
    this.name = name || 'Test'
    this.ONLY = 'ONLY'
    this.options = {
      focus: null,
      indent: indent || '',
      hideFailed: null,
      only: null,
      suite: null
    }
    this.reporter = new TestReporter(this.name,this.options.indent)
    this.suiteCount = {
      primary: 0,
      sub: 0
    }
    this.suites = {}
    this.tests = {}
    this.testsFailing = 0
    this.testsPassing = 0
  }
  setName(name){
    this.name = name
  }
  before(fn){
    this._before[Object.keys(this._before).length] = fn
  }
  after(fn){
    this._after[Object.keys(this._after).length] = fn
  }
  suite(name,suiteWrapper){
    if(!name) throw new Error('No name defined for suite')
    const suite = new TestSuite(name,this.reporter)
    this.suites[name] = suite
    if(typeof suiteWrapper === 'function'){
      suiteWrapper(suite.it.bind(suite),suite)
    }
    return suite
  }
  test(name,test,flags){
    if(!name) throw new Error('No name defined for test')
    if(flags === this.ONLY) this._only = name
    this.tests[Object.keys(this.tests).length] = {
      duration: null,
      name: name,
      passed: false,
      processed: false,
      test: test
    }
  }
  executeSuite(suiteKeys,options){
    if(!suiteKeys || !suiteKeys.length) return Promise.resolve()
    const key = suiteKeys.shift()
    const suite = this.suites[key]
    return Promise.resolve()
      .then(()=>{
        return suite.execute(TestRunner.runTest,TestRunner.testResult,options)
      })
      .then((result)=>{
        this.suiteCount.sub += suite.suiteCount
        this.failed = this.failed.concat(suite.failed)
        if(key && suiteKeys.length === 0){
          return result
        } else {
          return this.executeSuite(suiteKeys,options)
        }
      })
  }
  executeTest(testKeys){
    if(!testKeys || !testKeys.length) return Promise.resolve()
    const key = testKeys.shift()
    const test = this.tests[key]
    return TestRunner.runTest(test.name,test.test)
      .then((result)=>{
        result.testName = key
        result.testPath = '(base)'
        if(result.passed) this.testsPassing += 1
        if(result.failed){
          this.testsFailing += 1
          this.failed.push(result)
        }
        return TestRunner.testResult(result,this.reporter)
      })
      .then((result)=>{
        if(key && testKeys.length === 0){
          return result
        } else {
          return this.executeTest(testKeys)
        }
      })
  }
  execute(options){
    if(!options) options = {}
    let suiteKeys = Object.keys(this.suites)
    let testKeys = Object.keys(this.tests)
    for(const key of suiteKeys){
      if(this.suites[key]._only) this._only = this.suites[key]._only
    }
    if(options.focus) this.options.focus = options.focus
    this.options.indent = options.indent || ''
    if(options.hideFailed) this.options.hideFailed = options.hideFailed
    if(options.only) this.options.only = options.only
    if(this._only){
      this.options.only = this._only
      this.options.focus = null
      this.options.suite = null
    }
    if(options.suite) this.options.suite = options.suite
    TestReporter.printRunnerTitle(this.name,this.options)
    if(this.options.focus){
      testKeys = testKeys.filter((v) => { return v.match(this.options.focus) })
    }
    if(this.options.only){
      testKeys = testKeys.filter((v) => { return v === this.options.only })
      //so if we have a match locally dont search the suites, zero em
      if(testKeys.length > 0) suiteKeys = []
    }
    if(this.options.suite){
      testKeys = []
      suiteKeys = suiteKeys.filter((v) => { return v === this.options.suite })
    }
    return Promise.resolve().then(()=> {
      return TestSuite.executeHook(Object.keys(this._before),this._before)
    })
      .then(()=>{ return this.executeTest(testKeys) })
      .then(()=>{ return this.executeSuite(suiteKeys,this.options) })
      .then(()=> {
        return TestSuite.executeHook(Object.keys(this._after),this._after)
      })
      .then(()=>{
        let duration = 0
        let testCount = 0
        let testsPassing = this.testsPassing || 0
        let testsFailing = this.testsFailing || 0
        for(const suiteKey in this.suites){
          if(!this.suites.hasOwnProperty(suiteKey)) continue
          const suite = this.suites[suiteKey]
          this.suiteCount.primary += 1
          testCount = testCount + Object.keys(suite.tests).length
          testsPassing = testsPassing + suite.testsPassing
          testsFailing = testsFailing + suite.testsFailing
          duration = duration + suite.duration
        }
        let suiteCount = this.suiteCount
        TestReporter.allFinished(duration,suiteCount,testsPassing,testsFailing,this.options.indent)
        if(!this.options.hideFailed) TestReporter.failedTests(this.failed,this.options.indent)
        return testsFailing
      })
  }
}

TestRunner.instances = {}
TestRunner.TestColor = TestColor
TestRunner.TestReporter = TestReporter
TestRunner.TestSuite = TestSuite
module.exports = TestRunner
