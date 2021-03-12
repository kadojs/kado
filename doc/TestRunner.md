# TestRunner
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const TestRunner = require('kado/lib/TestRunner')
```
The `TestRunner` library provides a complete execution and reporting suite
suitable for testing any javascript function, library, or application.

## Features of `TestRunner`
* No dependencies
* Fast, fastest we've seen and we've used a bunch
* Less than 650 lines of ES6+ code
* Recursive, suites can be nested endlessly
* Implements BDD syntax
* Built-in reporter with cross platform compatible colors
* Compatible with any assertion library including the core
* Library only, executed by API
* Suites can be grouped at runtime, so nested suites can be ran individually

## Motivations
While in the process of writing clean ES6 code for our libraries and removing
dependencies we realized that our existing test framework was heavy and
contained over 100 dependencies. We could not understand the need for so much
code to do testing. We also wanted to reduce the time needed to invoke tests.
Our philosophy the faster the tests the more likely the developer is to use
them. Furthermore, asking the developer to depend on the tests by implementing
test driven development, the tests must then be of equal or greater performance
than production.

## Usage
The use pattern of `TestRunner` is a simplistic repetitive pattern. Here is an
example of the usage:
```js
const runner = require('kado/lib/TestRunner').getInstance('test')
const { expect } = require('kado/lib/Assert')
runner.suite('MySuite', (it) => {
  it.suite('SubSuite', (it) => {
    it('should pend this test')
    it('should pass this test', () => { return true })
    it('should fail this test', () => { return false })
    it('should pass an assert', () => { expect.eq(true) })
  })
})
const someOptions = {hideFailed: true}
runner.execute(someOptions)
```
Here the test runner can be seen getting setup. Then a primary suite `MySuite`
is created. Next, a subordinate suite is created by called `it.suite()` which
matches the original `runner.suite()` call. Tests are defined by calling
`it(testName,testFunction)` where the `testName` is a string defining the test
specification, `testFunction` is a function that returns `true` or `false` or a
Promise that resolves to `true` or `false`. Assertions are made during the test
by any outside library that throws errors.

## Class: TestReporter

### TestReporter.constructor(name, options)
* `name` {string} name of the test runner
* `options` {object} containing options for the reporter
* Return {TestReporter} instance for use with the runner

### TestReporter.out(msg, indentLevel)
* `msg` {string} to be printed
* `indentLevel` {number} of indentations to place before the `msg`
* Return {console.log} output of `console.log(msg)`

### TestReporter.color(str, color, nextColor)
* `str` {string} the string to be colored
* `color` {number} ANSI color code to use
* `nextColor` {number} ANSI color code to set after string, defaults to 0m
* Return {string} `str` wrapped with appropriate color codes safe for printing

### TestReporter.colorRunner()
* Return {number} color of test runner title

### TestReporter.colorSuite()
* Return {number} color of the suite title

### TestReporter.colorError()
* Return {number} color of the error status

### TestReporter.colorWarn()
* Return {number} color of the warn status

### TestReporter.colorOk()
* Return {number} color of the ok status

### TestReporter.colorPending()
* Return {number} color of the pending status

### TestReporter.colorInfo()
* Return {number} color of the info messages

### TestReporter.colorDefault()
* Return {number} default color code for the console usually 0

### TestReporter.duration(duration)
* `duration` {number} duration in milliseconds to be displayed
* Return {string} properly formatted and colored messaged based on `duration`

Rules for duration color:
* Above `1000ms` invoke `colorError()`
* Above `500ms` invoke `colorWarn()`
* Below `100ms` invoke `colorInfo()`

### TestReporter.printTitle(suite)
* `suite` {TestSuite} test suite to print the title from
* Return {void}

### TestReporter.testComplete(test, verb, extra)
* `test` {string} name of the test completed
* `verb` {string} verb used to identify the test outcome eg: 'failed' can be
blank which implies `ok`
* Return {void}

### TestReporter.suiteComplete(suite)
* `suite` {TestSuite} test suite to print completion of
* Return {void}

### TestReporter.printRunnerTitle(name, options)
* `name` {string} name of the test runner
* `options` {object} options passed at run time to the runner
* Return {void}

### TestReporter.allFinished(duration, suiteCount, testsPassing, testsFailing, testsPending)
* `duration` {number} in milliseconds how long total test execution took
* `suiteCount` {object} containing number of suites tested
* `testsPassing` {number} total tests passing
* `testsFailing` {number} total tests failing
* `testsPending` {number} total tests pending
* Return {void}

### TestReporter.failedTests(failed)
* `failed` {array} of failed tests
* Return {void}

## Class: TestSuite

### static TestSuite.executeHook(hookKeys, hookObj, reporter)
* `hookKeys` {Array} of hook keys to executed against `hookObj`
* `hookObj` {object} of hooks referenced by `hookKeys` to be executed
* `reporter` {TestReporter} instance of test reporter used to print the test
results.
* Return {Promise} that is resolved when all `hookKeys` have been executed
against `hookObj`

### TestSuite.constructor(name)
* `name` {name} of the test suite
* Return {TestSuite} new test suite instance

### TestSuite.setReporter(reporter)
* `reporter` {TestReporter} instance of test reporter to use for printing
* Return {TestSuite} current instance of the test suite

At instantiation time the runner will setup a default reporter, using this
method will customize that reporter.

### TestSuite.before(fn)
* `fn` {function} a hook function to be executed before the tests
* Return {TestSuite} current instance of the test suite

Note: this method can be called multiple times to register multiple hooks.

### TestSuite.beforeEach(fn)
* `fn` {function} a hook function to be executed before each test
* Return {TestSuite} current instance of the test suite

Note: this method can be called multiple times to register multiple hooks.

### TestSuite.afterEach(fn)
* `fn` {function} a hook function to be executed after each test
* Return {TestSuite} current instance of the test suite

Note: this method can be called multiple times to register multiple hooks.

### TestSuite.after(fn)
* `fn` {function} a hook function to be executed after the tests
* Return {TestSuite} current instance of the test suite

Note: this method can be called multiple times to register multiple hooks.

### TestSuite.suite(name, suiteWrapper)
* `name` {string} name of the new nested test runner
* `suiteWrapper` {function} callback that is called with the `it` argument which
is a function used to define tests in the new runner
* Return {TestSuite} instance of the new nested test runner.

The suites made from this method are hierarchy linked to the suite this method
is called from.

### TestSuite.it(name, test, flags)
* `name` {string} name of the test
* `test` {function} function that defines the test can be `async` or `sync`
and return a Promise, {boolean}, or null. Only `false` and thrown `Error` will
fail a test.
* `flags` {Object} the current flags are
  * `only` {boolean} set to `true` to make this the only test ran, when set
    multiple times the last read test with the `only` option set.
  * `skip` {boolean} set to `true` to have this test skipped at execution time.
* Return {TestSuite} current instance of the test runner

### TestSuite.executeSuite(suiteKeys, runner, testResult, options)
* `suiteKeys` {Array} of suites keys to be ran against this suite
* `runner` {function} usually `TestRunner.runTest` which is called to run each
test.
* `testResult` {function} usually `TestRunner.testResult` which is called to
print or transport the result of each test.
* `options` {object} options used for each test suite passed from `execute()`
* Return {Promise} that resolves when all suites within `suiteKeys` have been
executed.

### TestSuite.executeTest(testKeys, runner, testResult)
* `testKeys` {Array} of test keys to be ran against this suite
* `runner` {function} usually `TestRunner.runTest` which is called to run each
test.
* `testResult` {function} usually `TestRunner.testResult` which is called to
print or transport the result of each test.
* Return {Promise} that resolves when all the tests in `testKeys` are executed.

### TestSuite.execute(runner, testResult, options)
* `runner` {function} usually `TestRunner.runTest` which is called to run each
test.
* `testResult` {function} usually `TestRunner.testResult` which is called to
print or transport the result of each test.
* `options` {object} options used for each test suite passed from `execute()`
* Return {Promise} that is resolved when all nested suites and tests against
this suite are resolved.

## Class: TestRunner

### static TestRunner.runTest(name, test)
* `name` {string} name of the test to be ran
* `test` {function} that returns `true` or `false` or  a `Promise` that resolves
{boolean}
* Return {Promise} that resolves when the test is complete

The promise returns an {object} with the following properties:
* `testName` {string} name of the test that was ran
* `passed` {boolean} `true` when the test passes
* `failed` {boolean} `true` when the test fails
* `errorMessage` {string} message sent when an error is caught
* `error` {Error} actual error object that was caught
* `start` {Date} the time when the test was started
* `finished` {Date} the time when the test was completed
* `duration` {number} in milliseconds that the test took to run

### static TestRunner.testResult(result, reporter)
* `result` {object} containing test results, notated in `TestRunner.runTest()`
* `reporter` {TestReporter} instance of TestReporter used to do the printing
* Return {object} the `result` object passed into the function

### static TestRunner.getInstance(name)
* `name` {string} name of the test runner also used to define the storage of the
instance
* Return {TestRunner} instance of the test runner bound to the `name`

### TestRunner.constructor(name)
* `name` {string} name of the test runner
* Return {TestRunner} instance of the test runner with the given `name`

### TestRunner.setName(name)
* `name` {string} new name of the test runner
* Return {TestRunner} current instance of the test runner

Sets the suite to a new name

### TestRunner.setReporter(reporter)
* `reporter` {TestReporter} instance of test reporter to use for printing
* Return {TestRunner} current instance of the test runner

At instantiation time the runner will setup a default reporter, using this
method will customize that reporter.

### TestRunner.before(fn)
* `fn` {function} a hook function to be executed before the test suites
* Return {TestRunner} current instance of the test runner

Note: this method can be called multiple times to register multiple hooks.

### TestRunner.after(fn)
* `fn` {function} a hook function to be executed after the test suites
* Return {TestRunner} current instance of the test runner

Note: this method can be called multiple times to register multiple hooks.

### TestRunner.suite(name, suiteWrapper)
* `name` {string} name of the new test suite
* `suiteWrapper` {function} callback that is called with the `it` argument which
is a function used to define tests in the new suite
* Return {TestSuite} instance of the new test suite.

The suites made from this method are hierarchy linked to this runner.

### TestRunner.test(name, test, flags)
* `name` {string} name of the test
* `test` {function} function that defines the test can be be `async` or `sync`
and return a Promise, {boolean}, or null. Only `false` and thrown `Error` will
fail a test.
* `flags` {Object} the current flags are
  * `only` {boolean} set to `true` to make this the only test ran, when set
    multiple times the last read test with the `only` option set.
  * `skip` {boolean} set to `true` to have this test skipped at execution time.
* Return {TestRunner} current instance of the test runner

### TestRunner.executeSuite(suiteKeys, options)
* `suiteKeys` {Array} of suites to be executed in serial
* `options` {object} of options to be passed to each suite
* Return {Promise} that resolves when all `suiteKeys` have been executed
serially.

### TestRunner.executeTest(testKeys)
* `testKeys` {Array} of test keys to be executed in serial
* Return {Promise} that will resolve when all `testKeys` have been executed in
serial.

### TestRunner.execute(options)
* `options` {object} options that will be used on this suite and nested suites
* Return {Promise} that is resolved when this runner, all suites and nested
suites, as well as this runners local tests are completed.
