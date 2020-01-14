# Validate

> Stability: 2 - Stable

The `Validate` library provides validation of data and data types. It
also comes bundled with an `Assert` library which extends `Validate` and
throws `AssertionErrors`. The `Assert` library can be used for testing.
While the `Validate` library is best suited for evaluations, eg: if statements.

```js
const Validate = require('kado/lib/Validate')
```

## Class: AssertionError

Error class describing assertion failures extends core `AssertionError`
and provides an easier constructor.

### `AssertionError.constructor(data)`
* `data` {mixed} Data to identify the assertion error.
  * When a {string} is passed `{message: data}` is passed below.
  * When an {Object} is passed it is preserved.
* Return: {void}

This constructor takes a string for easier setup.

## Class: Validate

Evaluates data and data types to {boolean}.

### `static Validate.assert(val1,val2)`
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
against `Validate.eq(val1,val2)`

### `static Validate.catch(fn,err)`
* `fn` {Function} function to execute in a try / catch
* `err` {string} compare this to `Error.message` when caught.
* Return: {boolean} `true` when `err` matches caught `Error.message`

### static Validate.eq(val1,val2)
this checks if val1 and the val2 matches and returns the value if it does

### `static Validate.eqDeep(val1, val2)`
```js
const assert = require('assert').strict
```
* `{regex} to match against`
* `{value} to match against` 
* Return: {boolean} `true` when matching
* Return: {boolean} `false` when not matching

### `static Validate.getType(Val)`
* Return a type of `string` equal to the value

### `static Validate.isType(type, value)`
* Return {boolean} `true` if type or value matches

### `static Validate.isAbove(base, test)`
* Return {boolean} `true` if test, is greater than base

### `static Validate.isbelow(base, test)`
* Return {boolean} `true` if test is less than base

### `static Validate.minumum(base,test)`
* Return {boolean} `true` if the test is greater than or equal to the base

### `static Vaidate.maximum(base,test)`
* Return {boolean} `true` if test is less than or equal to base

### `static Validate.neq(val1,val2)`
* Return {boolean} `true` if test val1 one is not equal to val2

### `static ValidategetInstance(data)` 
* Return type of `data`

### `Validate.constructor(data)`
* identifies data when data is passed as an argument

### `Validate.above(floor)`
* Return {boolean} `true ` this.data must be greater than the above argument

### `Validate.below(ceiling)`
* Return {boolean} `true ` this.data must be less than the below argument

### `Validate.equal(against)`
* Return {boolean} `true ` this.data must be equal to against argument

### `Validate.is(type)` 
* Return {boolean} `true` this.data must match the type argument

### `Validate.min(bottom)`
* Return {boolean} `true` this.data must be greater than or equal to bottom argument

### `Validate.max(top)`
* Return {boolean} `true` this.data must be less than or equal to top argument

### `Validate.not(val)`
* Return {boolean} `true` this.data must not equal val