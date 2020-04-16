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

### static Parser.replacer(map, input)
* `map` {object} of keys that should be matched and values to replace those
keys with.
* `input` {string} containing the characters that should be replaced.
* Return {string} of the input with the replaced characters from the map.

### static Parser.htmlEscape(input)
* `input` {string} containing HTML tags that will be escaped with HTML entities.
* Return {string} containing replaced tags.

### static Parser.htmlUnescape(input)
* `input` {string} containing HTML entities to be turned back to HTML tags.
* Return {string} containing replaced entities.


### static Parser.capitalize(string)
* `string` {string} subject text
* Returns: {string} the `string` with all words having capital first letter

This Method Makes The Input Look Like This.

### static Parser.printDate (d, emptyString)
* `d` {Date} subject date in proper object OR other input will be best-effort
  coerced into Date object
* `emptyString` {string} (Default: `'Never'`) text to use when `d` unclear
* Returns: {string} equivalent of input in sorting friendly format

Reformat date to a string with a nice format; such as:
`YYYY-mm-dd HH:MM:SS`

### static Parser.escapeAndTruncate()
* Returns: {Function} reference to anonymous function as documented below:
  ##### `static (text, render)`
  * `text` {string} subject text
  * `render` {Function} rendering function reference
  * Returns: {string} input `text` split and fed to `render` function, modified

  Input `text` uses CSV-like meta-argument format with a length number then `,`
  then the remaining part of the string is sent to the `render` function.  That
  output is filtered of any HTML and truncated to the length, and returned.


### static Parser.stringCaseSeparate(input, separator)
* `input` {string} A TitleCase string to separate.
* `separator` {string} A string to use to separate title case elements. Default
is a space ` `.
* Return {string} The parsed string with added separators.

### static Parser.stringToPath(input, separator)
* `input` {string} Any string that should be converted to a path using a method
where all non alpha numeric characters are replaced with whitespace, whitespace
is then trimmed, compressed, and replaced with the defined `separator`
* `separator` {string} A string which will separate all instances of white space
in the resulting path string.
* Return {string} The parsed string ready to be used as a path or URI.

### static Parser.stringToTitle(name, separator)
* `input` {string} Any string that should be converted to a title string.
Like "The Title of a Book".
* `separator` {string} A string that separates words, default is space ` `.
* `joiner` {string} A string to join the words back together, default is
again a space ` `.
* Return {string} Parsed into a title string with conjunctions, articles and
prepositions accounted for.

### static Parser.requestBody(req)
* `req` {IncomingMessage} HTTP incoming request object.
* Return {Promise} resolved with body parsing is complete and `req.body` will
be populated with the result.

Example
```js
app.use(req => Parser.requestBody(req))
```
