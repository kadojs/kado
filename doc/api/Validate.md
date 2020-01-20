# Validate
*Introduced in 4.0.0*
> Stability: 2 - Stable

The `Validate` library provides validation of data and data types. It
also comes bundled with an `Assert` library which extends `Validate` and
throws `AssertionErrors`. The `Assert` library can be used for testing.
While the `Validate` library is best suited for evaluations, eg: if statements.

```js
const Validate = require('kado/lib/Validate')
```

## Class: AssertionError extends assert

```js
const { AssertionError } = require('kado/lib/Validate')
```

### AssertionError.constructor(data)
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
* `{regex} to match against`
* `{value} to match against` 
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with 
* Return {boolean} `true` when val1 deeply matches val2

Note: Uses Node.JS->assert->deepStrictEqual for evaluations

### `static Validate.getType(Val)`
`val` {mixed} value to query for type
* Return a type of `string` equal to the value

### `static Validate.isType(type, value)`
* `type` {string} name of type to test against
* `value` {mixed} value to obtain type from
* Return {boolean} `true` if `type` matches type of `value`

### `static Validate.isAbove(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if `test`, is greater than `base`

### `static Validate.isbelow(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if `test` is less than `base`

### `static Validate.minumum(base,test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if the `test` is greater than or equal to the `base`

### `static Vaidate.maximum(base,test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if `test` is less than or equal to `base`

### `static Validate.neq(val1,val2)`
* `val1` {number} to test against
* `val2` {number} to compare with
* Return {boolean} `true` if `val1`one is not equal to `val2`

### `static Validate.getInstance(data)`
* `data` {mixed} value to be stored
* Return type of `data`

### `Validate.constructor(data)`
* `data` {mixed} value to be stored
* identifies `data` when data is passed as an argument

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