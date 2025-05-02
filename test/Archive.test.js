/**
 * Kado - Modern JavaScript Framework <https://kado.org>
 * Copyright © 2013-2025 Bryan Tong, NULLIVEX LLC.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const fs = require('../lib/FileSystem')
const { createHash } = require('crypto')
const Archive = require('../lib/Archive')
const fixturePath = 'fixture/Archive'
runner.suite('Archive', (it, archive) => {
  it('should have Unzip', () => {
    Assert.isType('Function', Archive.Unzip)
    Assert.isType('Function', Archive.Unzip.fromRandomAccessReader)
    Assert.isType('Function', Archive.Unzip.fromBuffer)
    Assert.isType('AsyncFunction', Archive.Unzip.fromFd)
  })
  archive.suite('Unzip', (it, unzip) => {
    const fixtures = fs.readdirSync(`${fs.path.join(__dirname, fixturePath)}`)
      .filter((v) => /\.zip\.js$/.test(v))
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
  runner.execute().then(code => { process.exitCode = +code })
}
