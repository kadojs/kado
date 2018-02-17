'use strict';
var fs = require('graceful-fs')
var ObjectManage = require('object-manage')

var config
var pkg = require('./package.json')

//setup config object
config = new ObjectManage()
//dist config schema
config.$load({
  title: 'Kado',
  name: 'kado',
  version: pkg.version,
  //define interfaces
  interfaces: {
    admin: {title: 'Admin', path: __dirname + '/interfaces/admin', http: true},
    api: {title: 'API', path: __dirname + '/interfaces/api', http: true},
    bin: {title: 'CLI', path: __dirname + '/bin', http: false},
    client: {title: 'Client', path: __dirname + '/interfaces/client', http: true},
    main: {title: 'Main', path: __dirname + '/interfaces/main', http: true}
  },
  //databases
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0,
    prefix: 'kado',
    options: {}
  },
  mysql: {
    name: 'kado',
    host: '127.0.0.1',
    port: 3306,
    user: '',
    password: '',
    logging: false
  },
  //interfaces
  admin: {
    enabled: false,
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
    port: 3001,
    host: null,
    baseUrl: 'http://localhost:3000=1',
    workers: {
      count: 1,
      maxConnections: 10000
    }
  },
  client: {
    enabled: false,
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
})

//load module config
if(fs.existsSync('./modules.json')){
  var modules = require('./modules.json').modules
  modules.forEach(function(modInfo){
    if(modInfo.enabled){
      var module = require(__dirname + '/' + modInfo.path)
      if(module.config && 'function' === typeof module.config){
        module.config(config)
      }
    }
  })
}


/**
 * clone the original config for looking back
 * @type {object}
 */
config.originalConfig = ObjectManage.$clone(config)

//-----------------
//Begin Overrides
//-----------------

//load user config
if(fs.existsSync(__dirname + '/config.local.js')){
  config.$load(require(__dirname + '/config.local.js'))
}

//load instance overrides
if(process.env.KADO_CONFIG){
  config.$load(require(process.env.KADO_CONFIG))
}

//load user settings
if(fs.existsSync(__dirname + '/settings.json')){
  config.$load(require(__dirname + '/settings.json'))
}


//tell everyone where we are. this trick works because every interface starter
//loads this file first which will be in every process that a module will ever
//load... i suppose if for some reason an interface is created without the use
//of this file it will cause problems.. warning issued!


/**
 * Kado Root Folder
 * @type {String}
 */
process.env.KADO_ROOT = __dirname


/**
 * Kado Helpers
 * @type {string}
 */
process.env.KADO_BIN = process.env.KADO_ROOT + '/bin'


/**
 * Kado Helpers
 * @type {string}
 */
process.env.KADO_HELPERS = process.env.KADO_ROOT + '/helpers'


/**
 * Kado Interfaces
 * @type {string}
 */
process.env.KADO_INTERFACES = process.env.KADO_ROOT + '/interfaces'


/**
 * Kado Models
 * @type {string}
 */
process.env.KADO_MODELS = process.env.KADO_ROOT + '/models'


/**
 * Kado Modules File
 * @type {string}
 */
process.env.KADO_MODULES = process.env.KADO_ROOT + '/modules.json'


/**
 * Kado Config File Location
 * @type {String}
 */
process.env.KADO_CONFIG_FILE = __filename





/**
 * Export config
 * @type {ObjectManage}
 */
module.exports = config
