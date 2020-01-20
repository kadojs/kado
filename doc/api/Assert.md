# Assert
*Introduced in 4.0.0*
> Stability: 2 - Stable

The `Assert` library provides validation of data and data types. It
also comes bundled with a `Validate` library which `Assert` extends and
throws `AssertionErrors`. The `Assert` library can be used for testing.
While the `Valdation` library is best suited for evaluations, eg: if statements.

```js
const Assert = require('kado/lib/Assert')
```

## Class: Assert extends Validate

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
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* Returns {boolean} `true` when matches otherwise throws `AssertionError`
### `static Assert.eqDeep(val1, val2)`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* Return {boolean} true when matches otherwise throws `AssertionError`
```js
const assert = require('assert').strict
```
*`val1` {mixed} value to match against
*`val2` {mixed} value to test against
* Return {boolean} `true` when `val1` deeply matches `val2` otherwise throws `AssertionError`

### `static Assert.getInstance(data)` 
* `data` {mixed} value to be stored
* Return type of `data`

### `static Assert.getType(Val)`
`val` {mixed} value to query for type
* Return a type of `string` equal to the value otherwise throws `AssertionError`

### `static Assert.isAbove(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if test, is greater than base otherwise throws `AssertionError`

### `static Assert.isbelow(base, test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if test is less than base otherwise throws `AssertionError`

### `static Assert.isType(type, value)`
* `type` {string} name of type to test against
* `value` {mixed} value to obtain type from
* Return {boolean} `true` if type or value matches otherwise throws `AssertionError`

### `static Assert.maximum(base,test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if `test` is less than or equal to `base` otherwise throws `AssdertionError`

### `static Assert.minumum(base,test)`
* `base` {number} to test against
* `test` {number} to compare with
* Return {boolean} `true` if the `test` is greater than or equal to the `base` otherwise throws `AssertionError`

### `static Assert.neq(val1,val2)`
*`val1` {mixed} value to match against
*`val2` {mixed} value to test against
* Return {boolean} `true` if test `val1` one is not equal to `val2` otherwise throws `AssertionError`

### `static Assert.isOk(value,message)`
* `value` {mixed} value to match truthiness against
* `message` {string} message used in throw
* Return {boolean} `true` if `value` is truthy otherwise throws `AssertionError`

### `Assert.constructor(data)`
* `data` {mixed} value to be stored
* identifies `data` when `data` is passed as an argument

### `Assert.above(floor)`
* `floor` {number} that is below the stored value
* Return {boolean} `true ` this.data must equal to below argument

### `Assert.below(ceiling)`
* `ceiling` {number} that is above the stored value 
* Return {boolean} `true ` this.data must equal to against argument

### `Assert.equal(against)`
* `against` {number} that equals the stored value
* Return {boolean} `true ` this.data must be equal to against argument

### `Assert.is(type)` 
* `type` {string} that equals the stored value
* Return {boolean} `true` this.data must match the type argument

### `Assert.max(top)`
* `top` {number} the maximum a stored value can be
* Return {boolean} `true` this.data must be less than or equal to top argument

### `Assert.min(bottom)`
* ` bottom` {number} the minimum a stored value can be
* Return {boolean} `true` this.data must be greater than or equal to bottom argument

### `Assert.not(val)`
* `val` {number} value that the stored value cannot equal
* Return {boolean} `true` this.data must not equal val

### `Assert.assert.catch`
* `val1` {mixed} first argument to compare with 
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.eq.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.eqDeep.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isType.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.e
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isAbove.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isBelow.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.maximum.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.minimum.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.neq.catch`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of

### `Assert.isOk.catch(value,msg)`
* `value` {mixed} value to match truthiness against
* `msg` {string} must match err.message or an `AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the `msg` is not returned

### `Assert.AssertionError`
* `val1` {mixed} first argument to compare with
* `val2` {mixed} second argument to compare with
* `msg` {string} must match err.message or instance of Error or an
`AssertionError` will be thrown.
* Return {boolean} `true` When Assertion passes
Throws AssertionError if the argument is't equal to or an instance of
