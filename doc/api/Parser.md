# Parser
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const Parser = require('kado/lib/Parser')
```
The `Parser` library provides parsing methods for various formats in order to
save time and ensure a proper and secure parse.

## Class: Parser

### static Parser.cookie(input)
* `input` {string} Usually sent via HTTP header containing available cookies.
* Return {object} Where cookie names are properties and values are stored to
those properties.
