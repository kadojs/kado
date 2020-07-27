'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
const Assert = require('../lib/Assert')
const fs = require('../lib/FileSystem')
const Multipart = require('../lib/Multipart')
runner.suite('Multipart', (it) => {
  it('should construct', () => {
    Assert.isType('Multipart', new Multipart())
  })
  it('should accept a multipart/form-data post request', async () => {
    const http = require('http')
    const router = async (req, res) => {
      const multipart = new Multipart.FormData({ headers: req.headers })
      Assert.isType('FormData', multipart)
      let gotFile = false
      let gotField = false
      const filePromise = []
      const file = {}
      multipart.on('field', (fieldname, val, fieldnameShort, valShort) => {
        Assert.isType('string', fieldname)
        Assert.isType('string', val)
        Assert.eq(false, fieldnameShort)
        Assert.eq(false, valShort)
        gotField = true
      })
      multipart.on('file', (field, stream, filename, encoding, mimeType) => {
        Assert.isType('string', field)
        Assert.isType('ChunkStream', stream)
        Assert.isType('string', filename)
        Assert.isType('string', encoding)
        Assert.isType('string', mimeType)
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
      multipart.on('error', (err) => { throw err })
      multipart.on('finish', async () => {
        await Promise.all(filePromise)
        Assert.isOk(gotField, 'Missing field')
        Assert.isOk(gotFile, 'Missing file')
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ status: 'ok' }))
      })
      req.pipe(multipart)
    }
    const server = http.createServer(router)
    server.on('error', (err) => { throw err })
    server.listen(3030)
    const inputFile = fs.path.resolve(
      __dirname, 'fixture', 'Multipart', 'article.part')
    const input = fs.createReadStream(inputFile)
    const promise = new Promise((resolve, reject) => {
      const boundary = '--------------------------131504236582514718146901'
      const requestHeaders = {
        'content-type': 'multipart/form-data; boundary=' + boundary,
        'transfer-encoding': 'chunked'
      }
      const client = http.request({
        port: 3030,
        host: 'localhost',
        method: 'POST',
        path: '/upload/',
        headers: requestHeaders
      })
      let buf = ''
      client.on('error', (err) => { reject(err) })
      client.on('response', async (res) => {
        res.on('data', (chunk) => { buf += chunk.toString('utf-8') })
        res.on('end', () => {
          try {
            const rv = JSON.parse(buf)
            Assert.isOk(rv.status === 'ok', 'Invalid response')
            server.close()
            resolve()
          } catch (err) { reject(err) }
        })
      })
      input.pipe(client)
    })
    await promise
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
