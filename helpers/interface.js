'use strict';
var K = require('../index')
var P = require('bluebird')
var clusterSetup = require('infant').cluster

//assign config
var config = K.config

/**
 * Master process
 * @param {string} interfaceName
 * @param {string} interfaceRoot
 */
exports.master = function(interfaceName,interfaceRoot){
  var cluster
  var that = this
  that.start =  function(done){
    cluster = clusterSetup(
      interfaceRoot + '/worker',
      {
        enhanced: true,
        count: config.interface.admin.workers.count,
        maxConnections: config.interface.admin.workers.maxConnections
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
 * @param {string} interfaceName
 * @param {string} interfaceRoot
 */
exports.worker = function(interfaceName,interfaceRoot){
  if(!interfaceName) interfaceName = 'admin'
  if(!interfaceRoot) interfaceRoot = __dirname
  var that = this
  //third party requirements
  var bodyParser = require('body-parser')
  var compress = require('compression')
  var cookieParser = require('cookie-parser')
  var express = require('express')
  var expressSession = require('express-session')
  var http = require('http')
  var morgan = require('morgan')
  var path = require('path')
  var serveStatic = require('serve-static')
  var SessionStore = require('express-sql-session')(expressSession)
  //user space helpers
  var Nav = require('../helpers/Nav')
  //interface context
  var app = that.app = express()
  var server = that.server = http.createServer(app)
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
    app.locals.currentUri = req.originalUrl
    next()
  })
  // development only
  if('development' === app.get('env'))
    app.use(morgan('dev'))
  //so here it is time to actually scan for modules and this is where i have been
  //on the fence about how to best go about scanning modules, should we have a
  //modules.json with a list of their names and folders or should i scan and try
  //to detect?

  //maybe do some pros and cons. ease for the auto scan, however the auto scan
  //is slower and less predictable, also less controllable. con of manual is that
  //when modules are installed they will need to run the kado cli to turn them
  //selves on which i suppose is acceptable

  //so now loop here and load modules that want to be loaded
  K.modules.forEach(function(mod){
    if(mod.enabled){
      var module = require(mod.root)
      if(module.admin) module.admin(app)
    }
  })
  that.setupScriptServer = function(name,scriptPath){
    if(!scriptPath) scriptPath = name
    scriptPath = path.resolve(
      path.join(interfaceRoot,'..','..','node_modules',scriptPath))
    app.use('/node_modules/' + name,serveStatic(scriptPath))
  }
  that.enableHtml = function(callback){
    if(!callback) callback = function(){}
    //npm installed scripts
    //DEFINE external public script packages here, then access them by using
    // /script/<name> such as /script/bootstrap/dist/bootstrap.min.js
    that.setupScriptServer('bootstrap')
    that.setupScriptServer('bootstrap-select')
    that.setupScriptServer('html5-boilerplate')
    that.setupScriptServer('ladda')
    callback(app)
  }


  /**
   * Enable interface session handling
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
      store: new SessionStore({
        dialect: 'sqlite3',
        connection: {
          filename: K.path('sessions.s3db')
        },
        table: 'session'
      }),
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
   * Start admin
   * @param {function} done
   */
  that.start = function(done){
    server.listenAsync(+config.interface.admin.port,config.interface.admin.host)
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
