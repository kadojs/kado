# Format
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Format = require('kado/lib/Format')
```
The `Format` library implements a common set of output formatting methods.

## Class: Format
Format is a completely static class of loosely related methods

### static Format.cookie(name, value, options)
* `name` {string} name of the cookie
* `value` {string|object} value of the cookie, Objects automatically serialized to JSON
* `options` {object} set cookie options
* Return {string} a string ready to set sent view `res.setHeader('Set-Coookie')`

Available Options
* `domain` {string} set the domain of the cookie e.g.: `{ domain: 'example.com' }`
* `expires` {string} UTC date string, indicating when the cookie expires
* `httpOnly` {boolean} `true` will stop javascript access to the cookie
* `maxAge` {number} number of seconds the cookie shall be valid
* `secure` {boolean} `true` for HTTPS only cookies
* `sameSite` {string} accepts `Strict`, `Lax`, or `None` as
  values to control cross-origin

Example

```js
const Format = require('kado/lib/Format')
const Module = require('kado/lib/Module')
class MyModule extends Module {
  someRoute (req, res) {
    const cookie = Format.cookie('myCookie', { id: 1 }, { httpOnly: true })
    res.setHeader('Set-Cookie', cookie)
    // or use the built in cookie helper like so
    res.cookie('myCookie', { id: 1 }, { httpOnly: true })
  }
}
```

### `static Format.toFixedFix(n, prec)`
* `n` {mixed} the number, or string containing parsable number-like data
* `prec` {number} precision; how many places after decimal to retain
* Returns: {string} the `number` reformatted as directed

This method performs similar to built-in `toFixed()` method with repairs to some
edge cases that return strange results when the built-in is used directly.

### `static Format.number(n, pos, pt, sep)`
* `n` {mixed} number, or string containing parsable number-like data
* `pos` {number} positions; how many places after decimal to retain
* `pt` {mixed} single character to use as the decimal-point (en-us:`.`);
   OR, a valid locale identifier string, to use Intl/ICU to determine both
   `pt` and `sep`
* `sep` {string} single character to use as the thousands separator (en-us:`,`);
  OR, optional/`undefined` when passing locale as `pt`
* Returns: {string} input `n` reformatted as directed, including all separators

Reformat provided number in "human" style with commas and dots (or, dots and
commas).

### `static Format.magnitude(val, opts)`
* `val` {mixed} number, or string containing parsable number-like data
* `opts` {object} options, as [described below](#magnitude-options)
* Returns: {string} input `n` reformatted as directed

Converts input number to the best possible human-readable magnitude, at optional
fixed width with `K`/`M`/`G`/`T`/`P`/`E`/`Z`/`Y` and suffix which defaults to `B`

###### .magnitude() Options
* `'magnitudes'` {string} (Default: `'KMGTPEZY'`) string listing the displayed
  magnitude prefixes in ascending scale from 1000's to yotta's
* `'force'` {mixed} (Default: `false`) force magnitude, disable automatic
  scaling; accepts single character of the available `magnitudes`
* `'suffix'` {string} (Default: `'B'`) suffix for units label
* `'round'` {boolean} (Default: `true`) round to nearest whole number
* `'space'` {boolean} (Default: `false`) insert one space before units label
* `'locale'` (Default: `undefined`) any valid Intl/ICU locale string to adjust
  comma and dot usage; `undefined` uses system default locale


### `static Format.bytes(number, options)`
* `number` {mixed} number, or string containing parsable number-like data
* `options` {object} options, as [described below](#bytes-options)
* Returns: {string} input `n` reformatted as directed

Functionally similar to "prettyBytes", adapted here to reduce dependency.
Calls `.magnitude()` with unconditional upstream options:
* `{ space: true, round: false, magnitudes: 'kMGTPEZY' }`

###### .bytes() Options
* bits {boolean} add upstream option `{ suffix: 'bit' }`
* locale {string} pass through to upstream option `locale`

### `static Format.inetPtoN(p)`
* `p` {string} any individual standard IPv4 or IPv6 address
* Returns: {string} address, packed into binary string:
  * of length `4` with IPv4 input
  * of length `16` with IPv6 input

Convert IPv4 or IPv6 addresses from text to binary form, compatible with
standard C _inet_pton()_ function call

### `static Format.inetNtoP(n)`
* `n` {string} IPv4 binary string of length `4`, or IPv6 of length `16`
* Returns: {string} IP address, in normalized standard form

Convert IPv4 or IPv6 addresses from binary string to text form, compatible with
standard C _inet_ntop()_ function call

### `static Format.ip(ip, padding, web)`
* `ip` {string} any individual standard IPv4 or IPv6 address
* `padding` {string} character to use for padding in fixed-position mode
* `web` {boolean} emit HTML-safe non-breaking spaces
* Returns: {string} input IP, reformatted

Convert input IPv4 or IPv6 to normalized standard form, with optional padding
and/or HTML-safe output

### `static Format.ProgressBar(fmt, options)`
* `fmt` {string} Format descriptor
* `options` {object|number} options or total
* Returns: {ProgressBar} ProgressBar instance

Initialize a `ProgressBar` with the given `fmt` string and `options` or `total`.

Tokens in `fmt`
* `:bar` the progress bar itself
* `:current` current tick number
* `:total` total ticks
* `:elapsed` time elapsed in seconds
* `:percent` completion percentage
* `:eta` eta in seconds
* `:rate` rate of ticks per second

Available Options in `options`
* `curr` current completed index
* `total` total number of ticks to complete
* `width` the displayed width of the progress bar defaulting to total
* `stream` the output stream defaulting to stderr
* `head` head character defaulting to complete character
* `complete` completion character defaulting to "="
* `incomplete` incomplete character defaulting to "-"
* `renderThrottle` minimum time between updates in milliseconds defaulting to 16
* `callback` optional function to call when the progress bar completes
* `clear` will clear the progress bar upon termination

#### `Format.ProgressBar.setTotal(total)`
* `total` {number} Total

Change the current instance internal/private total to `total`.

#### `Format.ProgressBar.setFmt(fmt)`
* `fmt` {string} Format descriptor

Change the current instance internal/private format to `fmt`, as described in
the constructor.

#### `Format.ProgressBar.tick(len, tokens)`
* `len` {number|object} Tick length (or tokens)
* `tokens` {object} Tokens

"tick" the progress bar with optional `len` and optional `tokens`.

#### `Format.ProgressBar.render(tokens, force)`
* `tokens` {object} Tokens
* `force` {boolean} Forcibly render now

Method to render the progress bar with optional `tokens` to place in the
progress bar's `fmt` field.

#### `Format.ProgressBar.update(tokens, force)`
* `ratio` {number} The ratio (between 0 and 1 inclusive) to set the overall
  completion to.
* `tokens` {object} Tokens

Method to "update" the progress bar to represent an exact percentage. The ratio
(between 0 and 1) specified will be multiplied by `total` and floored,
representing the closest available "tick." For example, if a progress bar has a
length of 3 and `update(0.5)` is called, the progress will be set to 1.

A ratio of 0.5 will attempt to set the progress to halfway.

#### `Format.ProgressBar.interrupt(message)`
* `message` {string} The message to write.

Method to "interrupt" the progress bar and write a message above it.

#### `Format.ProgressBar.terminate()`

Terminates a progress bar.

### `static Format.color(message, fgc, bgc, set, rst)`
* `message` {mixed} number, or string containing parsable number-like data
* `fgc` {string} [color](#valid-color-names) of foreground
* `bgc` {string} [color](#valid-color-names) of background
* `set` {string} [style](#valid-style-names) to set
* `rst` {string} [style](#valid-style-names) to reset
* Returns: {string} input message wrapped in ANSI terminal style and color

Allows for terminal-destined output to have basic color and styling added.

###### Valid Color Names
* `'Black'`
, `'Red'`
, `'Green'`
, `'Yellow'`
* `'Blue'`
, `'Magenta'`
, `'Cyan'`
, `'Light Gray'`
* `'Dark Gray'`
, `'Light Red'`
, `'Light Green'`
* `'Light Yellow'`
, `'Light Blue'`
, `'Light Magenta'`
* `'Light Cyan'`
, `'White'`

###### Valid Style Names
* (set)`'Default'` * _**or**_ * (reset)`'All'`
* `'Bold'`
, `'Dim'`
, `'Underlined'`
* `'Blink'`
, `'Reverse'`
, `'Hidden'`
