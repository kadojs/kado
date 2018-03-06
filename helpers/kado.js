'use strict';
var P = require('bluebird')
var execSync = require('child_process').execSync
var fs = require('fs')
var glob = require('glob')
var infant = require('infant')
var LineByLine = require('n-readlines')
var moment = require('moment')
var ObjectManage = require('object-manage')
var path = require('path')
var pkg = require('../package.json')

var config = new ObjectManage()
var lifecycle = new infant.Lifecycle()
var logger = require('./logger')


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
  log: {
    dateFormat: 'YYYY-MM-DD@HH:mm:ss.SSS'
  },
  //database connectors
  db: {
    couchbase: {
      enabled: false,
      load: false,
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
      enabled: false,
      load: false,
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
    sequelize: {
      enabled: false,
      load: true,
      name: 'kado',
      host: '127.0.0.1',
      port: 3306,
      user: '',
      password: '',
      logging: false,
      dialect: 'mysql'
    },
    sqlite: {
      enabled: false,
      load: true,
      name: 'kado',
      path: null
    },
    redis: {
      enabled: false,
      load: false,
      host: '127.0.0.1',
      port: 6379,
      db: 0,
      prefix: 'kado',
      options: {}
    }
  },
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
      },
      cookie: {
        secret: '',
        maxAge: 2592000000 //30 days
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


/**
 * Interface helper
 */
exports.iface = require('./interface')


/**
 * Export Infant for global usage
 * @type {infant}
 */
exports.infant = infant


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
 * Store database connectors
 * @type {object}
 */
exports.db = {}


/**
 * Store registered interfaces
 * @type {object}
 */
exports.interfaces = {}


/**
 * Store registered modules
 * @type {object}
 */
exports.modules = {}


/**
 * Initiate logger and then load over it with context
 * @type {winston.Logger}
 */
exports.log = logger.setupLogger()


/**
 * Init, scan modules and interfaces
 */
exports.init = function(){
  //override logger with runtime logger
  exports.log = logger.setupLogger(config.name,config.log.dateFormat)
  //setup lifecycle logging
  lifecycle.on('start',function(item){
    exports.log.info('Starting ' + item.title)
  })
  lifecycle.on('stop',function(item){
    exports.log.info('Stopping ' + item.title)
  })
  lifecycle.on('online',function(){
    exports.log.info('Startup complete')
  })
  lifecycle.on('offline',function(){
    exports.log.info('Shutdown complete')
  })
  exports.log.debug('Beginning startup')
  var loadConnector = function(file){
    var name = path.basename(file,'.js')
    //check if the connector is registered and enabled
    if(config.db[name] && config.db[name].load){
      exports.log.debug(name + ' connector loaded')
      exports.db[name] = require(file)()
    }
  }
  var loadModule = function(file){
    var module = new ObjectManage(require(file))
    if(!module.name) module.name = path.basename(file,'.json')
    module.root = path.dirname(file)
    if(exports.config.module[module.name]){
      module.$load(exports.config.module[module.name])
    }
    if(module.enabled){
      if(exports.modules[module.name]){
        exports.log.debug('WARN: Duplicate module registration attempted ' +
          module.name)
      } else {
        exports.modules[module.name] = module
      }
    }
  }
  var dbGlob = process.env.KADO_ROOT + '/db/*.js'
  var sysGlob = process.env.KADO_MODULES + '/**/kado.json'
  var userGlob = process.env.KADO_USER_MODULES + '/**/kado.json'
  var doScan = function(pattern,handler){
    return new P(function(resolve){
      glob(pattern,function(err,files){
        files.forEach(handler)
        resolve()
      })
    })
  }
  //scan db connectors
  exports.log.debug('Scanning connectors')
  return doScan(dbGlob,loadConnector)
    .then(function(){
      //scan system plugins
      exports.log.debug('Scanning system modules')
      return doScan(sysGlob,loadModule)
    })
    .then(function(){
      //scan user modules
      exports.log.debug('Scanning user space modules')
      return doScan(userGlob,loadModule)
    })
    .then(function(){
      exports.log.debug('Found ' + Object.keys(exports.modules).length +
        ' module(s)')
      exports.log.debug('Setting up data storage access')
      Object.keys(exports.modules).forEach(function(modKey){
        if(exports.modules.hasOwnProperty(modKey)){
          var modConf = exports.modules[modKey]
          if(true === modConf.enabled){
            var mod = require(modConf.root)
            if('function' === typeof mod.db){
              mod.db(exports.db)
            }
          }
        }
      })
      var dbEnabled = 0
      Object.keys(exports.db).forEach(function(dbKey){
        if(exports.db.hasOwnProperty(dbKey)){
          var db = exports.db[dbKey]
          if(db.enabled){
            exports.log.debug(db.name + ' connector enabled')
            dbEnabled++
          }
        }
      })
      exports.log.debug('Found ' + dbEnabled + ' database connectors')
      exports.log.debug('Scanning interfaces')
      //register interfaces for startup
      Object.keys(config.interface).forEach(function(name){
        //web panel
        if(
          true === config.$get(['interface',name,'enabled']) &&
          -1 < config.$get(['interface',name,'transport']).indexOf('http')
        )
        {
          var iface = infant.parent(config.interface[name].path)
          exports.interfaces[name] = iface
          lifecycle.add(
            name,
            function(done){
              iface.start(done)
            },
            function(done){
              iface.stop(done)
            }
          )
        }
      })
      exports.log.debug('Found ' + Object.keys(exports.interfaces).length +
        ' interface(s)')
      exports.log.debug('Init complete')
    })
}


/**
 * CLI Access to modules
 * @param args
 */
exports.cli = function(args){
  exports.init()
    .then(function(){
      Object.keys(exports.modules).forEach(function(modName){
        var mod = exports.modules[modName]
        if(mod.name === args[2]){
          var module = require(mod.root)
          module.cli(args)
        }
      })
    })
}


/**
 * Start master
 * @param {function} done
 */
exports.start = function(done){
  if(!done) done = function(){}
  exports.init()
    .then(function(){
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
  exports.log.info('Beginning shutdown')
  lifecycle.stop(function(err){
    if(err) throw err
    done()
  })
}


/**
 * Rapidly start Kado
 * @param {string} name - name of app
 */
exports.go = function(name){
  if(process.argv.length <= 2){
    exports.infant.child(
      name,
      function(done){
        exports.start(function(err){
          if(err) return done(err)
          exports.log.info(name.toUpperCase() + ' started!')
          done()
        })
      },
      function(done){
        exports.stop(function(err){
          if(err) return done(err)
          exports.log.info(name.toUpperCase() + ' stopped!')
          done()
        })
      }
    )
  } else {
    exports.cli(process.argv)
  }
}
