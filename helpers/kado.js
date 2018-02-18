var execSync = require('child_process').execSync
var fs = require('fs')
var LineByLine = require('n-readlines')
var moment = require('moment')
var path = require('path')


/**
 * Get the kado folder
 * @return {string}
 */
exports.dir = function(){
  return path.resolve(path.dirname(__dirname))
}


/**
 * Get a kado path
 * @param {string} part
 * @return {string}
 */
exports.path = function(part){
  if(part) return path.resolve(exports.dir() + '/' + part)
  else return exports.dir()
}


/**
 * Plugin folder
 * @param {string} name
 */
exports.pluginDir = function(name){
  if(name) name = 'plugins/' + name
  else name = 'plugins'
  return exports.path(name)
}


/**
 * Plugin Path
 * @param {string} path
 */
exports.pluginPath = function(path){
  if(path) path = 'plugins/' + path
  else path = 'plugins'
  return exports.path(path)
}


/**
 * Return a pluggable pluginPath function
 * @param {string} name
 * @return {Function}
 */
exports.pluginPathFunction = function(name){
  var basePath = exports.pluginPath(name)
  return function(part){
    var path = require('path')
    return path.resolve(basePath + '/' + part)
  }
}



/**
 * Sync tail file
 * @param {string} path
 * @return {string}
 */
exports.tailFile = function(path){
  var log = ''
  if(fs.existsSync(path)){
    var fd = new LineByLine(path)
    var line, lines = []
    while(line = fd.next()) lines.push(line)
    var start = lines.length - 20
    if(start < 0) start = 0
    log = lines.splice(start,lines.length-1).join('\n')
  }
  return log
}


/**
 * Append file with data
 * @param {string} path
 * @param {string} data
 * @return {string}
 */
exports.appendFile = function(path,data){
  fs.appendFileSync(path,data)
  return data
}

/**
 * Print date with a nice format
 * @param {Date} d
 * @param {string} emptyString
 * @return {string}
 */
exports.printDate = function(d,emptyString){
  return (
    d ? moment(d).format('YYYY-MM-DD hh:mm:ssA')
      : ('string' === typeof emptyString) ? emptyString : 'Never'
  )
}


/**
 * Execute a command sync and return the appropriate log
 * @param {string} cmd
 * @param {object} opts
 * @return {string} output
 */
exports.execSync = function(cmd,opts){
  var out = exports.printDate(new Date()) + ' [INFO]: ' + cmd + '\n'
  try {
    out = out + execSync(cmd)
  } catch(e){
    out = out + exports.printDate(new Date()) + ' [ERROR]: ' + e.message
  }
  return out
}
