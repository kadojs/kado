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
    workers: {
      count: 1,
      maxConnections: 10000
    },
    baseUrl: 'http://localhost:3000',
    cookie: {
      secret: '',
      maxAge: 2592000000 //30 days
    }
  },
  seller: {
    enabled: false,
    port: 3005,
    host: null,
    workers: {
      count: 1,
      maxConnections: 10000
    },
    mainBaseUrl: 'http://localhost:3000',
    cookie: {
      secret: '',
      maxAge: 2592000000 //30 days
    }
  },
  main: {
    enabled: false,
    port: 3000,
    host: null,
    theme: 'saleleap',
    homeCategoryWeight: 0,
    workers: {
      count: 1,
      maxConnections: 10000
    },
    cookie: {
      secret: '',
      maxAge: 2592000000 //30 days
    },
    embed: {
      defaultPreviewUrl: 'http://animegg.com/images/animegg-logo.png',
      defaultVideoUrl: 'http://animegg.com/images/animegg-logo.png'
    },
    sitemap: {
      baseUrl: 'http://www.animegg.net',
      maxUrlCount: 50000
    },
    finder: {
      user: 'animegg',
      pass: 'ir2jk95da'
    }
  }
})

//load user config
if(fs.existsSync(__dirname + '/config.local.js')){
  config.$load(require(__dirname + '/config.local.js'))
}

//load instance overrides
if(process.env.KADO_CONFIG){
  config.$load(require(process.env.KADO_CONFIG))
}


/**
 * Export config
 * @type {ObjectManage}
 */
module.exports = config
