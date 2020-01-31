# Util

> Stability: 2 - Stable
```js
const Util = require('kado/lib/Util')
```
The `Util` library implements several convenience methods.

## Class: Util
Util is a completely static class of loosely related methods

### `static Util.capitalize(string)`
* `string` {string} subject text
* Returns: {string} the `string` with all words having capital first letter

This Method Makes The Input Look Like This.

### `static Util.printDate (d, emptyString)`
* `d` {Date} subject date in proper object OR other input will be best-effort
  coerced into Date object
* `emptyString` {string} (Default: `'Never'`) text to use when `d` unclear 
* Returns: {string} equivalent of input in sorting friendly format

Reformat date to a string with a nice format; such as:
`YYYY-mm-dd HH:MM:SS`

### `static Util.escapeAndTruncate()`
* Returns: {Function} reference to anonymous function as documented below:
  ##### `static (text, render)`
  * `text` {string} subject text
  * `render` {Function} rendering function reference
  * Returns: {string} input `text` split and fed to `render` function, modified

  Input `text` uses CSV-like meta-argument format with a length number then `,`
  then the remaining part of the string is sent to the `render` function.  That
  output is filtered of any HTML and truncated to the length, and returned.

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
