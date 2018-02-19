'use strict';
var P = require('bluebird')
var execSync = require('child_process').execSync
var fs = require('fs')
var glob = require('glob')
var parent = require('infant').parent
var lifecycle = new (require('infant').Lifecycle)()
var LineByLine = require('n-readlines')
var moment = require('moment')
var ObjectManage = require('object-manage')
var path = require('path')
var pkg = require('../package.json')

var config = new ObjectManage()
var interfaces = []


//-----------------
//Begin Overrides
//-----------------

//tell everyone where we are. this trick works because every interface starter
//loads this file first which will be in every process that a module will ever
//load... i suppose if for some reason an interface is created without the use
//of this file it will cause problems.. warning issued!


/**
 * Kado Root Folder
 * @type {String}
 */
process.env.KADO_ROOT = path.dirname(__dirname)


/**
 * Kado Helpers
 * @type {string}
 */
process.env.KADO_BIN = path.resolve(process.env.KADO_ROOT + '/bin')


/**
 * Kado Helpers
 * @type {string}
 */
process.env.KADO_HELPERS = path.resolve(process.env.KADO_ROOT + '/helpers')


/**
 * Kado Interfaces
 * @type {string}
 */
process.env.KADO_INTERFACES = path.resolve(process.env.KADO_ROOT + '/interface')


/**
 * Kado Plugins Path
 * @type {string}
 */
process.env.KADO_MODULES = path.resolve(process.env.KADO_ROOT + '/kado')


/**
 * Kado User Plugins Path
 * @type {string}
 */
process.env.KADO_USER_MODULES = path.resolve(process.env.KADO_ROOT + '/kado')


//dist config schema
config.$load({
  title: 'Kado',
  name: 'kado',
  version: pkg.version,
  //define interfaces
  interface: {
    admin: {
      enabled: false,
      title: 'Admin',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/admin'),
      port: 3000,
      host: null,
      baseUrl: 'http://localhost:3000',
      workers: {
        count: 1,
        maxConnections: 10000
      },
      cookie: {
        secret: '',
        maxAge: 2592000000 //30 days
      }
    },
    api: {
      enabled: false,
      title: 'API',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/api'),
      port: 3001,
      host: null,
      baseUrl: 'http://localhost:3000=1',
      workers: {
        count: 1,
        maxConnections: 10000
      }
    },
    cli: {
      enabled: true,
      title: 'CLI',
      transport: ['tty','system'],
      path: path.resolve(process.env.KADO_INTERFACES + '/bin')
    },
    client: {
      enabled: false,
      title: 'Client',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/client'),
      port: 3003,
      host: null,
      baseUrl: 'http://localhost:3003',
      workers: {
        count: 1,
        maxConnections: 10000
      },
      cookie: {
        secret: '',
        maxAge: 2592000000 //30 days
      }
    },
    main: {
      enabled: false,
      title: 'Main',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/main'),
      port: 3004,
      host: null,
      baseUrl: 'http://localhost:3004',
      workers: {
        count: 1,
        maxConnections: 10000
      },
      cookie: {
        secret: '',
        maxAge: 2592000000 //30 days
      }
    }
  },
  //databases
  db: {
    couchbase: {
      protocol: 'couchbase://',
      host: '127.0.0.1',
      dsnHost: null,
      port: '8091',
      admin: {
        username: '',
        password: ''
      },
      username: '',
      password: '',
      prefix: '',
      connectionTimeout: 60000,
      operationTimeout: 30000,
      bucket: {
        kado: {
          name: 'kado',
          secret: '',
          ramQuotaMB: 512
        }
      }
    },
    couchdb: {
      host: '127.0.0.1',
      port: '5984',
      prefix: '',
      database: 'oose',
      options: {
        secure: false,
        cache: false,
        retries: 3,
        retryTimeout: 10000,
        auth: {
          username: 'oose',
          password: ''
        }
      }
    },
    mysql: {
      name: 'kado',
      host: '127.0.0.1',
      port: 3306,
      user: '',
      password: '',
      logging: false,
      dialect: 'mysql'
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      prefix: 'kado',
      options: {}
    }
  },
  module: {
    blog: {},
    setting: {},
    user: {}
  }
})


