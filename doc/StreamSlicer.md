# StreamSlicer
*Introduced in 4.3.0*
> Stability: 2 - Stable
```js
const StreamSlicer = require('kado/lib/StreamSlicer')
```
## Class: StreamSlicer extends WritableStream
The `StreamSlicer` class implements a super class for parsing multipart
content directly from a Stream interface.

### StreamSlicer.constructor(options)
* `options` {Object} an object with options
    * `boundary` {string} **(required)** This is the boundary used to detect
      the beginning of a new part.
    * `headerFirst` {boolean} If true, preamble header parsing will be
      performed first.
    * `maxHeaderPairs` {number} The maximum number of header key=>value pairs
      to parse **Default:** 2000 (same as node's http).
* Return {StreamSlicer} new instance of StreamSlicer

### StreamSlicer.setBoundary(boundary)
* `boundary` {string} This is the boundary used to detect the beginning of a new
  part.
* Return {number} of queries executed including currently added

Sets the boundary to use for parsing and performs some initialization needed
for parsing. You should only need to use this if you set `headerFirst` to true
in the constructor and are parsing the boundary from the preamble header.

---
## Events
### .on('finish', () => {...})

Emitted when all parts have been parsed, and the instance has been ended.

### .on('part', (stream) => {...})
* `stream` {ChunkStream}

Emitted when a new part has been found.

### .on('preamble', (stream) => {...})
* `stream` {ChunkStream}

Emitted for preamble if you should happen to need it (can usually be ignored).

### .on('trailer', (data) => {...})
* `data` {Buffer}

Emitted when trailing data was found after the terminating boundary (as with the preamble, this can usually be ignored too).

---
## Class: ChunkStream extends ReadableStream
The `ChunkStream` class implements a header-aware Stream interface.
## Events
### .on('header', (header) => {...})
* `header` {Object} An object containing the header for this particular part. Each property value is an _array_ of one or more string values.
