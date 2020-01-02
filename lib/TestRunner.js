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

class TestReporter {
  static color(str,color,nextColor){
    return `\x1b[0;${color}m${str}` +
      (nextColor ? `\x1b[;${nextColor}m` : '\x1b[0m')
  }
  static printRunnerTitle(name,options){
    const title = TestReporter.color(`${name} Tests`,36)
    let optTitle = ''
    if(options && Object.keys(options).length){
      for(const key in options){
        if(!options.hasOwnProperty(key)) continue
        if(options[key] === null) continue
        optTitle += ` option ${key}: ${options[key]}`
      }
    }
    let rv = title
    if(optTitle) rv += ' with' + optTitle
    console.log(rv)
  }
  static allFinished(duration,suiteCount,testsPassing,testsFailing){
    let flag = TestReporter.color('o',32)
    testsPassing = TestReporter.color(testsPassing,32)
    if(testsFailing > 0){
      testsFailing = TestReporter.color(testsFailing,31)
      flag = TestReporter.color('~',33)
    }
    if(testsPassing === 0) flag = TestReporter.color('x',31)
    console.log(`${flag} - Tested ${suiteCount} suite(s) ` +
      `with ${testsPassing} passing and ${testsFailing} failed (${duration}ms)`)
  }
  constructor(name){
    this.name = name || 'Test'
  }
  printTitle(suite){
    let wsp = ' '
    for(let i = 0; i < suite.level; i++){ wsp += ' ' }
    console.log(TestReporter.color(`${wsp}${suite.name}`,35))
  }
  testComplete(test,noun,extra){
    let failed = noun === 'failed'
    let flag = failed ? 'x': 'o'
    let flagColor = failed ? 31 : 32
    let nextColor = failed ? 37 : null
    flag = TestReporter.color(flag,flagColor,nextColor)
    if(failed) extra = TestReporter.color(extra,flagColor)
    let duration = test.duration
    if(duration > 1000) duration = TestReporter.color(duration,31)
    let wsp = '  '
    for(let i = 0; i < test.level; i++){ wsp += ' ' }
    console.log(`${wsp}${flag} - ${test.testName} ${noun} ` +
      `(${duration}ms) ${extra}`)
  }
  suiteComplete(suite){
    let flag = TestReporter.color('o',32)
    if(suite.testsFailing > 0) flag = TestReporter.color('~',33)
    if(suite.testsPassing === 0) flag = TestReporter.color('x',31)
    let wsp = ' '
    for(let i = 0; i < suite.level; i++){ wsp += ' ' }
    console.log(`${wsp}${flag} - ${suite.name} (${suite.duration}ms)`)
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
    this._before = {}
    this._beforeEach = {}
    this._afterEach = {}
    this._after = {}
    this.duration =  null
    this.name = name
    this.ONLY = 'ONLY'
    this._only = null
    this.level = 0
    this.reporter = reporter || new TestReporter(name)
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
  suite(name){
    if(!name) throw new Error('No name defined for suite')
    const suite = new TestSuite(name)
    this.suites[name] = suite
    return suite
  }
  it(name,test,flags){
    if(this.ONLY === flags){
      //mark this test only somehow
      this._only = name
    }
    this.tests[name] = test
    return name
  }
  executeSuite(suiteKeys,runner,testResult,options){
    if(!suiteKeys || !suiteKeys.length) return Promise.resolve()
    const key = suiteKeys.shift()
    const suite = this.suites[key]
    suite.level = this.level + 1
    return Promise.resolve()
      .then(()=>{
        return suite.execute(runner,testResult,options)
      })
      .then((result)=>{
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
    if(typeof test === 'function'){
      try {
        return Promise.resolve().then(() => {
          return TestSuite.executeHook(
            Object.keys(this._beforeEach),
            this._beforeEach
          )
        })
          .then(() => {
            return runner(key,test)
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
            if(result.passed) this.testsPassing += 1
            if(result.failed) this.testsFailing += 1
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
        console.log(e)
      }
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
        return test()
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
    let noun = 'pass'
    if(result.failed){
      noun = 'failed'
      extra = ` error: ${result.errorMessage}`
    }
    if(reporter && reporter.testComplete){
      reporter.testComplete(result,noun,extra)
    }
    return result
  }
  static getInstance(name){ return new TestRunner(name) }
  constructor(name){
    this.name = name || 'Test'
    this.reporter = new TestReporter(this.name)
    this._before = {}
    this._after = {}
    this.suites = {}
    this._only = null
    this.ONLY = 'ONLY'
    this.options = {
      focus: null,
      only: null,
      suite: null
    }
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
  suite(name){
    if(!name) throw new Error('No name defined for suite')
    const suite = new TestSuite(name)
    this.suites[name] = suite
    return suite
  }
  test(name,test,flags){
    if(!name) throw new Error('No name defined for test')
    if(flags === this.ONLY){
      this._only = name
    }
    this.tests[name] = {
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
        if(result.passed) this.testsPassing += 1
        if(result.failed) this.testsFailing += 1
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
        let suiteCount = 0
        let testCount = 0
        let testsPassing = this.testsPassing || 0
        let testsFailing = this.testsFailing || 0
        for(const suiteKey in this.suites){
          if(!this.suites.hasOwnProperty(suiteKey)) continue
          const suite = this.suites[suiteKey]
          suiteCount = suiteCount + 1
          testCount = testCount + Object.keys(suite.tests).length
          testsPassing = testsPassing + suite.testsPassing
          testsFailing = testsFailing + suite.testsFailing
          duration = duration + suite.duration
        }
        TestReporter.allFinished(duration,suiteCount,testsPassing,testsFailing)
        return testsFailing
      })
  }
}

TestRunner.TestReporter = TestReporter
TestRunner.TestSuite = TestSuite
module.exports = TestRunner
