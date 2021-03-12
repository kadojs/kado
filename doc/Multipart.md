# Multipart
*Introduced in 4.3.0*
> Stability: 1 - Experimental
```js
const Multipart = require('kado/lib/Multipart')
```
Multipart processing libraries to create and parse multipart requests.

## class Multipart

Empty container class for Multipart processors.

## class Multipart.FormBuild

Create a multipart/form-data request that can be sent to a server.

Usage

This example expects the server to response in JSON with `{ "status": "ok" }` on
a successful upload to the `/upload/` path. See the `Multipart.FormData` usage
for example on setting up a server.

```js
const FormBuild = require('kado/lib/Multipart').FormBuild
const fs = require('kado/lib/FileSystem')
const http = require('http')
const form = new FormBuild()
form.add('testField', 'testValue')
form.add('testFile', fs.createReadStream(fs.path.resolve('somefile.jpg')))
const client = http.request({
  port: 3030,
  host: 'localhost',
  method: 'POST',
  path: '/upload/',
  // get the headers with the form boundary
  headers: form.getHeaders()
})
let buf = ''
client.on('error', (err) => { reject(err) })
client.on('response', async (res) => {
  res.on('data', (chunk) => { buf += chunk.toString('utf-8') })
  res.on('end', () => {
    try {
      const rv = JSON.parse(buf)
      Assert.isOk(rv.status === 'ok', 'Invalid response')
      resolve()
    } catch (err) { reject(err) }
  })
})
// send our form to the client
form.pipe(client)
```

## class Multipart.FormData

Extends `Stream.Writable`

This library provides Multipart.FormData parsing that will allow
multipart/form-data POST requests to upload with success.

### Multipart.FormData.constructor(options = {})
* `options` {Object} options to set up the FormData handling.
* Return {Multipart.FormData} instance.

It is important to send the `headers` option which should come from
`req.headers` provided by your `http` server.

Example usage:
```js
app.post('/upload/', (req, res) => {
  const MultiPart = require('kado/lib/Multipart')
  const multipart = new MultiPart({ headers: req.headers })
  const files = {}
  const promises = []
  multipart.on('field', (fieldname, val, fieldnameShort, valShort) => {
    console.log(fieldname, val, fieldNameShort, valShort)
    // handle field
  })
  // here data is buffered to memory (be careful with this and impose limits!)
  multipart.on('file', (field, stream, filename, encoding, mimeType) => {
    const promise = new Promise((resolve, reject) => {
      const file = {
        stream: stream,
        filename: filename,
        encoding: encoding,
        mimeType: mimeType
      }
      let buffer = ''
      // ideally create a stream using fs.createWriteStream() and pipe to it
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