/**
 * clone the original config for looking back
 * @type {object}
 */
config.originalConfig = ObjectManage.$clone(config)

//setup lifecycle logging
lifecycle.on('start',function(item){
  console.log('Starting ' + item.title)
})
lifecycle.on('stop',function(item){
  console.log('Stopping ' + item.title)
})
lifecycle.on('online',function(){
  console.log('Startup complete')
})
lifecycle.on('offline',function(){
  console.log('Shutdown complete')
})


/**
 * Export lifecycle object
 * @type {object}
 */
exports.lifecycle = lifecycle


/**
 * Assign config to global
 * @type {ObjectManage}
 */
exports.config = config


/**
 * Load new configuration
 * @param {object} conf
 * @return {ObjectManage}
 */
exports.configure = function(conf){
  exports.config.$load(conf)
  return exports.config
}


/**
 * Get application root
 * @return {string}
 */
exports.root = function(){
  return path.resolve(config.root || path.dirname(__dirname))
}


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
 * @return {string}
 */
exports.pluginDir = function(name){
  if(name) name = 'kado/' + name
  else name = 'kado'
  return exports.path(name)
}


/**
 * Plugin Path
 * @param {string} path
 * @return {string}
 */
exports.pluginPath = function(path){
  if(path) path = 'kado/' + path
  else path = 'kado'
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
    while((line = fd.next())) lines.push(line)
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
    out = out + execSync(cmd,opts)
  } catch(e){
    out = out + exports.printDate(new Date()) + ' [ERROR]: ' + e.message
  }
  return out
}


/**
 * Update plugin path to user modules
 * @param {string} p
 * @return {string}
 */
exports.modulePath = function(p){
  process.env.KADO_USER_MODULES = path.resolve(p)
  return process.env.KADO_USER_MODULES
}


/**
 * Store registered modules
 * @type {Array}
 */
exports.modules = []


/**
 * Start master
 * @param {function} done
 */
exports.start = function(done){
  if(!done) done = function(){}
  console.log('Beginning startup')
  console.log('Scanning modules')
  var loadModule = function(file){
    var module = new ObjectManage(require(file))
    if(!module.name) module.name = path.basename(file)
    module.root = path.dirname(file,'.json')
    if(exports.config.module[module.name]){
      module.$load(exports.config.module[module.name])
    }
    if(module.enabled){
      exports.modules.push(module)
    }
  }
  var sysGlob = process.env.KADO_MODULES + '/**/kado.json'
  var userGlob = process.env.KADO_USER_MODULES + '/**/kado.json'
  //scan system plugins
  new P(function(resolve){
    glob(sysGlob,function(err,files){
      files.forEach(loadModule)
      resolve()
    })
  })
    .then(function(){
      return new P(function(resolve){
        glob(userGlob,function(err,files){
          files.forEach(loadModule)
          resolve()
        })
      })
    })
    .then(function(){
      //scan user modules
      console.log('Found ' + exports.modules.length + ' modules')
      console.log('Scanning for interfaces')
      //register interfaces for startup
      Object.keys(config.interface).forEach(function(name){
        //web panel
        if(
          true === config.$get(['interface',name,'enabled']) &&
          -1 < config.$get(['interface',name,'transport']).indexOf('http')
        ){
          var iface = parent(config.interface[name].path)
          interfaces.push(iface)
          lifecycle.add(
            name,
            function(done){iface.start(done)},
            function(done){iface.stop(done)}
          )
        }
      })
      lifecycle.start(function(err){
        if(err) throw err
        done()
      })
    })
}


/**
 * Stop master
 * @param {function} done
 */
exports.stop = function(done){
  if(!done) done = function(){}
  //start the shutdown process
  console.log('Beginning shutdown')
  lifecycle.stop(function(err){
    if(err) throw err
    done()
  })
}
