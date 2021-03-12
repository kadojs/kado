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
const inspect = require('util').inspect
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Stream = require('../lib/Stream')
const fs = require('../lib/FileSystem')
const CRLF = '\r\n'
const DOUBLE_CRLF = `${CRLF}${CRLF}`
const headers128KB = Buffer.allocUnsafe(131072).fill(0x41).toString('ascii')
const FIXTURES_ROOT = fs.path.join(__dirname, 'fixture', 'StreamSlicer')
runner.suite('Stream', (it, suiteStream) => {
  suiteStream.suite('StreamSlicer', (it, suiteStreamSlicer) => {
    it('should construct', () => {
      Assert.isType('StreamSlicer',
        new Stream.StreamSlicer({ boundary: '-----' }))
    })
    it('should end and finish', () => {
      const boundary = 'boundary'
      const writeSep = '--' + boundary
      const writePart = [
        writeSep,
        'Content-Type:   text/plain',
        'Content-Length: 0'
      ].join(CRLF) +
      DOUBLE_CRLF +
      'some data' + CRLF

      const writeEnd = '--' + CRLF

      let firedEnd = false
      let firedFinish = false
      let isPausePush = true
      let firedPauseCallback = false
      let firedPauseFinish = false
      let streamSlicer2 = null

      const afterWrite = () => Assert.isOk(firedFinish, 'Failed to finish')
      const afterEnd = () => {
        streamSlicer.end(writeEnd)
        setImmediate(afterWrite)
      }
      const partEndListener = () => {
        firedEnd = true
        setImmediate(afterEnd)
      }
      const partListener = partReadStream => {
        partReadStream.on('data', () => {})
        partReadStream.on('end', partEndListener)
      }
      const pausePartListener = partReadStream => {
        partReadStream.on('data', function () {})
        partReadStream.on('end', function () {})
        const realPush = partReadStream.push
        partReadStream.push = function fakePush () {
          realPush.apply(partReadStream, arguments)
          if (!isPausePush) { return true }
          isPausePush = false
          return false
        }
      }
      const pauseAfterEnd = () => {
        Assert.isOk(firedPauseCallback, 'Failed to call callback after pause')
        Assert.isOk(firedPauseFinish, 'Failed to finish after pause')
      }
      const pauseAfterWrite = () => {
        streamSlicer2.end(writeEnd)
        setImmediate(pauseAfterEnd)
      }
      const pauseFinish = () => {
        firedPauseFinish = true
      }
      const pausePartCallback = () => {
        firedPauseCallback = true
      }
      const test2 = () => {
        streamSlicer2 = new Stream.StreamSlicer({ boundary: boundary })
        streamSlicer2.on('part', pausePartListener)
        streamSlicer2.on('finish', pauseFinish)
        streamSlicer2.write(writePart + writeSep, 'utf8', pausePartCallback)
        setImmediate(pauseAfterWrite)
      }
      const finishListener = () => {
        Assert.isOk(firedEnd, 'Failed to end before finishing')
        firedFinish = true
        test2()
      }
      const streamSlicer = new Stream.StreamSlicer({ boundary: boundary })
      streamSlicer.on('part', partListener)
      streamSlicer.on('finish', finishListener)
      streamSlicer.write(writePart + writeSep)
    })
    suiteStreamSlicer.suite('HeaderParser', (it) => {
      const tests = [
        {
          what: 'No header',
          source: DOUBLE_CRLF,
          expected: {}
        },
        {
          what: 'Value spacing',
          source: [
            'Content-Type:\t  text/plain',
            'Content-Length:0'
          ].join(CRLF) + DOUBLE_CRLF,
          expected: { 'content-type': ['  text/plain'], 'content-length': ['0'] }
        },
        {
          what: 'Folded values',
          source: [
            `Content-Type:${CRLF} text/plain`,
            `Foo:${CRLF} bar${CRLF} baz`
          ].join(CRLF) + DOUBLE_CRLF,
          expected: { 'content-type': [' text/plain'], foo: [' bar baz'] }
        },
        {
          what: 'Empty values',
          source: [
            'Content-Type:',
            'Foo: '
          ].join(CRLF) + DOUBLE_CRLF,
          expected: { 'content-type': [''], foo: [''] }
        },
        {
          what: 'Max header size (single chunk)',
          source: headers128KB + DOUBLE_CRLF,
          expected: {}
        },
        {
          what: 'Max header size (multiple chunks #1)',
          source: ['ABCDEFGHIJ', headers128KB, DOUBLE_CRLF],
          expected: {}
        },
        {
          what: 'Max header size (multiple chunks #2)',
          source: [headers128KB, headers128KB, DOUBLE_CRLF],
          expected: {}
        }
      ]
      tests.forEach(v => {
        it(`${v.what}`, () => {
          const parser = new Stream.HeaderParser()
          let fired = false
          parser.on('header', header => {
            Assert.isOk(!fired, 'Header event fired more than once')
            fired = true
            Assert.eqDeep(header, v.expected, 'Parsed result mismatch')
          })
          if (!Array.isArray(v.source)) {
            v.source = [v.source]
          }
          v.source.forEach(s => parser.push(s))
          Assert.isOk(fired, 'Did not receive header from parser')
        })
      })
    })
    suiteStreamSlicer.suite('multipart', (it, suiteMultipart) => {
      const tests = [
        {
          what: 'One nested multipart',
          source: 'nested',
          opts: { boundary: 'AaB03x' },
          chunkSize: 32,
          nParts: 2
        },
        {
          what: 'Many parts',
          source: 'many',
          opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
          chunkSize: 16,
          nParts: 7
        },
        {
          what: 'Many parts, wrong boundary',
          source: 'many-wrongboundary',
          opts: { boundary: 'LOLOLOL' },
          chunkSize: 8,
          nParts: 0,
          slicerError: true
        },
        {
          what: 'Many parts, end boundary missing, 1 file open',
          source: 'many-noend',
          opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
          chunkSize: 16,
          nParts: 7,
          nPartErrors: 1,
          slicerError: true
        },
        {
          what: 'One nested multipart with preceding header',
          source: 'nested-full',
          opts: { boundary: 'AaB03x', headerFirst: true },
          chunkSize: 32,
          nParts: 2
        },
        {
          what: 'One nested multipart with preceding header, using setBoundary',
          source: 'nested-full',
          opts: { headerFirst: true },
          chunkSize: 32,
          nParts: 2,
          setBoundary: 'AaB03x'
        }
      ]
      tests.forEach(v => {
        it(`${v.what}`, () => {
          const fixtureBase = fs.path.join(FIXTURES_ROOT, v.source)
          const state = { parts: [], preamble: undefined }

          const streamSlicer = new Stream.StreamSlicer(v.opts)
          let error
          let partErrors = 0
          let finishes = 0

          streamSlicer.on('preamble', p => {
            const preamble = {
              body: undefined,
              bodyLen: 0,
              error: undefined,
              header: undefined
            }
            p.on('header', h => {
              preamble.header = h
              if (v.setBoundary) { streamSlicer.setBoundary(v.setBoundary) }
            })
            p.on('data', data => {
              const copy = Buffer.allocUnsafe(data.length)
              data.copy(copy)
              data = copy
              if (!preamble.body) { preamble.body = [data] } else { preamble.body.push(data) }
              preamble.bodyLen += data.length
            })
            p.on('error', err => {
              preamble.error = err
            })
            p.on('end', () => {
              if (preamble.body) { preamble.body = Buffer.concat(preamble.body, preamble.bodyLen) }
              if (preamble.body || preamble.header) { state.preamble = preamble }
            })
          })
          streamSlicer.on('part', p => {
            const part = {
              body: undefined,
              bodyLen: 0,
              error: undefined,
              header: undefined
            }
            p.on('header', h => {
              part.header = h
            })
            p.on('data', data => {
              if (!part.body) { part.body = [data] } else { part.body.push(data) }
              part.bodyLen += data.length
            })
            p.on('error', err => {
              part.error = err
              ++partErrors
            })
            p.on('end', () => {
              if (part.body) { part.body = Buffer.concat(part.body, part.bodyLen) }
              state.parts.push(part)
            })
          })
          streamSlicer.on('error', err => {
            error = err
          })
          streamSlicer.on('finish', () => {
            Assert.isOk(finishes++ === 0, 'finish emitted multiple times')
            if (v.slicerError) {
              Assert.isOk(error !== undefined, 'Expected error')
            } else {
              Assert.isOk(error === undefined, `Unexpected error: ${error}`)
            }
            let preamble
            const preambleFixture = fs.path.join(fixtureBase, 'preamble')
            const preambleFixtureHeader = preambleFixture + '.header'
            const preambleFixtureError = preambleFixture + '.error'
            if (fs.exists(preambleFixture)) {
              const preBody = fs.readFileSync(preambleFixture)
              if (preBody.length) {
                preamble = {
                  body: preBody,
                  bodyLen: preBody.length,
                  error: undefined,
                  header: undefined
                }
              }
            }
            if (fs.exists(preambleFixtureHeader)) {
              const preHead = JSON.parse(fs.readFileSync(preambleFixtureHeader, 'binary'))
              if (!preamble) {
                preamble = {
                  body: undefined,
                  bodyLen: 0,
                  error: undefined,
                  header: preHead
                }
              } else { preamble.header = preHead }
            }
            if (fs.exists(preambleFixtureError)) {
              const err = new Error(fs.readFileSync(preambleFixtureError, 'binary'))
              if (!preamble) {
                preamble = {
                  body: undefined,
                  bodyLen: 0,
                  error: err,
                  header: undefined
                }
              } else { preamble.error = err }
            }
            Assert.eqDeep(state.preamble, preamble,
              'Preamble mismatch:\n' +
              `Actual:${inspect(state.preamble)}\n` +
              `Expected: ${inspect(preamble)}`
            )
            Assert.eq(state.parts.length, v.nParts,
              'Part count mismatch:\n' +
              `Actual: ${state.parts.length}\n` +
              `Expected: ${v.nParts}`
            )
            if (!v.nPartErrors) { v.nPartErrors = 0 }
            Assert.eq(partErrors, v.nPartErrors,
              'Part errors mismatch:\n' +
              `Actual: ${partErrors}\n` +
              `Expected: ${v.nPartErrors}`
            )
            for (let i = 0, header, body; i < v.nParts; ++i) {
              const partFixture = fs.path.join(fixtureBase, `part${i + 1}`)
              const partFixtureHeader = partFixture + '.header'
              if (fs.exists(partFixture)) {
                body = fs.readFileSync(partFixture)
                if (body.length === 0) { body = undefined }
              } else { body = undefined }
              Assert.eqDeep(state.parts[i].body, body,
                `Part #${i + 1} body mismatch`
              )
              if (fs.exists(partFixtureHeader)) {
                header = fs.readFileSync(partFixtureHeader, 'binary')
                header = JSON.parse(header)
              } else { header = undefined }
              Assert.eqDeep(state.parts[i].header, header,
                `Part #${i + 1} parsed header mismatch:\n` +
                `Actual: ${inspect(state.parts[i].header)}\n` +
                `Expected: ${inspect(header)}`
              )
            }
          })
          const originalFixture = fs.path.join(fixtureBase, 'original')
          fs.createReadStream(originalFixture).pipe(streamSlicer)
        })
      })
      suiteMultipart.suite('extra-trailer', (it) => {
        const tests = [
          {
            what: 'Extra trailer data pushed after finished',
            opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
            chunkSize: 16,
            nParts: 7,
            source: 'many'
          }
        ]
        tests.forEach(v => {
          it(`${v.what}`, () => {
            const fixtureBase = fs.path.join(FIXTURES_ROOT, v.source)
            let n = 0
            const buffer = Buffer.allocUnsafe(v.chunkSize)
            const state = { parts: [] }
            const fd = fs.openSync(fs.path.join(fixtureBase, 'original'), 'r')
            const streamSlicer = new Stream.StreamSlicer(v.opts)
            let error
            let partErrors = 0
            let finishes = 0
            streamSlicer.on('part', function (p) {
              const part = {
                body: undefined,
                bodyLen: 0,
                error: undefined,
                header: undefined
              }
              p.on('header', function (h) {
                part.header = h
              }).on('data', function (data) {
                const copy = Buffer.allocUnsafe(data.length)
                data.copy(copy)
                data = copy
                if (!part.body) { part.body = [data] } else { part.body.push(data) }
                part.bodyLen += data.length
              }).on('error', function (err) {
                part.error = err
                ++partErrors
              }).on('end', function () {
                if (part.body) { part.body = Buffer.concat(part.body, part.bodyLen) }
                state.parts.push(part)
              })
            }).on('error', function (err) {
              error = err
            }).on('finish', function () {
              Assert.isOk(finishes++ === 0, 'finish emitted multiple times')
              if (v.slicerError) {
                Assert.isOk(error !== undefined, 'Expected error')
              } else {
                Assert.isOk(error === undefined, 'Unexpected error')
              }
              if (v.events && v.events.indexOf('part') > -1) {
                Assert.eq(state.parts.length, v.nParts,
                  'Part count mismatch:\n' +
                  `Actual: ${state.parts.length}\n` +
                  `Expected: ${v.nParts}`
                )
                if (!v.npartErrors) { v.npartErrors = 0 }
                Assert.eq(partErrors, v.npartErrors,
                  'Part errors mismatch:\n' +
                  `Actual: ${partErrors}\n` +
                  `Expected: ${v.npartErrors}`
                )
                for (let i = 0, header, body; i < v.nParts; ++i) {
                  const partFixture = fs.path.join(fixtureBase, `part${i + 1}`)
                  const partFixtureHeader = partFixture + '.header'
                  if (fs.exists(partFixture)) {
                    body = fs.readFileSync(partFixture)
                    if (body.length === 0) { body = undefined }
                  } else { body = undefined }
                  Assert.eqDeep(state.parts[i].body, body,
                    `Part #${i + 1} body mismatch`
                  )
                  if (fs.exists(partFixtureHeader)) {
                    header = fs.readFileSync(partFixtureHeader, 'binary')
                    header = JSON.parse(header)
                  } else { header = undefined }
                  Assert.eqDeep(state.parts[i].header, header,
                    `Part #${i + 1} parsed header mismatch:\n` +
                    `Actual: ${inspect(state.parts[i].header)}\n` +
                    `Expected: ${inspect(header)}`
                  )
                }
              }
            })
            while (true) {
              n = fs.readSync(fd, buffer, 0, buffer.length, null)
              if (n === 0) {
                setTimeout(function () {
                  streamSlicer.write('\r\n\r\n\r\n')
                  streamSlicer.end()
                }, 50)
                break
              }
              streamSlicer.write(n === buffer.length ? buffer : buffer.slice(0, n))
            }
            fs.closeSync(fd)
          })
        })
      })
      suiteMultipart.suite('nolisteners', (it) => {
        const tests = [
          {
            what: 'No preamble or part listeners',
            source: 'many',
            opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
            chunkSize: 16,
            nParts: 0
          }
        ]
        tests.forEach(v => {
          it(`${v.what}`, () => {
            const fixtureBase = fs.path.join(FIXTURES_ROOT, v.source)
            let n = 0
            const buffer = Buffer.allocUnsafe(v.chunkSize)
            const state = { done: false, parts: [], preamble: undefined }

            const fd = fs.openSync(fs.path.join(fixtureBase, 'original'), 'r')

            const streamSlicer = new Stream.StreamSlicer(v.opts)
            let error
            let partErrors = 0
            let finishes = 0

            if (v.events && v.events.indexOf('preamble') > -1) {
              streamSlicer.on('preamble', function (p) {
                const preamble = {
                  body: undefined,
                  bodyLen: 0,
                  error: undefined,
                  header: undefined
                }
                p.on('header', h => {
                  preamble.header = h
                })
                p.on('data', data => {
                  const copy = Buffer.allocUnsafe(data.length)
                  data.copy(copy)
                  data = copy
                  if (!preamble.body) {
                    preamble.body = [data]
                  } else {
                    preamble.body.push(data)
                  }
                  preamble.bodyLen += data.length
                })
                p.on('error', err => {
                  preamble.error = err
                })
                p.on('end', () => {
                  if (preamble.body) {
                    preamble.body = Buffer.concat(preamble.body, preamble.bodyLen)
                  }
                  if (preamble.body || preamble.header) {
                    state.preamble = preamble
                  }
                })
              })
            }
            if (v.events && v.events.indexOf('part') > -1) {
              streamSlicer.on('part', p => {
                const part = {
                  body: undefined,
                  bodyLen: 0,
                  error: undefined,
                  header: undefined
                }
                p.on('header', h => { part.header = h })
                p.on('data', data => {
                  const copy = Buffer.allocUnsafe(data.length)
                  data.copy(copy)
                  data = copy
                  if (!part.body) {
                    part.body = [data]
                  } else {
                    part.body.push(data)
                  }
                  part.bodyLen += data.length
                })
                p.on('error', err => {
                  part.error = err
                  ++partErrors
                })
                p.on('end', () => {
                  if (part.body) {
                    part.body = Buffer.concat(part.body, part.bodyLen)
                  }
                  state.parts.push(part)
                })
              })
            }
            streamSlicer.on('error', err => { error = err })
            streamSlicer.on('finish', function () {
              Assert.isOk(finishes++ === 0, 'finish emitted multiple times')
              if (v.slicerError) {
                Assert.isOk(error !== undefined, 'Expected error')
              } else {
                Assert.isOk(error === undefined, 'Unexpected error')
              }
              if (v.events && v.events.indexOf('preamble') > -1) {
                let preamble
                const preambleFixture = fs.path.join(fixtureBase, 'preamble')
                const preambleFixtureHeader = preambleFixture + '.header'
                const preambleFixtureError = preambleFixture + '.error'
                if (fs.exists(preambleFixture)) {
                  const preBody = fs.readFileSync(preambleFixture)
                  if (preBody.length) {
                    preamble = {
                      body: preBody,
                      bodyLen: preBody.length,
                      error: undefined,
                      header: undefined
                    }
                  }
                }
                if (fs.exists(preambleFixtureHeader)) {
                  const preHead = JSON.parse(fs.readFileSync(preambleFixtureHeader, 'binary'))
                  if (!preamble) {
                    preamble = {
                      body: undefined,
                      bodyLen: 0,
                      error: undefined,
                      header: preHead
                    }
                  } else {
                    preamble.header = preHead
                  }
                }
                if (fs.exists(preambleFixtureError)) {
                  const err = new Error(fs.readFileSync(preambleFixtureError, 'binary'))
                  if (!preamble) {
                    preamble = {
                      body: undefined,
                      bodyLen: 0,
                      error: err,
                      header: undefined
                    }
                  } else {
                    preamble.error = err
                  }
                }

                Assert.eqDeep(state.preamble, preamble,
                  'Preamble mismatch:\n' +
                  `Actual:${inspect(state.preamble)}\n` +
                  `Expected: ${inspect(preamble)}`
                )
              }

              if (v.events && v.events.indexOf('part') > -1) {
                Assert.eq(state.parts.length, v.nParts,
                  'Part count mismatch:\n' +
                  `Actual: ${state.parts.length}\n` +
                  `Expected: ${v.nParts}`
                )
                if (!v.npartErrors) {
                  v.npartErrors = 0
                }
                Assert.eq(partErrors, v.npartErrors,
                  'Part errors mismatch:\n' +
                  `Actual: ${partErrors}\n` +
                  `Expected: ${v.npartErrors}`
                )
                for (let i = 0, header, body; i < v.nParts; ++i) {
                  const partFixture = fs.path.join(fixtureBase, `part${i + 1}`)
                  const partFixtureHeader = partFixture + '.header'
                  if (fs.exists(partFixture)) {
                    body = fs.readFileSync(partFixture)
                    if (body.length === 0) {
                      body = undefined
                    }
                  } else {
                    body = undefined
                  }
                  Assert.eqDeep(state.parts[i].body, body,
                    `Part #${i + 1} body mismatch`
                  )
                  if (fs.exists(partFixtureHeader)) {
                    header = fs.readFileSync(partFixtureHeader, 'binary')
                    header = JSON.parse(header)
                  } else {
                    header = undefined
                  }
                  Assert.eqDeep(state.parts[i].header, header,
                    `Part #${i + 1} parsed header mismatch:\n` +
                    `Actual: ${inspect(state.parts[i].header)}\n` +
                    `Expected: ${inspect(header)}`
                  )
                }
              }
            })
            while (true) {
              n = fs.readSync(fd, buffer, 0, buffer.length, null)
              if (n === 0) {
                streamSlicer.end()
                break
              }
              streamSlicer.write(n === buffer.length ? buffer : buffer.slice(0, n))
            }
            fs.closeSync(fd)
          })
        })
      })
    })
  })
  suiteStream.suite('StreamSearch', (it) => {
    const needle = Buffer.from('\r\n')
    const streamSearch = new Stream.StreamSearch(needle)
    it('should construct', () => {
      Assert.isType('StreamSearch', streamSearch)
    })
    it('should search for needles', () => {
      const rv = []
      const chunks = [
        Buffer.from('foo'),
        Buffer.from(' bar'),
        Buffer.from('\r'),
        Buffer.from('\n'),
        Buffer.from('baz, hello\r'),
        Buffer.from('\n world.'),
        Buffer.from('\r\n Node.JS rules!!\r\n\r\n')
      ]
      streamSearch.on('info', (isMatch, data, start, end) => {
        const _d = { match: false }
        if (data) { _d.data = inspect(data.toString('ascii', start, end)) }
        if (isMatch) { _d.match = true }
        rv.push(_d)
      })
      for (let i = 0, len = chunks.length; i < len; ++i) {
        streamSearch.push(chunks[i])
      }
      Assert.eqDeep(rv, [
        { match: false, data: "'foo'" },
        { match: false, data: "' bar'" },
        { match: true },
        { match: false, data: "'baz, hello'" },
        { match: true },
        { match: false, data: "' world.'" },
        { match: true },
        { match: true, data: "' Node.JS rules!!'" },
        { match: true, data: "''" }
      ])
    })
  })
})

if (require.main === module) runner.execute().then(code => process.exit(code))
