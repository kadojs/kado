# Parser
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Parser = require('kado/lib/Parser')
```
The `Parser` library provides parsing methods for various formats in order to
save time and ensure a proper and secure parse.

## Class: Parser

### static Parser.lineToObject(input, options)
* `input` {string} Line of characters to parse into an object.
* `options` {object} Settings to control the parser.
* Return {object} containing parsed properties and values.

Available Options
* `delimiter` {string} used to denote end of values default `;`
* `separator` {string} used to denote end of names default `=`
* `whitespace` {boolean} used to allow whitespace after delimiter default `true`

### static Parser.cookie(input)
* `input` {string} Usually sent via HTTP header containing available cookies.
* Return {object} Where cookie names are properties and values are stored to
those properties.

### static Parser.queryString(input)
* `input` {string} The portion after the `?` on a URL
Return {object} Where names are properties and values are assigned.
