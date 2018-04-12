'use strict';
let P = require('bluebird')
let clusterSetup = require('infant').cluster
let fs = require('graceful-fs')


/**
 * Master process
 * @this {object}
 * @param {K} K
 * @param {string} interfaceName
 * @param {string} interfaceRoot
 * @return {object}
 */
exports.master = function(K,interfaceName,interfaceRoot){
  let config = K.config
  let cluster
  let that = this
  that.start = function(done){
    cluster = clusterSetup(
      interfaceRoot + '/worker',
      {
        enhanced: true,
        count: config.interface.admin.workers.count,
        maxConnections: config.interface.admin.workers.maxConnections,
        env: {
          KADO_CONFIG: JSON.stringify(config.$strip())
        }
      }
    )
    cluster.start(function(err){
      done(err)
    })
  }
  that.stop = function(done){
    if(!cluster) return done()
    cluster.stop(function(err){
      done(err)
    })
  }
  return that
}


/**
 * Worker process
 * @this {object}
 * @param {K} K
 * @param {string} interfaceName
 * @param {string} interfaceRoot
 * @return {object}
 */
exports.worker = function(K,interfaceName,interfaceRoot){
  const config = K.config
  if(!interfaceName) interfaceName = 'admin'
  if(!interfaceRoot) interfaceRoot = __dirname
  const that = this
  //third party requirements
  const bodyParser = require('body-parser')
  const compress = require('compression')
  const cookieParser = require('cookie-parser')
  const express = require('express')
  const expressSession = require('express-session')
  const http = require('http')
  const morgan = require('morgan')
  const path = require('path')
  const serveStatic = require('serve-static')
  const SessionStore = require('connect-redis')(expressSession)
  //user space helpers
  const Nav = require('../helpers/Nav')
  //interface context
  let app = that.app = express()
  let server = that.server = http.createServer(app)
  //make some promises
  P.promisifyAll(server)


  /**
   * Navigation helper
   * @type {Nav|exports|module.exports}
   */
  app.nav = new Nav()


  /**
   * Moment standard format
   *  extend moment().format() so that this one place changes everywhere
   *  truthfulness is checked and a placeholder can be provided in emptyString
   * @param {Date} d
   * @param {string} emptyString
   * @return {string}
   */
  app.locals.momentStandardFormat = K.printDate


  /**
   * Global template vars
   * @type {*}
   */
  app.locals = {
    pretty: true,
    basedir: app.get('views'),
    S: require('string'),
    moment: require('moment'),
    //moment no longer supports any method of getting the short timezone
    timezone: ['(',')'].join(
      (new Date()).toLocaleTimeString(
        'en-US',{timeZoneName:'short'}
      ).split(' ').pop()
    ),
    prettyBytes: require('pretty-bytes'),
    appName: config.name,
    appTitle: config.interface[interfaceName].title,
    version: config.version,
    nav: app.nav
  }
  //load middleware
  app.use(compress())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  //set the active nav
  app.use(function(req,res,next){
    res.locals.currentUri = req.originalUrl
    next()
  })
  // development only
  if('development' === app.get('env')){
    app.use(morgan('dev'))
  }
  that.setupScriptServer = function(name,scriptPath){
    if(!scriptPath) scriptPath = name
    //try for a local path first and then a system path as a backup
    let ourScriptPath = path.resolve(
      path.join(interfaceRoot,'..','..','..','..','node_modules',scriptPath))
    //fall back to a local path if we must
    if(!fs.existsSync(ourScriptPath)){
      ourScriptPath = path.resolve(
        path.join(interfaceRoot,'..','..','node_modules',scriptPath))
    }
    if(!fs.existsSync(ourScriptPath)){
      console.log('falling back2',ourScriptPath)
    }
    app.use('/node_modules/' + name,serveStatic(ourScriptPath))
  }
  that.enableHtml = function(callback){
    if(!callback) callback = function(){}
    //npm installed scripts
    //DEFINE external public script packages here, then access them by using
    // /script/<name> such as /script/bootstrap/dist/bootstrap.min.js
    that.setupScriptServer('bootstrap')
    that.setupScriptServer('bootstrap-select')
    that.setupScriptServer('ladda')
    callback(app)
  }


  /**
   * Enable interface session handling
   * @param {function} callback
   */
  that.enableSession = function(callback){
    if(!callback) callback = function(){}
    app.use(cookieParser(config.interface[interfaceName].cookie.secret))
    //inject headers
    app.use(function(req,res,next){
      res.set('Cache-control','no-cache, no-store, must-revalidate')
      res.set('Pragma','no-cache')
      res.set('Expires','0')
      next()
    })
    //session setup
    app.use(expressSession({
      cookie: {
        maxAge: config.interface[interfaceName].cookie.maxAge
      },
      resave: true,
      saveUninitialized: true,
      store: new SessionStore(),
      secret: config.interface[interfaceName].cookie.secret || 'kado'
    }))
    callback(app)
  }


  /**
   * Circular callback to inject setup
   * @param {function} callback
   */
  that.setup = function(callback){
    if(!callback) callback = function(){}
    callback(app)
  }


  /**
   * Start interface
   * @param {function} done
   */
  that.start = function(done){
    K.init(function(){
      //so here it is time to actually scan for modules and this is where i have
      //been on the fence about how to best go about scanning modules, should we
      //have a kado.json with a list of their names and folders or should i scan
      //and try to detect?

      //maybe do some pros and cons. ease for the auto scan, however the auto
      //scan is slower and less predictable, also less controllable. con of
      //manual is that when modules are installed they will need to run the kado
      //cli to turn them selves on which i suppose is acceptable

      //so now loop here and load modules that want to be loaded
      Object.keys(K.modules).forEach(function(modName){
        let mod = K.modules[modName]
        if(mod.enabled){
          let module = require(mod.root)
          if('function' === typeof module[interfaceName]){
            module[interfaceName](K,app)
          } else {
            K.log.warn(
              'Failed to load module interface, no entry function',
              modName
            )
          }
        }
      })
    })
      .then(function(){
        return server.listenAsync(
          +config.interface[interfaceName].port,
          config.interface[interfaceName].host
        )
      })
      .then(done).catch(function(err){
        done(err)
      })
  }


  /**
   * Stop admin
   * @param {function} done
   */
  that.stop = function(done){
    server.close()
    done()
  }
  return that
}
