'use strict'
module.exports = ETag
let crypto = require('crypto')
let Stats =require('kado/lib').Stats

const entityTag = (entity) => {
  if(entity.length === 0){
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  }
  let hash = crypto
    .createHash('sha1')
    .update(entity,'utf8')
    .digest('base64')
    .substring(0,27)

  let len = typeof entity === 'string'
    ? Buffer.byteLength(entity, 'utf8')
    : entity.length

  return '"' + len.toString(16) + '-' + hash + '"'
}
const etag = (entity, options) => {
  if (entity == null) {
    throw new TypeError('argument entity is required')
  }
  let isStats = isstats(entity)
  let weak = options && typeof options.weak === 'boolean'
    ? options.weak
    : isStats
  if (!isStats && typeof entity !== 'string' && !Buffer.isBuffer(entity)) {
    throw new TypeError('argument entity must be string, Buffer, or fs.Stats')
  }
  let tag = isStats
    ? stattag(entity)
    : entitytag(entity)
  return weak
    ? 'W/' + tag
    : tag
}
const isstats = (obj) => {
  if (typeof Stats === 'function' && obj instanceof Stats) {
    return true
  }
  return obj && typeof obj === 'object' &&
    'ctime' in obj && toString.call(obj.ctime) === '[object Date]' &&
    'mtime' in obj && toString.call(obj.mtime) === '[object Date]' &&
    'ino' in obj && typeof obj.ino === 'number' &&
    'size' in obj && typeof obj.size === 'number'
}
const stattag = (stat) => {
  let mtime = stat.mtime.getTime().toString(16)
  let size = stat.size.toString(16)
  return '"' + size + '-' + mtime + '"'
}

