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

const fs = require('./FileSystem')
const net = require('./Network')

// eslint-disable-next-line no-control-regex
const reCstrEndNull = /\u0000.*/
const RECORD_SIZE = 10
const RECORD_SIZE6 = 34

const getDataVersion = (dataPath, type) => {
  let rv = 'none'
  const fullFilePath = fs.path.join(dataPath, type + '.checksum')
  if (fs.exists(fullFilePath)) {
    rv = fs.readFileSync(fullFilePath).toString().trim()
  }
  return rv
}

module.exports = class GeoIP {
  static getInstance () {
    return new GeoIP()
  }

  constructor () {
    if (typeof global.geodatadir === 'undefined') {
      this.geodatadir = fs.path.join(__dirname, '/../deps/geoip/')
    } else {
      this.geodatadir = global.geodatadir
    }
    this.dataFiles = {
      city: fs.path.join(this.geodatadir, 'geoip-city.dat'),
      city6: fs.path.join(this.geodatadir, 'geoip-city6.dat'),
      cityNames: fs.path.join(this.geodatadir, 'geoip-city-names.dat'),
      country: fs.path.join(this.geodatadir, 'geoip-country.dat'),
      country6: fs.path.join(this.geodatadir, 'geoip-country6.dat')
    }
    this.dataVersions = {}
    for (const type of ['city', 'country']) {
      this.dataVersions[type] = getDataVersion(this.geodatadir, type)
    }
    this.privateRange4 = [
      [net.inetAtoN('10.0.0.0'), net.inetAtoN('10.255.255.255')],
      [net.inetAtoN('172.16.0.0'), net.inetAtoN('172.31.255.255')],
      [net.inetAtoN('192.168.0.0'), net.inetAtoN('192.168.255.255')]
    ]
    this.conf4 = {
      firstIP: null,
      lastIP: null,
      lastLine: 0,
      locationBuffer: null,
      locationRecordSize: 88,
      mainBuffer: null,
      recordSize: 24
    }
    this.conf6 = {
      firstIP: null,
      lastIP: null,
      lastLine: 0,
      mainBuffer: null,
      recordSize: 48
    }
    this.cache4 = JSON.parse(JSON.stringify(this.conf4))
    this.cache6 = JSON.parse(JSON.stringify(this.conf6))
    this.reloadDataSync()
  }

  static cmp (a, b) {
    return net.compare(a, b)
  }

  static get4mapped (ip) {
    const ipv6 = ip.toLowerCase()
    const v6prefixes = ['0:0:0:0:0:ffff:', '::ffff:']
    for (let i = 0; i < v6prefixes.length; i++) {
      const v6prefix = v6prefixes[i]
      if (ipv6.indexOf(v6prefix) === 0) {
        return ipv6.substring(v6prefix.length)
      }
    }
    return null
  }

  static pretty (n) {
    if (typeof n === 'string') {
      return n
    } else if (typeof n === 'number' || n instanceof Array) {
      return net.inetNtoA(n)
    }
    return n
  }

  assureDataFiles () {
    const dataFiles = [
      fs.path.join(this.geodatadir, 'city.checksum'),
      fs.path.join(this.geodatadir, 'country.checksum')
    ].concat(Object.values(this.dataFiles))
    for (const dataFile of dataFiles) {
      if (!fs.exists(dataFile)) return false
    }
    return true
  }

  async preload (callback) {
    const that = this
    if (!that.assureDataFiles()) return
    let datFile
    let datSize
    const asyncCache = JSON.parse(JSON.stringify(that.conf4))
    // when the preload function receives a callback, do the task asynchronously
    if (typeof callback === 'function') {
      return await new Promise((resolve, reject) => {
        return new Promise((resolve, reject) => {
          fs.open(that.dataFiles.cityNames, 'r').then((file) => {
            datFile = file
            resolve()
          }).catch(reject)
        }).then(() => new Promise((resolve, reject) => {
          fs.stat(that.dataFiles.cityNames).then((stats) => {
            datSize = stats.size
            asyncCache.locationBuffer = Buffer.alloc(datSize)
            resolve()
          }).catch(reject)
        })).then(() => new Promise((resolve) => {
          resolve(fs.readSync(datFile.fd, asyncCache.locationBuffer, 0, datSize, 0))
        })).then(() => new Promise((resolve) => {
          resolve(datFile.close())
        })).then(() => new Promise((resolve, reject) => {
          fs.open(that.dataFiles.city, 'r').then((file) => {
            datFile = file
            resolve()
          }).catch(reject)
        })).then(() => new Promise((resolve, reject) => {
          fs.stat(that.dataFiles.city).then((stats) => {
            datSize = stats.size
            resolve()
          }).catch(reject)
        })).catch((err) => {
          if (err) {
            if (err.code !== 'ENOENT' && err.code !== 'EBADF') {
              return reject(err)
            }
            fs.openSync(that.dataFiles.country, 'r', (err, file) => {
              if (err) {
                return reject(err)
              } else {
                datFile = file
                fs.statSync(datFile, (err, stats) => {
                  if (err) throw err
                  datSize = stats.size
                  asyncCache.recordSize = RECORD_SIZE
                  return resolve()
                })
              }
            })
          } else {
            return resolve()
          }
        })
      }).then(() => new Promise((resolve) => {
        asyncCache.mainBuffer = Buffer.alloc(datSize)
        return new Promise((resolve) => {
          fs.readSync(datFile, asyncCache.mainBuffer, 0, datSize, 0, resolve)
          fs.closeSync(datFile, resolve)
        }).catch((err) => {
          if (err) {
            // keep old cache
          } else {
            asyncCache.lastLine = (datSize / asyncCache.recordSize) - 1
            asyncCache.lastIP = asyncCache.mainBuffer.readUInt32BE((asyncCache.lastLine * asyncCache.recordSize) + 4)
            asyncCache.firstIP = asyncCache.mainBuffer.readUInt32BE(0)
            that.cache4 = asyncCache
          }
          return resolve(err)
        })
      }))
    } else {
      try {
        datSize = fs.statSync(that.dataFiles.cityNames).size
        if (datSize === 0) {
          throw new Error({
            code: 'EMPTY_FILE'
          })
        }
        datFile = fs.openSync(that.dataFiles.cityNames, 'r')
        that.cache4.locationBuffer = Buffer.alloc(datSize)
        fs.readSync(datFile, that.cache4.locationBuffer, 0, datSize, 0)
        fs.closeSync(datFile)
        datSize = fs.statSync(that.dataFiles.city).size
        datFile = fs.openSync(that.dataFiles.city, 'r')
      } catch (err) {
        if (err.code !== 'ENOENT' && err.code !== 'EBADF' && err.code !== 'EMPTY_FILE') {
          throw err
        }
        datSize = fs.statSync(that.dataFiles.country).size
        datFile = fs.openSync(that.dataFiles.country, 'r')
        that.cache4.recordSize = RECORD_SIZE
      }
      that.cache4.mainBuffer = Buffer.alloc(datSize)
      fs.readSync(datFile, that.cache4.mainBuffer, 0, datSize, 0)
      fs.closeSync(datFile)
      that.cache4.lastLine = (datSize / that.cache4.recordSize) - 1
      that.cache4.lastIP = that.cache4.mainBuffer.readUInt32BE((that.cache4.lastLine * that.cache4.recordSize) + 4)
      that.cache4.firstIP = that.cache4.mainBuffer.readUInt32BE(0)
    }
  }

  async preload6 (callback) {
    const that = this
    if (!that.assureDataFiles()) return
    let datFile
    let datSize
    const asyncCache6 = JSON.parse(JSON.stringify(that.conf6))
    // when the preload function receives a callback, do the task asynchronously
    if (typeof callback === 'function') {
      return await new Promise((resolve, reject) => {
        return new Promise((resolve, reject) => {
          fs.open(that.dataFiles.city6, 'r').then((file) => {
            datFile = file
            resolve()
          }).catch(reject)
        }).then(() => new Promise((resolve, reject) => {
          fs.stat(that.dataFiles.city6).then((stats) => {
            datSize = stats.size
            resolve()
          }).catch(reject)
        }).catch((err) => {
          if (err) {
            if (err.code !== 'ENOENT' && err.code !== 'EBADF') {
              return reject(err)
            }
            fs.open(that.dataFiles.country6, 'r').then((file) => {
              datFile = file
              fs.stat(datFile).then((stats) => {
                datSize = stats.size
                asyncCache6.recordSize = RECORD_SIZE6
                resolve()
              }).catch(reject)
            }).catch(reject)
          } else {
            resolve()
          }
        }))
      }).then(() => new Promise((resolve) => {
        asyncCache6.mainBuffer = Buffer.alloc(datSize)
        return new Promise((resolve) => {
          resolve(fs.readSync(datFile.fd, asyncCache6.mainBuffer, 0, datSize, 0))
        }).then(() => new Promise((resolve) => {
          resolve(datFile.close())
        })).catch((err) => {
          if (err) {
            // keep old cache
          } else {
            asyncCache6.lastLine = (datSize / asyncCache6.recordSize) - 1
            that.cache6 = asyncCache6
          }
          return resolve(err)
        })
      }))
    } else {
      try {
        datSize = fs.statSync(that.dataFiles.city6).size
        datFile = fs.openSync(that.dataFiles.city6, 'r')
        if (datSize === 0) {
          throw new Error({
            code: 'EMPTY_FILE'
          })
        }
      } catch (err) {
        if (err.code !== 'ENOENT' && err.code !== 'EBADF' && err.code !== 'EMPTY_FILE') {
          throw err
        }
        datSize = fs.statSync(that.dataFiles.country6).size
        datFile = fs.openSync(that.dataFiles.country6, 'r')
        that.cache6.recordSize = RECORD_SIZE6
      }
      that.cache6.mainBuffer = Buffer.alloc(datSize)
      fs.readSync(datFile, that.cache6.mainBuffer, 0, datSize, 0)
      fs.closeSync(datFile)
      that.cache6.lastLine = (datSize / that.cache6.recordSize) - 1
    }
  }

  lookup4 (ip) {
    const that = this
    let fline = 0
    let floor = that.cache4.lastIP
    let cline = that.cache4.lastLine
    let ceil = that.cache4.firstIP
    let line
    let locId

    const buffer = that.cache4.mainBuffer
    const locBuffer = that.cache4.locationBuffer
    const privateRange = that.privateRange4
    const recordSize = that.cache4.recordSize
    const locRecordSize = that.cache4.locationRecordSize

    let i

    const geodata = {
      range: '',
      country: '',
      region: '',
      eu: '',
      timezone: '',
      city: '',
      ll: [0, 0]
    }

    // outside IPv4 range
    if (ip > that.cache4.lastIP || ip < that.cache4.firstIP) {
      return null
    }

    // private IP
    for (i = 0; i < privateRange.length; i++) {
      if (ip >= privateRange[i][0] && ip <= privateRange[i][1]) {
        return null
      }
    }

    do {
      line = Math.round((cline - fline) / 2) + fline
      floor = buffer.readUInt32BE(line * recordSize)
      ceil = buffer.readUInt32BE((line * recordSize) + 4)

      if (floor <= ip && ceil >= ip) {
        geodata.range = [floor, ceil]

        if (recordSize === RECORD_SIZE) {
          geodata.country = buffer.toString('utf8', (line * recordSize) + 8, (line * recordSize) + 10)
        } else {
          locId = buffer.readUInt32BE((line * recordSize) + 8)
          geodata.country = locBuffer.toString('utf8', (locId * locRecordSize), (locId * locRecordSize) + 2).replace(reCstrEndNull, '')
          geodata.region = locBuffer.toString('utf8', (locId * locRecordSize) + 2, (locId * locRecordSize) + 5).replace(reCstrEndNull, '')
          geodata.metro = locBuffer.readInt32BE((locId * locRecordSize) + 5)
          geodata.ll[0] = buffer.readInt32BE((line * recordSize) + 12) / 10000// latitude
          geodata.ll[1] = buffer.readInt32BE((line * recordSize) + 16) / 10000 // longitude
          geodata.area = buffer.readUInt32BE((line * recordSize) + 20) // longitude
          geodata.eu = locBuffer.toString('utf8', (locId * locRecordSize) + 9, (locId * locRecordSize) + 10).replace(reCstrEndNull, '')
          geodata.timezone = locBuffer.toString('utf8', (locId * locRecordSize) + 10, (locId * locRecordSize) + 42).replace(reCstrEndNull, '')
          geodata.city = locBuffer.toString('utf8', (locId * locRecordSize) + 42, (locId * locRecordSize) + locRecordSize).replace(reCstrEndNull, '')
        }
        return geodata
      } else if (fline === cline) {
        return null
      } else if (fline === (cline - 1)) {
        if (line === fline) {
          fline = cline
        } else {
          cline = fline
        }
      } else if (floor > ip) {
        cline = line
      } else if (ceil < ip) {
        fline = line
      }
    } while (1)
  }

  lookup6 (ip) {
    const that = this
    const buffer = that.cache6.mainBuffer
    const recordSize = that.cache6.recordSize
    const locBuffer = that.cache4.locationBuffer
    const locRecordSize = that.cache4.locationRecordSize

    const geodata = {
      range: '',
      country: '',
      region: '',
      city: '',
      ll: [0, 0]
    }
    const readip = (line, offset) => {
      let ii
      const ip = []

      for (ii = 0; ii < 2; ii++) {
        ip.push(buffer.readUInt32BE((line * recordSize) + (offset * 16) + (ii * 4)))
      }

      return ip
    }

    that.cache6.lastIP = readip(that.cache6.lastLine, 1)
    that.cache6.firstIP = readip(0, 0)

    let fline = 0
    let floor = that.cache6.lastIP
    let cline = that.cache6.lastLine
    let ceil = that.cache6.firstIP
    let line
    let locId

    if (net.compare(ip, that.cache6.lastIP) > 0 || net.compare(ip, that.cache6.firstIP) < 0) {
      return null
    }

    do {
      line = Math.round((cline - fline) / 2) + fline
      floor = readip(line, 0)
      ceil = readip(line, 1)

      if (net.compare(floor, ip) <= 0 && net.compare(ceil, ip) >= 0) {
        if (recordSize === RECORD_SIZE6) {
          geodata.country = buffer.toString('utf8', (line * recordSize) + 32, (line * recordSize) + 34).replace(reCstrEndNull, '')
        } else {
          locId = buffer.readUInt32BE((line * recordSize) + 32)

          geodata.country = locBuffer.toString('utf8', (locId * locRecordSize), (locId * locRecordSize) + 2).replace(reCstrEndNull, '')
          geodata.region = locBuffer.toString('utf8', (locId * locRecordSize) + 2, (locId * locRecordSize) + 5).replace(reCstrEndNull, '')
          geodata.metro = locBuffer.readInt32BE((locId * locRecordSize) + 5)
          geodata.ll[0] = buffer.readInt32BE((line * recordSize) + 36) / 10000// latitude
          geodata.ll[1] = buffer.readInt32BE((line * recordSize) + 40) / 10000 // longitude
          geodata.area = buffer.readUInt32BE((line * recordSize) + 44) // area
          geodata.eu = locBuffer.toString('utf8', (locId * locRecordSize) + 9, (locId * locRecordSize) + 10).replace(reCstrEndNull, '')
          geodata.timezone = locBuffer.toString('utf8', (locId * locRecordSize) + 10, (locId * locRecordSize) + 42).replace(reCstrEndNull, '')
          geodata.city = locBuffer.toString('utf8', (locId * locRecordSize) + 42, (locId * locRecordSize) + locRecordSize).replace(reCstrEndNull, '')
        }
        // We do not currently have detailed region/city info for IPv6, but finally have coords
        return geodata
      } else if (fline === cline) {
        return null
      } else if (fline === (cline - 1)) {
        if (line === fline) {
          fline = cline
        } else {
          cline = fline
        }
      } else if (net.compare(floor, ip) > 0) {
        cline = line
      } else if (net.compare(ceil, ip) < 0) {
        fline = line
      }
    } while (1)
  }

  lookup (ip) {
    const that = this
    if (typeof ip === 'string') {
      ip = ip.trim()
      if (ip.indexOf('[') === 0 && ip.indexOf(']') === ip.length) {
        ip = ip.slice(1, -1)
        if (!ip) ip = '::'
      }
    }
    if (!ip) {
      return null
    } else if (typeof ip === 'number') {
      return that.lookup4(ip)
    } else if (net.isIPv4(ip)) {
      return that.lookup4(net.inetAtoN(ip))
    } else if (net.isIPv6(ip)) {
      const ipv4 = GeoIP.get4mapped(ip)
      if (ipv4) {
        return that.lookup4(net.inetAtoN(ipv4))
      } else {
        return that.lookup6(net.inetAtoN(ip))
      }
    }
    return null
  }

  clear () {
    this.cache4 = JSON.parse(JSON.stringify(this.conf4))
    this.cache6 = JSON.parse(JSON.stringify(this.conf6))
  }

  reloadDataSync () {
    Promise.all([
      this.preload(),
      this.preload6()
    ]).then()
  }

  async reloadData (callback) {
    const that = this
    return await new Promise((resolve) => {
      that.preload(resolve)
    }).then(() => new Promise((resolve) => {
      that.preload6(resolve)
    })).then(callback)
  }
}
