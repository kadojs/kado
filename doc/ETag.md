# ETag
*Introduced in 4.1.0*
> Stability: 2 - Stable
```js
const ETag = require('kado/lib/ETag')
```
Produce an ETag compatible header variable for browser cache usages.

Example:
```js
const ETag = require('kado/lib/ETag')
const fs = require('kado/lib/FileSystem')
const tag = ETag.getTag('some content')
const fileTag = ETag.getTag(fs.statSync('./someFile'))
```

## Class: ETag

### static ETag.getTag(input, options)
* `input` {string} Entity input.
* `options` {object} Settings to control the Etag generator
* Return {object} containing parsed properties and values.

Available Settings:
* `weak` {boolean} issue a weak ETag, turns on automatically when passed an
`fs.Stats` object.
