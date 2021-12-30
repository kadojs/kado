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
const Archive = require('../lib/Archive')
runner.suite('Archive', (it, archive) => {
  it('should have Unzip', () => {
    Assert.isType('Function', Archive.Unzip)
    Assert.isType('Function', Archive.Unzip.fromRandomAccessReader)
    Assert.isType('Function', Archive.Unzip.fromBuffer)
    Assert.isType('AsyncFunction', Archive.Unzip.fromFd)
  })
  archive.suite('Unzip', (it) => {
    const {
      count: expectedCount,
      names: expectedNames,
      sizes: expectedSizes,
      sha1s: expectedSha1s,
      buffer: zipBuffer
    } = require('./fixture/Archive/test.zip')
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
    it(`.fromBuffer(buf).entryCount === ${expectedCount}`, () => {
      Assert.eq(expectedCount, zipFile.entryCount)
    })
    it('.fromBuffer(buf).entries...', async () => {
      const { names, sizes, sha1s } = await new Promise((resolve, reject) => {
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
                const shasum = require('crypto').createHash('sha1')
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
      Assert.eqDeep(expectedNames, names)
      Assert.eqDeep(expectedSizes, sizes)
      Assert.eqDeep(expectedSha1s, sha1s)
    })
  })
})
if (require.main === module) {
  runner.execute().then((code) => {
    process.exitCode = code
  })
}
