'use strict';
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
  interface: {
    admin: {
      enabled: false,
      title: 'Admin',
      transport: ['http'],
      path: __dirname + '/interfaces/admin',
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
      path: __dirname + '/interfaces/api',
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
      path: __dirname + '/bin'
    },
    client: {
      enabled: false,
      title: 'Client',
      transport: ['http'],
      path: __dirname + '/interfaces/client',
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
      path: __dirname + '/interfaces/main',
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
    }
  }
})


/**
 * clone the original config for looking back
 * @type {object}
 */
config.originalConfig = ObjectManage.$clone(config)

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
 * Kado Plugins Path
 * @type {string}
 */
process.env.KADO_MODULES = process.env.KADO_ROOT + '/kado'


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
