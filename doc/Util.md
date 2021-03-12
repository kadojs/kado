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
