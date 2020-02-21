# PathExp
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const PathExp = require('kado/lib/PathExp')
```
The `PathExp` library provides what is known as a `path-to-regexp` functionality
where a notation string such as `/user/:name` is converted into a regular
expression cable of being used tested against request URIs.

## Class: PathExp

### PathExp.constructor(path, options)
* `path` {string} A string with the new path declaration.
* `options` {object} Optional options object.
* Return {PathExp} new instance.

### PathExp.build(path)
* `path` {string} A string with a path exp to turn to an regular expression.
* Return {string} that can be passed to `new RegExp()`

Builds the regular express for testing against accessible through `PathExp.exp`

*Internal Use*

### PathExp.match(against, params)
* `against` {string} A path string to try matching against
* `params` {object} A blank object to populated with matched params
* Return {boolean} `true` when matched otherwise `false`
