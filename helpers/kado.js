'use strict';
const P = require('bluebird')
const execSync = require('child_process').execSync
const fs = require('fs')
const glob = require('glob')
const infant = require('infant')
const LineByLine = require('n-readlines')
const moment = require('moment')
const ObjectManage = require('object-manage')
const path = require('path')
const pkg = require('../package.json')

let config = new ObjectManage()
let lifecycle = new infant.Lifecycle()
let logger = require('./logger')


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
 * Kado Lang Path
 * @type {string}
 */
process.env.KADO_LANG = path.resolve(process.env.KADO_ROOT + '/lang')


/**
 * Kado Plugins Path
 * @type {string}
 */
process.env.KADO_MODULES = path.resolve(process.env.KADO_ROOT + '/modules')


/**
 * Kado User Plugins Path
 * @type {string}
 */
process.env.KADO_USER_MODULES = path.resolve(
  path.dirname(path.dirname(process.env.KADO_ROOT)) + '/modules')


/**
 * Kado User Lang Path
 * @type {string}
 */
process.env.KADO_USER_LANG = path.resolve(
  path.dirname(path.dirname(process.env.KADO_ROOT)) + '/lang')


//dist config schema
config.$load({
  title: 'Kado',
  name: 'kado',
  version: pkg.version,
  log: {
    dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
  },
  //database connectors
  db: {
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
      title: 'Kado Admin',
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
    cli: {
      enabled: true,
      title: 'Kado CLI',
      transport: ['tty','system'],
      path: path.resolve(process.env.KADO_INTERFACES + '/bin')
    },
    main: {
      enabled: false,
      title: 'Kado Main',
      transport: ['http'],
      path: path.resolve(process.env.KADO_INTERFACES + '/main'),
      port: 3002,
      host: null,
      baseUrl: 'http://localhost:3002',
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
    staff: {}
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
 * Export bluebird for promise support
 * @type {P}
 */
exports.bluebird = P


/**
 * Export Infant for global usage
 * @type {infant}
 */
exports.infant = infant


/**
 * Determine if an incoming reuqest is JSON
 * @param {object} req
 * @return {bool}
 */
exports.isClientJSON = (req) => {
  let accept = req.get('accept') || ''
  return (req.query.json || accept.match('application/json'))
}


/**
 * Export lifecycle object
 * @type {object}
 */
exports.lifecycle = lifecycle


/**
 * Sequelize datatables helper
 * @type {object}
 */
exports.datatable = require('sequelize-datatable')


/**
 * Remove from model by array of ids
 * @type {object}
 */
exports.modelRemoveById = (Model,items) => {
  const validator = require('validator')
  return P.try(() => {
    if(!(items instanceof Array))
      throw new Error('Invalid data passed for record removal')
    let promises = []
    let i = items.length - 1
    for(; i >= 0; i--){
      if(validator.isNumeric('' + items[i])){
        promises.push(Model.destroy({where: {id: items[i]}}))
      }
    }
    return P.all(promises)
  })
}


/**
 * Export ObjectManage object
 * @type {*|ObjectManage}
 */
exports.ObjectManage = ObjectManage


/**
 * Export ObjectManage object
 * @type {*|ObjectManage}
 */
exports.Permission = require('./Permission')


/**
 * Export ObjectManage object
 * @type {*|ObjectManage}
 */
exports.URI = require('./URI')


/**
 * Export ObjectManage object
 * @type {*|ObjectManage}
 */
exports.View = require('./View')


/**
 * Moment standard format
 *  extend moment().format() so that this one place changes everywhere
 *  truthfulness is checked and a placeholder can be provided in emptyString
 * @param {Date} d
 * @param {string} emptyString
 * @return {string}
 */
exports.printDate = (d,emptyString) => {
  return (
    d ? moment(d).format('YYYY-MM-DD hh:mm:ssA')
      : ('string' === typeof emptyString) ? emptyString : 'Never'
  )
}


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
exports.configure = (conf) => {
  exports.config.$load(conf)
  return exports.config
}


/**
 * Get application root
 * @return {string}
 */
exports.root = () => {
  return path.resolve(config.root || path.dirname(__dirname))
}


/**
 * Get the kado folder
 * @return {string}
 */
exports.dir = () => {
  return path.resolve(path.dirname(__dirname))
}


/**
 * Get a kado path
 * @param {string} part
 * @return {string}
 */
exports.path = (part) => {
  if(part) return path.resolve(exports.dir() + '/' + part)
  else return exports.dir()
}


/**
 * Sync tail file
 * @param {string} path
 * @return {string}
 */
exports.tailFile = (path) => {
  let log = ''
  if(fs.existsSync(path)){
    let fd = new LineByLine(path)
    let line, lines = []
    while((line = fd.next())) lines.push(line)
    let start = lines.length - 20
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
exports.appendFile = (path,data) => {
  fs.appendFileSync(path,data)
  return data
}


/**
 * Print date with a nice format
 * @param {Date} d
 * @param {string} emptyString
 * @return {string}
 */
exports.printDate = (d,emptyString) => {
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
exports.execSync = (cmd,opts) => {
  let out = exports.printDate(new Date()) + ' [INFO]: ' + cmd + '\n'
  try {
    out = out + execSync(cmd,opts)
  } catch(e){
    out = out + exports.printDate(new Date()) + ' [ERROR]: ' + e.message
  }
  return out
}


/**
 * Update plugin path to staff modules
 * @param {string} p
 * @return {string}
 */
exports.modulePath = (p) => {
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
 * Language pack structures
 * @type {*|ObjectManage}
 */
exports.lang = require('./lang')


/**
 * Initiate logger and then load over it with context
 * @type {winston.Logger}
 */
exports.log = logger.setupLogger()


/**
 * Init status flag
 * @type {boolean}
 */
exports.initComplete = false


/**
 * Init, scan modules and interfaces
 * @return {P}
 */
exports.init = () => {
  //load any config left in the env for us
  if(process.env.KADO_CONFIG_STRING){
    try {
      let configDelta = JSON.parse(process.env.KADO_CONFIG_STRING)
      exports.log.debug('Adding found environment config')
      config.$load(configDelta)
    } catch(e){
      exports.log.warn('Failed to load env config: ' + e.message)
    }
  }
  //override logger with runtime logger
  exports.log = logger.setupLogger(
    process.pid + '-' + config.name,
    config.log.dateFormat
  )
  //setup lifecycle logging
  lifecycle.on('start',(item) => {
    exports.log.info('Starting ' + item.title)
  })
  lifecycle.on('stop',(item) => {
    exports.log.info('Stopping ' + item.title)
  })
  lifecycle.on('online',() => {
    exports.log.info('Startup complete')
  })
  lifecycle.on('offline',() => {
    exports.log.info('Shutdown complete')
  })
  exports.log.debug('Beginning startup')
  let loadConnector = (file) => {
    let name = path.basename(file,'.js')
    //check if the connector is registered and enabled
    if(config.db[name] && config.db[name].load){
      exports.log.debug(name + ' connector loaded')
      exports.db[name] = require(file)()
    }
  }
  let loadModule = (file) => {
    let module = new ObjectManage(require(file)._kado)
    module.root = path.dirname(file)
    if(exports.config.module[module.name]){
      module.$load(exports.config.module[module.name])
    }
    if(module.enabled){
      if(exports.modules[module.name]){
        exports.log.debug('WARN: Duplicate module registration attempted ' +
          module.name)
      } else {
        exports.modules[module.name] = module.$strip()
      }
    }
  }
  let dbGlob = process.env.KADO_ROOT + '/db/*.js'
  let sysGlob = process.env.KADO_MODULES + '/**/kado.js'
  let userGlob = process.env.KADO_USER_MODULES + '/**/kado.js'
  let doScan = (pattern,handler) => {
    return new P((resolve) => {
      glob(pattern,(err,files) => {
        files.forEach(handler)
        resolve()
      })
    })
  }
  return new P((resolve) => {
    //scan db connectors
    exports.log.debug('Scanning connectors')
    doScan(dbGlob,loadConnector)
      .then(() => {
        //scan system modules
        exports.log.debug('Scanning system modules')
        return doScan(sysGlob,loadModule)
      })
      .then(() => {
        //scan extra modules
        exports.log.debug('Scanning extra modules')
        return doScan(userGlob,loadModule)
      })
      .then(() => {
        exports.log.debug('Found ' + Object.keys(exports.modules).length +
          ' module(s)')
        exports.log.debug('Setting up data storage access')
        Object.keys(exports.modules).forEach((modKey) => {
          if(exports.modules.hasOwnProperty(modKey)){
            let modConf = exports.modules[modKey]
            if(true === modConf.enabled){
              let modFile = modConf.root + '/kado.js'
              let mod = require(modFile)
              if('function' === typeof mod.db){
                mod.db(exports,exports.db)
              }
            }
          }
        })
        let dbEnabled = 0
        Object.keys(exports.db).forEach((dbKey) => {
          if(exports.db.hasOwnProperty(dbKey)){
            let db = exports.db[dbKey]
            if(db.enabled){
              exports.log.debug(dbKey + ' connector enabled')
              dbEnabled++
            }
          }
        })
        exports.log.debug('Found ' + dbEnabled + ' database connectors')
        exports.log.debug('Connecting to found database connectors')
        let dbConnected = 0
        Object.keys(exports.db).forEach((dbKey) => {
          if(exports.db.hasOwnProperty(dbKey)){
            let db = exports.db[dbKey]
            if(db.enabled){
              if('function' === typeof exports.db[dbKey].doConnect){
                exports.db[dbKey].doConnect({sync: false})
                exports.log.debug(dbKey + ' connector connected')
                dbConnected++
              }
            }
          }
        })
        exports.log.debug(dbConnected + ' connected database connectors')
        exports.log.debug('Scanning interfaces')
        //register interfaces for startup
        let addInterface = (name) => {
          exports.interfaces[name] = infant.parent(
            config.interface[name].path,
            {
              fork: {
                env: {
                  NODE_DEBUG: process.env.NODE_DEBUG,
                  KADO_CONFIG_STRING: JSON.stringify(config.$strip())
                }
              }
            })
          lifecycle.add(
            name,
            (done) => {
              exports.interfaces[name].start(done)
            },
            (done) => {
              exports.interfaces[name].stop(done)
            }
          )
        }
        Object.keys(config.interface).forEach((name) => {
          //web panel
          if(
            true === config.$get(['interface',name,'enabled']) &&
            config.$exists(['interface',name,'transport']) &&
            -1 < config.$get(['interface',name,'transport']).indexOf('http')
          )
          {
            //let iface =
            addInterface(name)
          }
        })
        exports.log.debug('Found ' + Object.keys(exports.interfaces).length +
          ' interface(s)')
        exports.initComplete = true
        exports.log.debug('Init complete')
        resolve()
      })
    })
}


/**
 * CLI Access to modules
 * @param {Array} args
 */
exports.cli = (args) => {
  exports.init()
    .then(() => {
      Object.keys(exports.modules).forEach((modName) => {
        let mod = exports.modules[modName]
        if(mod.name === args[2]){
          let module = require(mod.root + '/kado.js')
          module.cli(exports,args)
        }
      })
    })
}


/**
 * Start master
 * @param {function} done
 */
exports.start = (done) => {
  if(!done) done = () => {}
  exports.init()
    .then(() => {
      lifecycle.start((err) => {
        if(err) throw err
        done()
      })
    })
}


/**
 * Stop master
 * @param {function} done
 */
exports.stop = (done) => {
  return new P((resolve) => {
    if(!done) done = () => {}
    //start the shutdown process
    exports.log.info('Beginning shutdown')
    lifecycle.stop((err) => {
      if(err) throw err
      done()
      resolve()
    })
  })

}


/**
 * Rapidly start Kado
 * @param {string} name - name of app
 */
exports.go = (name) => {
  return new P((resolve) => {
    if(process.argv.length <= 2){
      exports.infant.child(
        name,
        (done) => {
          exports.start((err) => {
            if(err) return done(err)
            exports.log.info(name.toUpperCase() + ' started!')
            done()
            resolve()

          })
        },
        (done) => {
          exports.stop((err) => {
            if(err) return done(err)
            exports.log.info(name.toUpperCase() + ' stopped!')
            done()
          })
        }
      )
    } else {
      exports.cli(process.argv)
      resolve()
    }
  })
}
