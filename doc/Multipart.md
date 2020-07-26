# Multipart
*Introduced in 4.3.0*
> Stability: 2 - Stable
```js
const Multipart = require('kado/lib/Multipart')
```
This library provides Multipart.FormData parsing that will allow
multipart/form-data POST requests to upload with success.

Example usage:
```js
app.post('/upload/', (req, res) => {
  const MultiPart = require('kado/lib/Multipart')
  const multipart = new MultiPart({ headers: req.headers })
  const files = {}
  const promises = []
  multipart.on('file', (field, stream, filename, encoding, mimeType) => {
    const promise = new Promise((resolve, reject) => {
      const file = {
        stream: stream,
        filename: filename,
        encoding: encoding,
        mimeType: mimeType
      }
      let buffer = ''
      stream.on('data', (buf) => { buffer += buf.toString('utf-8') })
      stream.on('end', () => {
        file.data = buffer
        resolve()
      })
      stream.on('error', reject)
      files[field] = file
    })
    promises.push(promise)
  })
  multipart.on('finish', async () => {
    await Promise.all(promises)
    Assert.isOk(files && files.test, 'No file for import')
    // do something with the files
    req.notify('File uploaded.')
    res.redirect('/upload-success/')
  })
  req.pipe(multipart)
})
```

## Class: Multipart extends Stream.Writable

### Multipart.constructor(options = {})
* `options` {Object} options to control multipart parsing. `headers`
is a required property and must come from the current request.
* Return {Multipart} new instance of the parser.
