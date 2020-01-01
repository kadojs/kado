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
  static printRunnerTitle(name){
    console.log(TestReporter.color(`${name} Tests`,36))
  }
  static allFinished(duration,suiteCount,testsPassing,testsFailing){
    let flag = 'o'
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
  printTitle(){
    console.log(TestReporter.color(` ${this.name}`,35))
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
    console.log(`  ${flag} - ${test.testName} ${noun} ` +
      `(${duration}ms) ${extra}`)
  }
  suiteComplete(suite){
    let flag = 'o'
    if(suite.testsFailing > 0) flag = TestReporter.color('~',33)
    if(suite.testsPassing === 0) flag = TestReporter.color('x',31)
    console.log(` ${flag} - ${suite.name} (${suite.duration}ms)`)
  }
}

class TestSuite {
  static executeHook(hookKeys,hookObj){
    if(!(hookKeys instanceof Array && hookKeys.length && !hookObj)){
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
    this.reporter = reporter || new TestReporter(name)
    this.name = name
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
  it(name,test){
    this.tests[name] = test
    return name
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
  execute(runner,testResult){
    this.reporter.printTitle()
    this.start = new Date()
    const testKeys = Object.keys(this.tests)
    return Promise.resolve()
      .then(()=>{
        return TestSuite.executeHook(Object.keys(this._before),this._before)
      })
      .then(()=>{ return this.executeTest(testKeys,runner,testResult) })
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
  test(name,test){
    if(!name) throw new Error('No name defined for test')
    this.tests[name] = {
      duration: null,
      name: name,
      passed: false,
      processed: false,
      test: test
    }
  }
  executeSuite(suiteKeys){
    const key = suiteKeys.shift()
    const suite = this.suites[key]
    return Promise.resolve()
      .then(()=>{
        return suite.execute(TestRunner.runTest,TestRunner.testResult)
      })
      .then((result)=>{
        if(key && suiteKeys.length === 0){
          return result
        } else {
          return this.executeSuite(suiteKeys)
        }
      })
  }
  executeTest(testKeys){
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
  execute(){
    //if(!options) options = {}
    TestReporter.printRunnerTitle(this.name)
    const suiteKeys = Object.keys(this.suites)
    const testKeys = Object.keys(this.tests)
    return Promise.resolve().then(()=> {
      return TestSuite.executeHook(Object.keys(this._before),this._before)
    })
      .then(()=>{ return this.executeTest(testKeys) })
      .then(()=>{ return this.executeSuite(suiteKeys) })
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
      })
  }
}

TestRunner.TestReporter = TestReporter
TestRunner.TestSuite = TestSuite
module.exports = TestRunner
