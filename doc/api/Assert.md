# Assert

> Stability: 2 - Stable

The `Assert` library provides validation of data and data types. It
also comes bundled with an `Validate` library which extends `Assert` and
throws `AssertionErrors`. The `Validate` library can be used for testing.
While the `Assert` library is best suited for evaluations, eg: if statements.

```js
const AssertionError = require('./AssertionError')
const Validate = require('kado/lib/Validate')
```

## Class: Assert extends Validate


### `AssertionError.constructor(data)`
* `data` {mixed} Data to identify the assertion error.
  * When a {string} is passed `{message: data}` is passed below.
  * When an {Object} is passed it is preserved.
* Return: {void}

This constructor takes a string for easier setup.

## Class: Assert

Evaluates data and data types to {boolean}.

### `static assert(val1,val2)`
* `val1` {mixed} Base data
* `val2` {mixed} Data to assert against Base
* Return: {boolean} `true` when values match.

Loosely asserts data types to okay and has logic
to improve matching types:
 * `Array` Will match all elements using `assert.deepStrictEqual()`
 * `Object` Will match all elements using `assert.deepStrictEqual()`
 * `Date` Will compare the numeric base
 * `Error` Will compare the message
 * `Function` Will compare the string value

If none of the above types are passed, the assertion will be tested
against `Assert.eq(val1,val2)`

### `static Assert.catch(fn,err)`
* `fn` {Function} function to execute in a try / catch
* `err` {string} compare this to `Error.message` when caught.
* Return: {boolean} `true` when `err` matches caught `Error.message`

### `static Assert.eq(val1,val2)`
this checks if val1 and the val2 matches and returns the value if it does

### `static Assert.eqDeep(val1, val2)`
```js
const assert = require('assert').strict
```
* `{regex} to match against`
* `{value} to match against` 
* Return: {boolean} `true` when matching
* Return: {boolean} `false` when not matching

### `static Assert.getInstance(data)` 
* Return type of `data`

### `static Assert.getType(Val)`
* Return a type of `string` equal to the value

### `static Assert.isAbove(base, test)`
* Return {boolean} `true` if test, is greater than base

### `static Assert.isbelow(base, test)`
* Return {boolean} `true` if test is less than base

### `static Assert.isType(type, value)`
* Return {boolean} `true` if type or value matches

### `static Assert.maximum(base,test)`
* Return {boolean} `true` if test is less than or equal to base

### `static Assert.minumum(base,test)`
* Return {boolean} `true` if the test is greater than or equal to the base

### `static Assert.neq(val1,val2)`
* Return {boolean} `true` if test val1 one is not equal to val2

### `Assert.constructor(data)`
* identifies data when data is passed as an argument

### `Assert.above(floor)`
* Return {boolean} `true ` this.data must be greater than the above argument

### `Assert.below(ceiling)`
* Return {boolean} `true ` this.data must be less than the below argument

### `Assert.equal(against)`
* Return {boolean} `true ` this.data must be equal to against argument

### `Assert.is(type)` 
* Return {boolean} `true` this.data must match the type argument

### `Assert.max(top)`
* Return {boolean} `true` this.data must be less than or equal to top argument

### `Assert.min(bottom)`
* Return {boolean} `true` this.data must be greater than or equal to bottom argument

### `Assert.not(val)`
* Return {boolean} `true` this.data must not equal val

### `Assert.assert.catch` 
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.eq.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.eqDeep.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isType.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isAbove.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isBelow.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.maximum.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.minimum.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.neq.catch`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.AssertionError`
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of