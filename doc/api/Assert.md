# Assert
*Introduced in 4.0.0*
> Stability: 2 - Stable

`Assert` extends `Validate` and provides a test-friendly interface which
returns true or throws.
It also provides an expected-error interface for anti-testing, which will
return true for specified error message(s), but throw for any others.

The `Assert` library should be used for building tests, or to protect code from
execution when input sanity is not achieved.

The `Validate` parent library should be used for boolean evaluations,
eg: if statements or other logic.

```js
const { Assert, expect } = require('kado/lib/Assert')
```
* `Assert` and `expect` are both synonyms for the
  [Assert](#class-assert) class itself
* `Assert.Error` is the extended version of the standard
  [`AssertionError`](#class-assert) and should be used instead (for readability)

---
## Class: AssertionError

### `AssertionError.constructor(data)`
* `data` {mixed} Data to identify the assertion error.
  * When a {string} is passed `{message: data}` is passed below.
  * When an {Object} is passed it is preserved.
* Returns: {void}

This constructor takes a string for easier setup.
It extends the standard `AssertionError` and is the same other than the
simplified allowance of string input on the constructor.  It is available via
alias `Assert.Error` which should be used instead to ensure it not be assumed
to be the standard method.

---
## Class: Assert

Extends `Validate` class.
Evaluates data, types, or other conditions to {boolean}.

### `static Assert.getInstance(data)` 
### `Assert.constructor(data)`
* `data` {mixed} value to be stored
* Returns: {Assert} class object

---
## Stateful functions

These are used upon an instance, with the `data` provided in the constructor

### `Assert.above(floor)`
* `floor` {number} value for lower limit
* Returns: {boolean} `true` when above the `floor`

### `Assert.below(ceiling)`
* `ceiling` {number} value for upper limit 
* Returns: {boolean} `true` when below the `ceiling`

### `Assert.equal(against)`
* `against` {number} value to compare
* Returns: {boolean} `true` when equal to `against`

### `Assert.is(type)` 
* `type` {string} any valid type or class name
* Returns: {boolean} `true` when type or class matches `type`

### `Assert.min(bottom)`
* `bottom` {number} value for lower limit
* Returns: {boolean} `true` when above or equal to the `bottom`

### `Assert.max(top)`
* `top` {number} value for upper limit
* Returns: {boolean} `true` when below or equal to the `top`

### `Assert.not(val)`
* `val` {number} value to compare
* Returns: {boolean} `true` when not equal to `val`

### `Assert.ok(message)`
* `message` {string} message used in throw when stored value is not truthy
* Returns: {boolean} `true` if `value` is truthy
* Throws: {AssertionError} otherwise

---
## Static (stateless) functions

These are the base functions which wire back to `Validate` methods.  All these
methods have common return and throw behavior (except where specified):
* Returns: {boolean} `true` when validation passes
* Throws: {AssertionError} otherwise

### `static Assert.assert(val1, val2)`
* `val1` {mixed} Base data
* `val2` {mixed} Data to assert against Base

Loosely asserts data types to okay and has logic
to improve matching types:
 * `Array` Will match all elements using `assert.deepStrictEqual()`
 * `Object` Will match all elements using `assert.deepStrictEqual()`
 * `Date` Will compare the numeric base
 * `Error` Will compare the message
 * `Function` Will compare the string value

If none of the above types are passed, the assertion will be tested
against [`Assert.eq(val1, val2)`](#static-asserteqval1-val2)

### `static Assert.eq(val1, val2)`
* `val1` {mixed} first value to compare
* `val2` {mixed} second value to compare

Valid when `val1` equal to `val2`

### `static Assert.eqDeep(val1, val2)`
* `val1` {mixed} first value to compare
* `val2` {mixed} second value to compare

Valid when `val1` deeply matches `val2`

### `static Assert.getType(val)`
* `val` {mixed} value to query for type
* Returns: {string} the type or class of `val`

Utility method to obtain type or class, internally used by the next method:

### `static Assert.isType(type, value)`
* `type` {string} name of type to test against
* `value` {mixed} value to obtain type from

Valid when type or class of `value` matches

### `static Assert.isAbove(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Returns: {boolean} `true` if test, is greater than base otherwise throws `AssertionError`

### `static Assert.isBelow(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Returns: {boolean} `true` if `test` is less than `base` otherwise throws `AssertionError`

### `static Assert.minimum(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Returns: {boolean} `true` if the `test` is greater than or equal to the `base` otherwise throws `AssertionError`

### `static Assert.maximum(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Returns: {boolean} `true` if `test` is less than or equal to `base` otherwise throws `AssdertionError`

### `static Assert.neq(val1, val2)`
* `val1` {mixed} value to match against
* `val2` {mixed} value to test against
* Returns: {boolean} `true` if test `val1` one is not equal to `val2` otherwise throws `AssertionError`

### `static Assert.isOk(value, message)`
* `value` {mixed} value to match truthiness against
* `message` {string} message used in throw
* Returns: {boolean} `true` if `value` is truthy
* Throws: {AssertionError} otherwise

### `static Assert.catch(v1, v2, msg, method)`
* `v1` {mixed} first argument to `method` 
* `v2` {mixed} second argument to `method`
* `msg` {string} compare this to `Error.message` when caught.
* `method` {string} class method to execute in try/catch
* Returns: {boolean} `true` when `msg` matches caught `Error.message`
* Throws: {AssertionError} when any other error (pass through)

---
## Catch Wrappers

These methods allow for a single expected/approved throw to occur within the
target method call.  These methods return `true`, otherwise they throw again in
a pass through fashion.  These are generally used for anti-testing to ensure the
bounds and type checks are working.

The string that should match the Error `message` is passed via the `msg`
argument.

### `Assert.assert.catch(val1, val2, msg)`
* arguments as in [assert method](#static-assertassertval1-val2)

### `Assert.eq.catch(val1, val2, msg)`
* arguments as in [eq method](#static-asserteqval1-val2)

### `Assert.eqDeep.catch(val1, val2, msg)`
* arguments as in [eqDeep method](#static-asserteqdeepval1-val2)

### `Assert.isType.catch(type, value, msg)`
* arguments as in [isType method](#static-assertistypetype-value)

### `Assert.isAbove.catch(base, test, msg)`
* arguments as in [isAbove method](#static-assertisabovebase-test)

### `Assert.isBelow.catch(base, test, msg)`
* arguments as in [isBelow method](#static-assertisbelowbase-test)

### `Assert.minimum.catch(base, test, msg)`
* arguments as in [minimum method](#static-assertminimumbase-test)

### `Assert.maximum.catch(base, test, msg)`
* arguments as in [maximum method](#static-assertmaximumbase-test)

### `Assert.neq.catch(val1, val2, msg)`
* arguments as in [neq method](#static-assertneqval1-val2)

### `Assert.isOk.catch(value, msg)`
* arguments as in [isOk method](#static-assertisokvalue-message)
