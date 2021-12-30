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
    let zipFile
    it('.fromBuffer(buf)', async () => {
      zipFile = await new Promise((resolve, reject) => {
        Archive.Unzip.fromBuffer(
          require('./fixture/Archive/zipBuffer'),
          { lazyEntries: true },
          (err, result) => {
            if (!err) { resolve(result) } else { reject(err) }
          })
      })
      Assert.isType('ZipFile', zipFile)
    })
    it('.fromBuffer(buf).entryCount === 3', () => {
      Assert.eq(3, zipFile.entryCount)
    })
    it('.fromBuffer(buf).entries...', async () => {
      const result = await new Promise((resolve, reject) => {
        const names = []
        const datas = []
        zipFile.on('error', (err) => {
          reject(err)
        })
        zipFile.on('entry', (ent) => {
          if (!/\/$/.test(ent.fileName)) {
            names.push(ent.fileName)
            zipFile.openReadStream(ent, (err, readStream) => {
              let data = ''
              if (err) throw err
              readStream.on('end', () => {
                datas.push(data)
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
          resolve([names, datas])
        })
        zipFile.readEntry()
      })
      const names = result[0]
      Assert.eqDeep(['test1', 'test2', 'test3'], names)
      const datas = result[1]
      const sha1s = []
      for (let i = 0; i < datas.length; i++) {
        const shasum = require('crypto').createHash('sha1')
        shasum.update(datas[i])
        sha1s.push(shasum.digest('hex'))
      }
      Assert.eq('52478e87589ab97f0e5cce8d8d1746d3a447b9fb', sha1s[0])
      Assert.eq('951a0daccf0eace234fed6eb69dba427af7e6931', sha1s[1])
      Assert.eq('f59fc3328de32ce4ccf5a21e2798f05f4b87c566', sha1s[2])
    })
  })
})
if (require.main === module) {
  runner.execute().then((code) => {
    process.exitCode = code
  })
}
