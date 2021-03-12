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
const fs = require('fs')
const fsp = fs.promises

class FileSystem {
  static access (path, mode) { return fsp.access(path, mode) }

  static accessSync (path, mode) { return fs.accessSync(path, mode) }

  static appendFile (path, data, options) {
    return fsp.appendFile(path, data, options)
  }

  static appendFileSync (path, data, options) {
    return fs.appendFileSync(path, data, options)
  }

  static chmod (path, mode) { return fsp.chmod(path, mode) }

  static chmodSync (path, mode) { return fs.chmodSync(path, mode) }

  static chown (path, uid, gid) { return fsp.chown(path, uid, gid) }

  static chownSync (path, uid, gid) { return fs.chownSync(path, uid, gid) }

  static closeSync (fd) { return fs.closeSync(fd) }

  static copyFile (src, dest, flags) { return fsp.copyFile(src, dest, flags) }

  static copyFileSync (src, dst, flags) {
    return fs.copyFileSync(src, dst, flags)
  }

  static createReadStream (path, options) {
    return fs.createReadStream(path, options)
  }

  static createWriteStream (path, options) {
    return fs.createWriteStream(path, options)
  }

  static exists (path) { return fs.existsSync(path) }

  static fchmodSync (fd, mode) { return fs.fchmodSync(fd, mode) }

  static fchownSync (fd, mode) { return fs.fchownSync(fd, mode) }

  static fdatasyncSync (fd) { return fs.fdatasyncSync(fd) }

  static fsyncSync (fd) { return fs.fsyncSync(fd) }

  static ftruncateSync (fd) { return fs.ftruncateSync(fd) }

  static futimesSync (fd, atime, mtime) {
    return fs.futimesSync(fd, atime, mtime)
  }

  static gzipFile (path, options = {}) {
    const Stream = require('stream')
    const zlib = require('zlib')
    const inFileOriginal = path
    const inFile = fs.path.resolve(inFileOriginal)
    if (!FileSystem.exists(inFileOriginal)) {
      throw new Error('File to compress not found')
    }
    const outFile = `${inFile}.gz`
    if (FileSystem.exists(outFile)) throw new Error('Destination exists')
    const inStream = fs.createReadStream(inFile)
    const outStream = fs.createWriteStream(outFile)
    const gzip = zlib.createGzip(options)
    return new Promise((resolve, reject) => {
      Stream.pipeline(inStream, gzip, outStream, (err) => {
        if (err) return reject(err)
        resolve(outFile)
      })
    })
  }

  static gunzipFile (path, options) {
    const Stream = require('stream')
    const zlib = require('zlib')
    const inFileOriginal = path
    const inFile = fs.path.resolve(inFileOriginal)
    if (!FileSystem.exists(inFileOriginal)) {
      throw new Error('File to inflate not found')
    }
    const outFile = inFile.replace(/\.gz$/, '')
    if (FileSystem.exists(outFile)) throw new Error('Destination exists')
    const inStream = fs.createReadStream(inFile)
    const outStream = fs.createWriteStream(outFile)
    const gunzip = zlib.createGunzip(options)
    return new Promise((resolve, reject) => {
      Stream.pipeline(inStream, gunzip, outStream, (err) => {
        if (err) return reject(err)
        resolve(outFile)
      })
    })
  }

  static lchmod (path, mode) { return fsp.lchmod(path, mode) }

  static lchown (path, uid, gid) { return fsp.lchown(path, uid, gid) }

  static link (source, target) { return fsp.link(source, target) }

  static linkSync (source, target) { return fs.linkSync(source, target) }

  static lstat (path, options) { return fsp.lstat(path, options) }

  static lstatSync (path, options) { return fs.lstatSync(path, options) }

  static mkdir (path, options) { return fsp.mkdir(path, options) }

  static mkdirSync (path, options) { return fs.mkdirSync(path, options) }

  static mkdtemp (prefix, options) { return fsp.mkdtemp(prefix, options) }

  static mkdtempSync (prefix, options) {
    return fs.mkdtempSync(prefix, options)
  }

  static open (path, flags, mode) { return fsp.open(path, flags, mode) }

  static opendir (path, options) { return fsp.opendir(path, options) }

  static opendirSync (path, options) { return fs.opendirSync(path, options) }

  static openSync (path, flags, mode) { return fs.openSync(path, flags, mode) }

  static readdir (path, options) { return fsp.readdir(path, options) }

  static readdirSync (path, options) { return fs.readdirSync(path, options) }

  static readFile (path, options) { return fsp.readFile(path, options) }

  static readFileSync (path, options) { return fs.readFileSync(path, options) }

  static readlink (path, options) { return fsp.readlink(path, options) }

  static readlinkSync (path, options) { return fs.readlinkSync(path, options) }

  static readSync (fd, buffer, offset, length, position) {
    return fs.readSync(fd, buffer, offset, length, position)
  }

  static realpath (path, options) { return fsp.realpath(path, options) }

  static realpathSync (path, options) { return fs.realpathSync(path, options) }

  static rename (oldPath, newPath) { return fsp.rename(oldPath, newPath) }

  static renameSync (oldPath, newPath) {
    return fs.renameSync(oldPath, newPath)
  }

  static rmdir (path, options) { return fsp.rmdir(path, options) }

  static rmdirSync (path, options) { return fs.rmdirSync(path, options) }

  static stat (path, options) { return fsp.stat(path, options) }

  static statSync (path, options) { return fs.statSync(path, options) }

  static symlink (target, path, type) { return fsp.symlink(target, path, type) }

  static symlinkSync (target, path, type) {
    return fs.symlinkSync(target, path, type)
  }

  static truncate (path, len) { return fsp.truncate(path, len) }

  static truncateSync (path, len) { return fs.truncateSync(path, len) }

  static unlink (path) { return fsp.unlink(path) }

  static unlinkSync (path) { return fs.unlinkSync(path) }

  static unwatchFile (filename, listener) {
    return fs.unwatchFile(filename, listener)
  }

  static utimes (path, atime, mtime) { return fsp.utimes(path, atime, mtime) }

  static utimesSync (path, atime, mtime) {
    return fs.utimeSync(path, atime, mtime)
  }

  static watch (filename, options, listener) {
    return fs.watch(filename, options, listener)
  }

  static watchFile (filename, options, listener) {
    return fs.watchFile(filename, options, listener)
  }

  static writeFile (file, data, options) {
    return fsp.writeFile(file, data, options)
  }

  static writeFileSync (file, data, options) {
    return fs.writeFileSync(file, data, options)
  }

  static writeSync (fd, buffer, offset, length, position) {
    return fs.writeSync(fd, buffer, offset, length, position)
  }
}
FileSystem.Stats = fs.Stats
FileSystem.Dirent = fs.Dirent
FileSystem.path = require('path')
module.exports = FileSystem
