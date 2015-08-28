'use strict';
var fs = require('graceful-fs')
var ObjectManage = require('object-manage')

var config
var pkg = require('./package.json')

//setup config object
config = new ObjectManage()
//dist config schema
config.$load({
  title: 'SaleLeap',
  name: 'saleleap',
  version: pkg.version,
  recaptcha: {
    publicKey: '6LfOxgYTAAAAAFCBPZRiCcLAPGSQI1QDQ1sNmjDz',
    privateKey: '6LfOxgYTAAAAAMowULoqQfvX_XT_tW6ny5qaL3Ye'
  },
  //databases
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0,
    prefix: 'saleleap',
    options: {}
  },
  mysql: {
    name: 'saleleap',
    host: '127.0.0.1',
    port: 3306,
    user: '',
    password: '',
    logging: false
  },
  //services
  gmail:{
    service: 'gmail',
    auth: {
      user: 'notify@animegg.com',
      pass: 'notifyanimeggpeople'
    },
    to: 'staff@esited.com',
    from: ' Animegg Alert! <notify@animegg.com>'
  },
  gmailcontact:{
    service: 'gmail',
    auth: {
      user: 'notify@animegg.com',
      pass: 'notifyanimeggpeople'
    },
    to: 'staff@esited.com, bradg07@animegg.com',
    from: ' Animegg Contact Email! <notify@animegg.com>'
  },
  oose: {
    purchaseReferrer: ['animegg.com','animegg.tv','localhost'],
    purchaseCacheLife: 5, //1 minute
    domain: 'cdn.oose.io',
    username: 'animegg',
    password: '4LL_Su(5ggq#yk=6f@q8O^TtL4qtNa7N*$+yD4R_5Lw6H2Px=h=@0Ha1#Q&+6!2c',
    token: ''
  },
  shredder: {
    callback: {
      method: 'post',
      url: 'https://animegg.app.us.org/api/shredder/update',
      rejectUnauthorized: false
    },
    domain: 'shredder.io',
    master: {
      host: 'master.shredder.io',
      port: 5980
    },
    username: 'animegg',
    password: '+r2)00*%!Nc7*5%)4(P7e2)5r$qTx2165k10mNdSK)i2IJ#G)kb)s4M35p(uK+#8',
    token: ''
  },
  crunchyroll:{
    user:'',
    password:''
  },
  //instances
  admin: {
    enabled: false,
    port: 3003,
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
if(process.env.ANIMEGG_CONFIG){
  config.$load(require(process.env.ANIMEGG_CONFIG))
}


/**
 * Export config
 * @type {ObjectManage}
 */
module.exports = config
