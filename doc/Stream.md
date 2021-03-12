# Stream
*Introduced in 4.3.0*
> Stability: 1 - Experimental
```js
const Stream = require('kado/lib/Stream')
```

## class Stream

The stream class is an exposure of the Node.js core Stream class. This provides
convenience as we overlay common Stream manipulation mechanisms on to the core
functionality.

## class Stream.HeaderParser

Parse header pairs from a readable stream.

### Stream.HeaderParser.constructor(cfg = {})
* `cfg` {Object} options to instantiate header parser
* Return {Stream.HeaderParser} instance.

### Stream.HeaderParser.push(data)
* `data` {Buffer|Stream|String} data to push into the header parser.
* Return {Number} length of data pushed.

## class Stream.StreamChain

Extends `Stream.Readable`

StreamChain provides the ability to add various streams into a heap and have a
single output stream result.

Usage

```js
const fs = require('kado/lib/FileSystem')
const Stream = require('kado/lib/Stream')
const StreamChain = Stream.StreamChain
const stream1 = fs.createReadStream(fs.path.resolve('testfile.text'))
const stream2 = Buffer.from('some string')
const stream3 = fs.createReadStream(fs.path.resolve(__dirname, 'somephoto.jpg'))
const output = fs.createWriteStream(fs.path.resolve(__dirname, 'newfile.pack'))
const chain = new StreamChain()
chain.addStream(stream1)
chain.addStream(stream2)
chain.addStream(stream3)
Stream.pipeline(chain, output, (err) => {
  let code = 0
  if (err) {
    console.log('Stream had errors', err)
    code++
  } else {
    console.log('Stream chain complete')
  }
  process.exit(code)
})
```

### Stream.StreamChain.constructor(options = {})
* `options` {Object} options such as `highWaterMark` see `Stream.Writable` for\
more.
Return {StreamChain} instance.

### Stream.StreamChain.addStream(stream)
* `stream` {Stream.Readable|Buffer|String) append a data gram to the stack.
* Return {StreamChain} this instance.

## class Stream.StreamChunk

Extends `Stream.Readable`

This is a mirror stream that exports input data to a readable export.

The `StreamChunk` class implements a header-aware Stream interface.

### StreamChunk Events

#### .on('header', (header) => {...})
* `header` {Object} An object containing the header for this particular part.
Each property value is an _array_ of one or more string values.

## class Stream.StreamSearch

Extends `EventEmitter`

Stream search lives up to its name and provides need searching within a flowing
stream.

### Stream.StreamSearch.constructor(needle)
* `needle` {string} needle to find in the haystack.
* Return {Stream.StreamSearch} instance.

### Stream.StreamSearch.push(data)
* `stream` {Stream.Readable|Buffer|String) add data to the haystack.
* Return {Number} length of the data added.

### Stream.StreamSearch Property List.

Useful properties maintained by the search.
* `StreamSearch.matches` {number} number of times the needle has matched.

## class Stream.StreamSlicer

Extends `Stream.Writable`

StreamSlicer takes a boundary needle and divides the stream into chunks based on
that needle. It will call the `part` even as it finds sections of the stream
which allows your program to handle the different data regions appropriately.

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

## StreamSlicer Events

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

