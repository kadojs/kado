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
const { createHash } = require('crypto')
const Archive = require('../lib/Archive')
runner.suite('Archive', (it, archive) => {
  it('should have Unzip', () => {
    Assert.isType('Function', Archive.Unzip)
    Assert.isType('Function', Archive.Unzip.fromRandomAccessReader)
    Assert.isType('Function', Archive.Unzip.fromBuffer)
    Assert.isType('AsyncFunction', Archive.Unzip.fromFd)
  })
  archive.suite('Unzip', (it, unzip) => {
    const fixturePath = 'fixture/Archive'
    const fixtures = fs.readdirSync(`${fs.path.join(__dirname, fixturePath)}`)
      .map((v) => v.replace(/\.js$/, ''))
    for (const fixtureFile of fixtures) {
      const {
        count: expectedCount,
        names: expectedNames,
        sizes: expectedSizes,
        sha1s: expectedSha1s,
        buffer: zipBuffer
      } = require(`./${fixturePath}/${fixtureFile}`)
      unzip.suite(fixtureFile, (it) => {
        let zipFile
        it('.fromBuffer(buf)', async () => {
          zipFile = await new Promise((resolve, reject) => {
            Archive.Unzip.fromBuffer(
              zipBuffer,
              { lazyEntries: true },
              (err, result) => {
                if (!err) { resolve(result) } else { reject(err) }
              })
          })
          Assert.isType('ZipFile', zipFile)
        })
        it(`.entryCount === ${expectedCount}`, () => {
          Assert.eq(expectedCount, zipFile.entryCount)
        })
        let names, sizes, sha1s
        it('(parse entries)', async () => {
          const result = await new Promise((resolve, reject) => {
            const rv = { names: [], sizes: [], sha1s: [] }
            zipFile.on('error', (err) => {
              reject(err)
            })
            zipFile.on('entry', (ent) => {
              if (!/\/$/.test(ent.fileName)) {
                rv.names.push(ent.fileName)
                rv.sizes.push(ent.uncompressedSize)
                zipFile.openReadStream(ent, (err, readStream) => {
                  let data = ''
                  if (err) throw err
                  readStream.on('end', () => {
                    const shasum = createHash('sha1')
                    shasum.update(data)
                    rv.sha1s.push(shasum.digest('hex'))
                    zipFile.readEntry()
                  })
                  readStream.on('data', (chunk) => {
                    data += chunk
                  })
                })
              } else zipFile.readEntry()
            })
            zipFile.on('end', () => {
              zipFile.close()
              resolve(rv)
            })
            zipFile.readEntry()
          })
          names = result.names
          Assert.eq(names, result.names)
          sizes = result.sizes
          Assert.eq(sizes, result.sizes)
          sha1s = result.sha1s
          Assert.eq(sha1s, result.sha1s)
        })
        for (let i = 0; i < expectedCount; i++) {
          it(`entry[${i}] name === '${expectedNames[i]}'`, () => {
            Assert.eq(expectedNames[i], names[i])
          })
          it(`entry[${i}] size === '${expectedSizes[i]}'`, () => {
            Assert.eq(expectedSizes[i], sizes[i])
          })
          it(`entry[${i}] sha1 === '${expectedSha1s[i]}'`, () => {
            Assert.eq(expectedSha1s[i], sha1s[i])
          })
        }
      })
    }
  })
})
if (require.main === module) {
  runner.execute().then((code) => {
    process.exitCode = code
  })
}
