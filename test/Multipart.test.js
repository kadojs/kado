'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2022 Bryan Tong, NULLIVEX LLC. All rights reserved.
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Application = require('../lib/Application')
const Assert = require('../lib/Assert')
const fs = require('../lib/FileSystem')
const http = require('http')
const HyperText = require('../lib/HyperText')
const Multipart = require('../lib/Multipart')
const os = require('os')
const Stream = require('stream')
let app
let server
const isWin = !!os.platform().match('win')
const buildFormData = () => {
  const inputFile = fs.path.resolve(
    __dirname, 'fixture', 'Multipart', 'article.json')
  const boundary = '----131504236582514718146901'
  const input = fs.readFileSync(inputFile)
  const B_BOUNDARY = Buffer.from(boundary)
  const B_CRLF = Buffer.from('\r\n')
  const B_DCRLF = Buffer.from('\r\n\r\n')
  const B_DD = Buffer.from('--')
  const fieldHeaders = 'Content-Disposition: form-data; name="testField"'
  const fileHeaders = [
    'Content-Disposition: form-data;' +
    ' name="testFile"; filename="article.json"',
    'Content-Type: application/json'
  ]
  // build payload
  let data = Buffer.alloc(0)
  data = Buffer.concat([
    data,
    B_DD, B_BOUNDARY, B_CRLF,
    Buffer.from(fieldHeaders), B_DCRLF,
    Buffer.from('foo'), B_CRLF,
    B_DD, B_BOUNDARY, B_CRLF,
    Buffer.from(fileHeaders[0]), B_CRLF,
    Buffer.from(fileHeaders[1]), B_DCRLF,
    input, B_CRLF,
    B_DD, B_BOUNDARY, B_DD, B_CRLF
  ])
  const requestHeaders = {
    'content-type': 'multipart/form-data; boundary=' + boundary,
    'transfer-encoding': 'chunked'
  }
  return { data: data, headers: requestHeaders }
}
const testUpload = () => {
  return (req, res) => {
    const multipart = new Multipart.FormData({ headers: req.headers })
    Assert.isType('FormData', multipart)
    let gotFile = false
    let gotField = false
    const filePromise = []
    const file = {}
    multipart.on('field', (fieldname, val, fieldnameShort, valShort) => {
      try {
        Assert.isType('string', fieldname)
        Assert.isType('string', val)
        Assert.eq(false, fieldnameShort)
        Assert.eq(false, valShort)
      } catch (err) { res.json({ error: err.message }) }
      gotField = true
    })
    multipart.on('file', (field, stream, filename, encoding, mimeType) => {
      try {
        Assert.isType('string', field)
        Assert.isType('StreamChunk', stream)
        Assert.isType('string', filename)
        Assert.isType('string', encoding)
        Assert.isType('string', mimeType)
      } catch (err) { res.json({ error: err.message }) }
      gotFile = true
      filePromise.push(new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
          if (!file[field]) file[field] = { data: '' }
          file[field].data += chunk.toString('utf-8')
        })
        stream.on('error', (err) => { reject(err) })
        stream.on('end', () => { resolve() })
      }))
    })
    multipart.on('error', (err) => { res.json({ error: err.message }) })
    multipart.on('finish', async () => {
      try {
        await Promise.all(filePromise)
        Assert.isOk(gotField, 'Missing field')
        Assert.isOk(gotFile, 'Missing file')
        res.json({ status: 'ok' })
      } catch (err) {
        res.json({ error: err.message })
      }
    })
    req.pipe(multipart)
  }
}
const sendUpload = (headers, data, resolve, reject, attempt = 0) => {
  function sendAgain (err) {
    if (attempt < 2) {
      attempt++
      sendUpload(headers, data, resolve, reject, attempt)
    } else {
      reject(err)
    }
  }
  const client = http.request({
    port: 3030,
    host: 'localhost',
    method: 'POST',
    path: '/upload/',
    headers: headers
  })
  let buf = ''
  client.on('error', (err) => { sendAgain(err) })
  client.on('response', async (res) => {
    res.on('data', (chunk) => { buf += chunk })
    res.on('end', () => {
      try {
        const rv = JSON.parse(buf.toString('utf-8'))
        Assert.isOk(rv.status === 'ok', 'Invalid response')
        resolve()
      } catch (err) {
        sendAgain(err)
      }
    })
  })
  // piping from a file fails on Windows 10 with Node 16.4.2 it may be
  // a bug that will go away, or it might be a miracle that it works the rest
  // of the time. issue https://git.nullivex.com/kado/kado/-/issues/90
  // and merge request
  // https://git.nullivex.com/kado/kado/-/merge_requests/289/
  // both attempt to correct this mysterious issue however it remains.
  // the theory is that a race condition happens, and the newest code is
  // exposing what used to be a rare issue
  // data.pipe(client)
  // reading and writing the stream manually works
  // UPDATE: switched to Stream.pipeline to correct this
  if (data instanceof Stream.Readable) {
    Stream.pipeline(data, client, (err) => { if (err) sendAgain(err) })
  } else {
    client.end(data)
  }
}
runner.suite('Multipart', (it, suite) => {
  suite.before(async () => {
    app = new Application()
    server = new HyperText.HyperTextServer()
    server.setPort(3030)
    app.http.addEngine('http', server.createServer(app.router))
    app.post('/upload/', testUpload())
    await app.start()
    await app.listen()
  })
  suite.after(async () => {
    await app.stop()
  })
  it('should construct', () => {
    Assert.isType('Multipart', new Multipart())
  })
  it('should accept and parse from a capture', () => {
    return new Promise((resolve, reject) => {
      const boundary = '--------------------------131504236582514718146901'
      const headers = {
        'content-type': 'multipart/form-data; boundary=' + boundary,
        'transfer-encoding': 'chunked'
      }
      const file = fs.path.resolve(
        __dirname, 'fixture', 'Multipart', 'article.part'
      )
      const data = isWin ? fs.readFileSync(file) : fs.createReadStream(file)
      sendUpload(headers, data, resolve, reject)
    })
  })
  it('should accept and parse from a capture using quoted boundary', () => {
    return new Promise((resolve, reject) => {
      const boundary = '--------------------------131504236582514718146901'
      const headers = {
        'content-type': 'multipart/form-data; boundary="' + boundary + '"',
        'transfer-encoding': 'chunked'
      }
      const file = fs.path.resolve(
        __dirname, 'fixture', 'Multipart', 'article.part'
      )
      const data = isWin ? fs.readFileSync(file) : fs.createReadStream(file)
      sendUpload(headers, data, resolve, reject)
    })
  })
  it('should accept and parse a multipart locally built request', () => {
    return new Promise((resolve, reject) => {
      const form = buildFormData()
      sendUpload(form.headers, form.data, resolve, reject)
    })
  })
  it('should accept and parse from Multipart.FormBuild', () => {
    return new Promise((resolve, reject) => {
      const form = new Multipart.FormBuild()
      form.add('testField', 'foo')
      form.add('testFile', fs.createReadStream(
        fs.path.resolve(__dirname, 'fixture', 'Multipart', 'article.json'))
      )
      sendUpload(form.getHeaders(), form, resolve, reject)
    })
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
