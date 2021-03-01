# Validate
*Introduced in 4.0.0*
> Stability: 2 - Stable

The `Validate` library provides validation of data and data types.

The `Validate` library should be used for boolean evaluations,
eg: if statements or other logic.

The `Assert` library should be used for building tests, or to protect code from
execution when input sanity is not achieved.

```js
const Validate = require('kado/lib/Validate')
```
* `Validate.Error` is the extended version of the standard
  [`assert.AssertionError`](https://nodejs.org/api/assert.html#assert_class_assert_assertionerror)
  and should be used instead (for readability)

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
alias `Validate.Error` which should be used instead to ensure it not be assumed
to be the standard method.

---
## Class: Validate

Evaluates data and data types to {boolean}.

### `static Validate.getInstance(data)`
### `Validate.constructor(data)`
* `data` {mixed} value to be stored
* Returns: {Assert} class object

---
## Stateful functions

These are used upon an instance, with the `data` provided in the constructor

### `Validate.above(floor)`
* `floor` {number} that is below the stored value
* Return {boolean} `true ` when the floor is above the stored value

### `Validate.below(ceiling)`
* `ceiling` {number} that is above the stored value
* Return {boolean} `true ` when the ceiling is below the stored value

### `Validate.equal(against)`
* `against` {number} that equals the stored value
* Return {boolean} `true ` when against equals the stored value

### `Validate.is(type)`
* `type` {string} that equals the stored value
* Return {boolean} `true` when type of stored value matches type

### `Validate.min(bottom)`
* ` bottom` {number} the minimum a stored value can be
* Return {boolean} `true` when bottom matches the stored value

### `Validate.max(top)`
* `top` {number} the maximum a stored value can be
* Return {boolean} `true` when top matches the stored value

### `Validate.not(val)`
* `val` {number} value that the stored value cannot equal
* Return {boolean} `true` when value does not equal the stored value

### `Validate.ok(message)`
* `message` {string} message used in throw when stored value is not truthy
* Returns: {boolean} `true` if `value` is truthy

---
## Static (stateless) functions

These methods have common return and throw behavior
(except where specified):
* Returns: {boolean} `true` when validation passes, `false` otherwise

### `static Validate.assert(val1, val2)`
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
against [`Validate.eq(val1, val2)`](#static-validateeqval1-val2)

### `static Validate.date(val1, val2, options)`
* `val1` {Date} Base date
* `val2` {Date} Date to assert against Base
* `options` {object} options:
  * `granularity` {number} Milliseconds by which to subdivide time
  * `distance` {number} Milliseconds of distance allowable between values

With no options, valid when `val1` is the exact same date as `val2`

When granularity is used, time is subdivided by the provided milliseconds and
`val1` should be in the same subdivision as `val2` to be considered valid.

When distance is used, `val1` difference from `val2` should be equal to or less
than provided milliseconds to be considered valid.

### `static Validate.eq(val1, val2)`
* `val1` {mixed} first value to compare
* `val2` {mixed} second value to compare

Valid when `val1` equal to `val2`

### `static Validate.eqDeep(val1, val2)`
* `val1` {mixed} first value to compare
* `val2` {mixed} second value to compare
* Return {boolean} `true` when val1 deeply matches val2

Valid when `val1` deeply matches `val2`
_Note: Uses Node.js->assert->deepStrictEqual for evaluations_

### `static Validate.neq(val1, val2)`
* `val1` {number} to test against
* `val2` {number} to compare with

Valid when `val1` not equal to `val2`

### `static Validate.getType(val)`
* `val` {mixed} value to query for type
* Returns: {string} the type or class of `val`

Utility method to obtain type or class, internally used by the next method:

### `static Validate.isType(type, value)`
* `type` {string} name of type to test against
* `value` {mixed} value to obtain type from

Valid when type or class of `value` matches

### `static Validate.isAbove(base, test)`
* `base` {number} to test against
* `test` {number} to compare with

Valid when `test` is greater than `base`

### `static Validate.isbelow(base, test)`
* `base` {number} to test against
* `test` {number} to compare with

Valid when `test` is less than `base`

### `static Validate.minimum(base, test)`
* `base` {number} to test against
* `test` {number} to compare with

Valid when `test` is greater than or equal to `base`

### `static Vaidate.maximum(base, test)`
* `base` {number} to test against
* `test` {number} to compare with

Valid when `test` is less than or equal to `base`

### `static Validate.isOk(value)`
* `value` {mixed} value to match truthiness against

Valid when `value` is truthy

### `static Validate.catch(fn, err)`
* `fn` {Function} function to execute in a try / catch
* `err` {string} compare this to `Error.message` when caught.

Valid when `err` matches caught `Error.message`
