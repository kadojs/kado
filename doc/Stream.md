# Stream
*Introduced in 4.3.0*
> Stability: 1 - Experimental
```js
const Stream = require('kado/lib/Stream')
```

## class Stream

The stream class is an exposure of the Node.JS core Stream class. This provides
convenience as we overlay common Stream manipulation mechanisms on to the core
functionality.

## class Stream.ChunkStream

Extends `Stream.Readable`

This is a mirror stream that exports input data to a readable export.

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

### Stream.StreamSlicer.constructor(cfg)
* `cfg` {Object} options to configure the slicer.
* Return `{Stream.StreamSlicer}` instance.

It is very important to pass the boundary option.

Usage

```js
const Assert = require('kado/lib/Assert')
const fs = require('kado/lib/FileSystem')
const Stream = require('kado/lib/Stream')
const StreamSlicer = Stream.StreamSlicer
const slicer = new StreamSlicer({ boundary: '----MyBoundary123' })
slicer.on('part', (part) => {
  Assert.isOk(part instanceof Stream, 'Invalid part')
  // handle part ...
})
const input =  fs.createReadStream(fs.path.resolve('somefile.txt'))
Stream.pipeline(input, slicer, (err) => {
  let code = 0
  if (err) {
    code++
    console.log('Had stream errors', err)
  } else {
    console.log('Slice complete')
  }
  process.exit(code)
})
```
