'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2021 Bryan Tong, NULLIVEX LLC. All rights reserved.
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

const fs = require('./FileSystem')
const Format = require('./Format')
const GeoIP = require('./GeoIP')
const net = require('./Network')
const { Unzip } = require('./Archive')

const http = require('http')
const https = require('https')

const lazy = require('lazy')

const lineCount = (filePath) => new Promise((resolve, reject) => {
  let lineCount = -1
  fs.createReadStream(filePath)
    .on('data', (buffer) => {
      let idx = -1
      do {
        idx = buffer.indexOf(10, idx + 1)
        lineCount++
      } while (idx !== -1)
    }).on('end', () => {
      resolve(lineCount)
    }).on('error', reject)
})

module.exports = class GeoIPUpdate extends GeoIP {
  static getInstance () {
    return new GeoIPUpdate()
  }

  async updateData (key = 'free') {
    const userAgent =
      'Mozilla/5.0 (Windows NT 6.1; WOW64)' +
      ' AppleWebKit/537.36 (KHTML, like Gecko)' +
      ' Chrome/39.0.2171.36 Safari/537.36'

    const Address6 = net.IPAddr6
    const Address4 = net.IPAddr4

    const log = console.log
    const logRed = (msg) => { log(Format.color(msg, 'Red')) }
    const logGreen = (msg) => { log(Format.color(msg, 'Green')) }
    const logYellowBold = (msg) => { log(Format.color(msg, 'Yellow', null, 'Bold')) }
    const logDone = () => { logGreen(' DONE') }
    const logError = (msg) => { log(`${Format.color('ERROR', 'Red')}: ${msg}`) }

    const iconvDecodeLatin1 = (buf) => (new TextDecoder('latin1')).decode(buf)
    const iconvDecodeUTF8 = (buf) => (new TextDecoder('utf8')).decode(buf)

    const databases = [
      {
        type: 'country',
        url: 'https://geoip.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country-CSV&suffix=zip',
        checksum: 'https://geoip.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country-CSV&suffix=zip.md5',
        fileName: 'GeoLite2-Country-CSV.zip',
        src: [
          'GeoLite2-Country-Locations-en.csv',
          'GeoLite2-Country-Blocks-IPv4.csv',
          'GeoLite2-Country-Blocks-IPv6.csv'
        ],
        dest: [
          '',
          'geoip-country.dat',
          'geoip-country6.dat'
        ]
      },
      {
        type: 'city',
        url: 'https://geoip.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&suffix=zip',
        checksum: 'https://geoip.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&suffix=zip.md5',
        fileName: 'GeoLite2-City-CSV.zip',
        src: [
          'GeoLite2-City-Locations-en.csv',
          'GeoLite2-City-Blocks-IPv4.csv',
          'GeoLite2-City-Blocks-IPv6.csv'
        ],
        dest: [
          'geoip-city-names.dat',
          'geoip-city.dat',
          'geoip-city6.dat'
        ]
      }
    ]

    const args = process.argv.slice(2)
    let licenseKey = args.find((arg) => arg.match(/^license_key=[a-zA-Z0-9]+/) !== null)
    const specialKeys = ['local', 'free']
    if (typeof licenseKey === 'undefined') {
      if (typeof key === 'string') {
        if (key === 'local') {
          licenseKey = 'local'
          // special key uses local data source for testing
          databases[0].url = 'http://127.0.0.1/GeoLite2-Country-CSV.zip'
          databases[0].checksum = 'http://127.0.0.1/GeoLite2-Country-CSV.zip.md5'
          databases[1].url = 'http://127.0.0.1/GeoLite2-City-CSV.zip'
          databases[1].checksum = 'http://127.0.0.1/GeoLite2-City-CSV.zip.md5'
        } else if (key === 'free') {
          licenseKey = 'free'
          // special key uses free dataset from geoip-lite
        } else {
          licenseKey = `license_key=${key}`
        }
      } else if (typeof process.env.LICENSE_KEY !== 'undefined') {
        licenseKey = `license_key=${process.env.LICENSE_KEY}`
      }
    }
    if (typeof licenseKey === 'string' && specialKeys.indexOf(licenseKey) === -1) {
      ;[0, 1].forEach((idx) => {
        ;['url', 'checksum'].forEach((key) => {
          databases[idx][key] = [databases[idx][key], licenseKey].join('&')
        })
      })
    }
    const dataPath = this.geodatadir
    const tmpPath = fs.path.join(this.geodatadir, 'tmp')
    const countryLookup = {}
    const cityLookup = {}

    const mkdirP = (path) => {
      if (!fs.exists(path)) fs.mkdirSync(path, { recursive: true })
    }
    const rmR = (path) => {
      if (fs.exists(path)) fs.rmSync(path, { recursive: true })
      if (fs.exists(path)) fs.rmdirSync(path)
    }

    // Ref: http://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript
    // Return array of string values, or NULL if CSV string not well formed.

    const tryFixingLine = (line) => {
      let pos1 = 0
      let pos2 = -1
      // escape quotes
      line = line.replace(/""/, '\\"').replace(/'/g, "\\'")

      while (pos1 < line.length && pos2 < line.length) {
        pos1 = pos2
        pos2 = line.indexOf(',', pos1 + 1)
        if (pos2 < 0) pos2 = line.length
        if (
          line.indexOf("'", (pos1 || 0)) > -1 &&
          line.indexOf("'", pos1) < pos2 &&
          line[pos1 + 1] !== '"' &&
          line[pos2 - 1] !== '"'
        ) {
          line =
            line.substr(0, pos1 + 1) +
            '"' + line.substr(pos1 + 1, pos2 - pos1 - 1) + '"' +
            line.substr(pos2, line.length - pos2)
          pos2 = line.indexOf(',', pos2 + 1)
          if (pos2 < 0) pos2 = line.length
        }
      }
      return line
    }

    const CSVtoArray = (text) => {
      const reValid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
      const reValue = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
      // Return NULL if input string is not well formed CSV string.
      if (!reValid.test(text)) {
        text = tryFixingLine(text)
        if (!reValid.test(text)) { return null }
      }
      const a = [] // Initialize array to receive values.
      text.replace(reValue, // "Walk" the string using replace with callback.
        (m0, m1, m2, m3) => {
          // Remove backslash from \' in single quoted values.
          if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"))
          // Remove backslash from \" in double quoted values.
          else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"').replace(/\\'/g, "'"))
          else if (m3 !== undefined) a.push(m3)
          return '' // Return empty string.
        })
      // Handle special case of empty last value.
      if (/,\s*$/.test(text)) a.push('')
      return a
    }

    const getHTTPOptions = (downloadUrl) => {
      const { URL } = require('url')
      const options = new URL(downloadUrl)
      options.headers = {
        'User-Agent': userAgent
      }

      if (process.env.http_proxy || process.env.https_proxy) {
        try {
          const HttpsProxyAgent = require('https-proxy-agent')
          options.agent = new HttpsProxyAgent(process.env.http_proxy || process.env.https_proxy)
        } catch (e) {
          console.error('Install https-proxy-agent to use an HTTP/HTTPS proxy')
          process.exitCode = -1
        }
      }

      return options
    }

    const check = (database) => new Promise((resolve, reject) => {
      if (args.indexOf('force') !== -1) {
        // we are forcing database upgrade,
        // so not even using checksums
        resolve({ database: database })
      }
      const checksumUrl = database.checksum
      if (typeof checksumUrl === 'undefined') {
        // no checksum url to check, skipping
        resolve({ database: database })
      }
      // read existing checksum file
      database.checkValue = this.dataVersions[database.type]
      log('Checking ', database.fileName)
      const onResponse = (response) => {
        const status = response.statusCode
        if (status !== 200) {
          log(Format.color('ERROR', 'Red') +
            ': HTTP Request Failed [%d %s]', status, http.STATUS_CODES[status]
          )
          client.destroy()
          process.exitCode = -1
        } else {
          let str = ''
          response.on('data', (chunk) => { str += chunk })
          response.on('end', () => {
            str = str.trim()
            if (str && str.length) {
              if (str === database.checkValue) {
                logGreen(`Database "${database.type}" is up to date`)
                database.skip = true
              } else {
                logGreen(`Database ${database.type} has new data`)
                database.checkValue = str
              }
              resolve({ database: database })
            } else {
              const errorMsg = `Could not retrieve checksum for ${database.type}`
              logError(errorMsg)
              logRed('Aborting')
              log('Run with "force" to update without checksum')
              client.destroy()
              reject(new Error(errorMsg))
            }
          })
        }
      }
      const client =
        ((/^https:/.test(checksumUrl)) ? https : http)
          .get(getHTTPOptions(checksumUrl), onResponse)
    })

    const fetch = (database) => new Promise((resolve, reject) => {
      if (database.skip) {
        return resolve({ database: database })
      }
      const downloadUrl = database.url
      let fileName = database.fileName
      const gzip = fs.path.extname(fileName) === '.gz'
      if (gzip) {
        fileName = fileName.replace('.gz', '')
      }
      const tmpFile = fs.path.join(tmpPath, fileName)
      if (fs.exists(tmpFile)) {
        return resolve({ database: database, tmpFile: tmpFile, fileName: fileName })
      }
      mkdirP(tmpPath)
      const onResponse = (response) => {
        const status = response.statusCode
        if (status !== 200) {
          const errorMsg =
            `HTTP Request Failed [${status} ${http.STATUS_CODES[status]}]`
          logError(errorMsg)
          client.destroy()
          return reject(new Error(errorMsg))
        }
        let tmpFilePipe
        const tmpFileStream = fs.createWriteStream(tmpFile)
        if (gzip) {
          tmpFilePipe = response.pipe(fs.zlib.createGunzip()).pipe(tmpFileStream)
        } else {
          tmpFilePipe = response.pipe(tmpFileStream)
        }
        tmpFilePipe.on('close', () => {
          logDone()
          return resolve({ database: database, tmpFile: tmpFile, fileName: fileName })
        })
      }
      process.stdout.write('Retrieving ' + fileName + ' ...')
      const client =
        ((/^https:/.test(downloadUrl)) ? https : http)
          .get(getHTTPOptions(downloadUrl), onResponse)
    })

    const extract = (tmpFile, fileName, database) => new Promise((resolve, reject) => {
      if (database.skip) {
        return resolve({ database: database })
      }
      if (fs.path.extname(fileName) !== '.zip') {
        resolve({ database: database })
      } else {
        process.stdout.write('Extracting ' + fileName + ' ...')
        Unzip.open(tmpFile, { autoClose: true, lazyEntries: true }, (err, zipfile) => {
          if (err) {
            reject(err)
          }
          zipfile.readEntry()
          zipfile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
              // Directory file names end with '/'.
              // Note that entries for directories themselves are optional.
              // An entry's fileName implicitly requires its parent directories to exist.
              zipfile.readEntry()
            } else {
              // file entry
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) {
                  throw err
                }
                readStream.on('end', () => { zipfile.readEntry() })
                const filePath = entry.fileName.split('/')
                // filePath will always have length >= 1, as split() always returns an array of at least one string
                const fileName = filePath[filePath.length - 1]
                readStream.pipe(fs.createWriteStream(fs.path.join(tmpPath, fileName)))
              })
            }
          })
          zipfile.once('end', () => {
            logDone()
            return resolve({ database: database })
          })
        })
      }
    })

    const rename = (tmpFile, fileName, database) => new Promise((resolve) => {
      if (!database.skip) {
        fs.renameSync(tmpFile, fs.path.join(dataPath, fileName))
      }
      return resolve({ database: database })
    })

    const progress = Format.ProgressBar(
      '  [:bar] :current/:total :percent :rate/s :etas',
      {
        stream: process.stdout,
        renderThrottle: 5000,
        total: 1,
        width: 50,
        complete: '=',
        incomplete: '-'
      }
    )
    const progressTick = (l) => { progress.tick(); return l }

    const processLookupCountry = (src) => new Promise((resolve) => {
      progress.setFmt(
        '  [:bar] :current/:total :percent :rate/s :etas'
      )
      const tmpDataFile = fs.path.join(tmpPath, src)
      lineCount(tmpDataFile).then((linesTotal) => {
        progress.setTotal(linesTotal)
        progress.update(0)
        lazy(fs.createReadStream(tmpDataFile))
          .lines
          .map(progressTick)
          .map(iconvDecodeLatin1)
          .skip(1)
          .map((line) => {
            const fields = CSVtoArray(line)
            if (!fields || fields.length < 6) {
              log('weird line: %s::', line)
              return false
            }
            countryLookup[fields[0]] = fields[4]
            return true
          })
          .on('pipe', resolve)
      })
    })

    const processCountryData = (src, dest) => new Promise((resolve) => {
      progress.setFmt(
        `  [:bar] :current/:total :percent :rate/s :etas > ${dest}`
      )
      const processLine = (line) => {
        const fields = CSVtoArray(line)
        if (!fields || fields.length < 6) {
          log('weird line: %s::', line)
          return
        }
        let sip
        let eip
        let rngip
        const cc = countryLookup[fields[1]]
        let b
        let bsz
        let i
        if (cc) {
          if (fields[0].match(/:/)) {
            // IPv6
            bsz = 34
            rngip = Address6(fields[0])
            sip = net.inetAtoN(rngip.startAddress().correctForm())
            eip = net.inetAtoN(rngip.endAddress().correctForm())
            b = Buffer.alloc(bsz)
            for (i = 0; i < sip.length; i++) {
              b.writeUInt32BE(sip[i], i * 4)
            }
            for (i = 0; i < eip.length; i++) {
              b.writeUInt32BE(eip[i], 16 + (i * 4))
            }
          } else {
            // IPv4
            bsz = 10
            rngip = Address4(fields[0])
            sip = parseInt(rngip.startAddress().bigInteger().toString(10), 10)
            eip = parseInt(rngip.endAddress().bigInteger().toString(10), 10)
            b = Buffer.alloc(bsz)
            b.fill(0)
            b.writeUInt32BE(sip, 0)
            b.writeUInt32BE(eip, 4)
          }
          b.write(cc, bsz - 2)
          fs.writeSync(datFile, b, 0, bsz, null)
        }
      }
      const dataFile = fs.path.join(dataPath, dest)
      const tmpDataFile = fs.path.join(tmpPath, src)
      rmR(dataFile)
      mkdirP(dataPath)
      const datFile = fs.openSync(dataFile, 'w')
      lineCount(tmpDataFile).then((linesTotal) => {
        progress.setTotal(linesTotal)
        progress.update(0)
        lazy(fs.createReadStream(tmpDataFile))
          .lines
          .map(progressTick)
          .map(iconvDecodeLatin1)
          .skip(1)
          .map(processLine)
          .on('pipe', resolve)
      })
    })

    const processCityData = (src, dest) => new Promise((resolve) => {
      progress.setFmt(
        `  [:bar] :current/:total :percent :rate/s :etas > ${dest}`
      )
      const dataFile = fs.path.join(dataPath, dest)
      const tmpDataFile = fs.path.join(tmpPath, src)
      rmR(dataFile)
      const datFile = fs.openSync(dataFile, 'w')
      lineCount(tmpDataFile).then((linesTotal) => {
        progress.setTotal(linesTotal)
        progress.update(0)
        const processLine = (line) => {
          if (line.match(/^Copyright/) || !line.match(/\d/)) {
            return
          }
          const fields = CSVtoArray(line)
          if (!fields) {
            log('weird line: %s::', line)
            return
          }
          let sip
          let eip
          let rngip
          let locId
          let b
          let bsz
          let lat
          let lon
          let area
          let i
          if (fields[0].match(/:/)) {
            // IPv6
            let offset = 0
            bsz = 48
            rngip = Address6(fields[0])
            sip = net.inetAtoN(rngip.startAddress().correctForm())
            eip = net.inetAtoN(rngip.endAddress().correctForm())
            locId = parseInt(fields[1], 10)
            locId = cityLookup[locId]
            b = Buffer.alloc(bsz)
            b.fill(0)
            for (i = 0; i < sip.length; i++) {
              b.writeUInt32BE(sip[i], offset)
              offset += 4
            }
            for (i = 0; i < eip.length; i++) {
              b.writeUInt32BE(eip[i], offset)
              offset += 4
            }
            b.writeUInt32BE(locId >>> 0, 32)
            lat = Math.round(parseFloat(fields[7]) * 10000)
            lon = Math.round(parseFloat(fields[8]) * 10000)
            area = parseInt(fields[9], 10)
            b.writeInt32BE(lat, 36)
            b.writeInt32BE(lon, 40)
            b.writeInt32BE(area, 44)
          } else {
            // IPv4
            bsz = 24
            rngip = Address4(fields[0])
            sip = parseInt(rngip.startAddress().bigInteger(), 10)
            eip = parseInt(rngip.endAddress().bigInteger(), 10)
            locId = parseInt(fields[1], 10)
            locId = cityLookup[locId]
            b = Buffer.alloc(bsz)
            b.fill(0)
            b.writeUInt32BE(sip >>> 0, 0)
            b.writeUInt32BE(eip >>> 0, 4)
            b.writeUInt32BE(locId >>> 0, 8)
            lat = Math.round(parseFloat(fields[7]) * 10000)
            lon = Math.round(parseFloat(fields[8]) * 10000)
            area = parseInt(fields[9], 10)
            b.writeInt32BE(lat, 12)
            b.writeInt32BE(lon, 16)
            b.writeInt32BE(area, 20)
          }
          fs.writeSync(datFile, b, 0, b.length, null)
        }
        lazy(fs.createReadStream(tmpDataFile))
          .lines
          .map(progressTick)
          .map(iconvDecodeLatin1)
          .skip(1)
          .map(processLine)
          .on('pipe', resolve)
      })
    })

    const processCityDataNames = (src, dest) => new Promise((resolve) => {
      progress.setFmt(
        `  [:bar] :current/:total :percent :rate/s :etas > ${dest}`
      )
      const dataFile = fs.path.join(dataPath, dest)
      const tmpDataFile = fs.path.join(tmpPath, src)
      rmR(dataFile)
      const datFile = fs.openSync(dataFile, 'w')
      lineCount(tmpDataFile).then((linesTotal) => {
        progress.setTotal(linesTotal)
        progress.update(0)
        let locId = null
        let linesCount = 0
        const processLine = (line) => {
          if (line.match(/^Copyright/) || !line.match(/\d/)) {
            return
          }
          const sz = 88
          const fields = CSVtoArray(line)
          if (!fields) {
            // lot's of cities contain ` or ' in the name and can't be parsed correctly with current method
            log('weird line: %s::', line)
            return
          }
          locId = parseInt(fields[0])
          cityLookup[locId] = linesCount
          const cc = fields[4]
          const rg = fields[6]
          const city = fields[10]
          const metro = parseInt(fields[11])
          // other possible fields to include
          const tz = fields[12]
          const eu = fields[13]
          const b = Buffer.alloc(sz)
          b.fill(0)
          b.write(cc, 0)// country code
          b.write(rg, 2)// region
          if (metro) {
            b.writeInt32BE(metro, 5)
          }
          b.write(eu, 9)// is in eu
          b.write(tz, 10)// timezone
          b.write(city, 42)// cityname
          fs.writeSync(datFile, b, 0, b.length, null)
          linesCount++
        }
        lazy(fs.createReadStream(tmpDataFile))
          .lines
          .map(progressTick)
          .map(iconvDecodeUTF8)
          .skip(1)
          .map(processLine)
          .on('pipe', resolve)
      })
    })

    const processData = (database) => new Promise((resolve) => {
      if (database.skip) {
        return resolve({ database: database })
      }
      (async () => {
        const type = database.type
        const src = database.src
        const dest = database.dest
        if (type === 'country') {
          if (Array.isArray(src)) {
            log('Loading Country Lookup Data ...')
            processLookupCountry(src[0])
              .then(async () => {
                progress.update(1)
                log('Processing Country Data ...')
                return await processCountryData(src[1], dest[1])
              })
              .then(async () => {
                progress.update(1)
                return await processCountryData(src[2], dest[2])
              })
              .then(() => {
                progress.update(1)
                process.stdout.write(' ...')
                logDone()
                resolve({ database: database })
              })
          } else {
            log('Processing Country Data ...')
            processCountryData(src, dest)
              .then(() => {
                progress.update(1)
                resolve({ database: database })
              })
          }
        } else if (type === 'city') {
          log('Processing City Names Data ...')
          await processCityDataNames(src[0], dest[0])
            .then(async () => {
              progress.update(1)
              log('Processing City Data ...')
              return await processCityData(src[1], dest[1])
            })
            .then(async () => {
              progress.update(1)
              await processCityData(src[2], dest[2])
            })
            .then(() => {
              progress.update(1)
              process.stdout.write(' ...')
              logDone()
              resolve({ database: database })
            })
        }
      })()
    })

    const updateChecksum = (database) => new Promise((resolve, reject) => {
      if (database.skip || !database.checkValue) {
        // don't need to update checksums cause it was not fetched or did not change
        return resolve()
      }
      fs.writeFile(
        fs.path.join(dataPath, database.type + '.checksum'),
        database.checkValue,
        { encoding: 'utf8' }
      )
        .then(resolve)
        .catch((err) => {
          if (err) {
            logRed('Failed to Update checksums.')
            log(`Database: ${database.type}`)
            reject(new Error(
              'Failed to Update checksums. ' +
              `Database: ${database.type}`
            ))
          }
        })
    })

    // main code entry
    if (!licenseKey) {
      logError('Missing license_key')
      process.exitCode = 1
    } else {
      rmR(tmpPath)
      mkdirP(tmpPath)
      if (licenseKey === 'free') {
        log(Format.color('Downloading free dataset', 'Yellow'))
        const freeUrlPrefix = 'https://kado.org/geoip/' // 'https://raw.githubusercontent.com/geoip-lite/node-geoip/master/data/'
        const dataFiles = [
          fs.path.join(dataPath, 'city.checksum'),
          fs.path.join(dataPath, 'country.checksum')
        ].concat(Object.values(this.dataFiles))
        for (const dataFile of dataFiles) {
          const url = freeUrlPrefix + fs.path.basename(dataFile)
          const database = {
            url: url,
            fileName: fs.path.basename(url)
          }
          await fetch(database)
            .then(async (rv) => await rename(rv.tmpFile, rv.fileName, rv.database))
            .catch((err) => {
              if (err) {
                log(
                  Format.color(`Failed to Download from ${url}`, 'Red'),
                  err
                )
                process.exitCode = 1
              }
            })
        }
        process.exitCode = 0
      } else {
        for (const database of databases) {
          await check(database)
            .then(async (rv) => await fetch(rv.database))
            .then(async (rv) => await extract(rv.tmpFile, rv.fileName, rv.database))
            .then(async (rv) => await processData(rv.database))
            .then(async (rv) => await updateChecksum(rv.database))
            .catch((err) => {
              if (err) {
                log(
                  Format.color('Failed to Update Databases from MaxMind.', 'Red'),
                  err
                )
                process.exitCode = 1
              }
            })
        }
        log(
          Format.color('Successfully Updated Databases from MaxMind.', 'Green')
        )
        if (args.indexOf('debug') !== -1) {
          logYellowBold(
            'Notice: temporary files are not deleted for debug purposes.'
          )
        } else rmR(tmpPath)
        process.exitCode = 0
      }
    }
  }
}
