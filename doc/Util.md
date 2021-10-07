# Util
*Introduced in 3.0.0*
> Stability: 2 - Stable
```js
const Util = require('kado/lib/Util')
```
The `Util` library implements several convenience methods.

## Class: Util
Util is a completely static class of loosely related methods

**NOTE** In `4.1.0` the `capitalize`, `printDate`, and `escapeAndTruncate`
methods were moved to the `Parser` library. See their documentation and usage
from there. Update any usages accordingly.

### `static Util.is()`
* Returns: {Function} reference to anonymous function as documented below:
  ##### `(text, render)`
  * `text` {string} subject text
  * `render` {Function} rendering function reference
  * Returns: {string} input `text` fed to `render` function, parsed to
    conditionally return one piece or the other

  Input `text` is sent to `render` function, then that output is split by `,`
  and must result in three meta-arguments:
  * `[0]` condition
  * `[1]` string to return when condition is anything but false or empty
  * `[2]` string to return when condition is false or empty

### `static Util.compare()`
* Returns: {Function} reference to anonymous function as documented below:
  ##### `(text, render)`
  * `text` {string} subject text
  * `render` {Function} rendering function reference
  * Returns: {string} input `text` fed to `render` function, parsed to
    compare and conditionally return one piece or the other

  Input `text` is sent to `render` function, then that output is split by `,`
  and must result in four meta-arguments:
  * `[0]` comparison A
  * `[1]` comparison B
  * `[2]` string to return when strict comparison is anything but unequal
  * `[3]` string to return when strict comparison is unequal

### `static Util.find()`
* `collection` {Array|Object} The collection to inspect
* `predicate` {Function} The function invoked per iteration; Default: `identity()`
* `fromIndex` {number} The index to search from; Default: `0`
* Returns: {*} matched element, else `undefined`

Iterates over elements of `collection`, returning the first element
`predicate` returns truthy for. The predicate is invoked with three
arguments: (`value`, `index|key`, `collection`).

Example:
```js
const users = [
  { 'user': 'barney',  'age': 36, 'active': true },
  { 'user': 'fred',    'age': 40, 'active': false },
  { 'user': 'pebbles', 'age':  1, 'active': true }
]

find(users, (o) => o.age < 40)
// => object for 'barney'

// The `matches` iteratee shorthand.
find(users, { 'age': 1, 'active': true })
// => object for 'pebbles'

// The `matchesProperty` iteratee shorthand.
find(users, ['active', false])
// => object for 'fred'

// The `property` iteratee shorthand.
find(users, 'active')
// => object for 'barney'
```

### `static Util.max()`
* `array` {Array} The array to iterate over
* Returns: {*} maximum value, else `undefined`

Computes the maximum value of `array`.
If `array` is empty or falsey, `undefined` is returned.

Example:
```js
max([4, 2, 8, 6])
// => 8

max([])
 // => undefined
```

### `static Util.padStart()`
* `string` {string} The string to pad; Default: `''`
* `length` {number} The padding length; Default: `0`
* `length` {number} The string used as padding; Default: `' '`
* Returns: {string} padded string

Pads `string` on the left side if it's shorter than `length`.
Padding characters are truncated if they exceed `length`.

Example:
```js
padStart('abc', 6)
// => '   abc'

padStart('abc', 6, '_-')
// => '_-_abc'

padStart('abc', 3)
// => 'abc'
```

### `static Util.repeat()`
* `string` {string} The string to repeat; Default: `''`
* `n` {number} The number of times to repeat the string; Default: `1`
* `guard` {Object} Enables use as an iteratee for methods like `map()`
* Returns: {string} repeated string

Repeats the given string `n` times.

Example:
```js
repeat('*', 3)
// => '***'

repeat('abc', 2)
// => 'abcabc'

repeat('abc', 0)
// => ''
```
