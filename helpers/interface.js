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
          NODE_DEBUG: process.env.NODE_DEBUG,
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
  const locale = require('locale')
  const path = require('path')
  const serveStatic = require('serve-static')
  const SessionStore = require('connect-redis')(expressSession)
  const Nav = require('../helpers/Nav')
  //interface context
  let app = that.app = express()
  let server = that.server = http.createServer(app)
  //make some promises
  P.promisifyAll(server)
  //navigation system
  app.nav = new Nav()
  /**
   * Global template vars
   * @type {*}
   */
  app.locals._basedir = app.get('views')
  app.locals._S = require('string')
  app.locals._moment = require('moment')
  app.locals._printDate = K.printDate
  //moment no longer supports any method of getting the short timezone
  app.locals._timezone = ['(',')'].join(
    (new Date()).toLocaleTimeString(
      'en-US',{timeZoneName:'short'}
    ).split(' ').pop()
  )
  app.locals._toDateString = function(){
    return function(text,render){
      return K.printDate(new Date(render(text)))
    }
  }
  app.locals._isActive = function(){
    return function(text,render){
      let parts = render(text).split(',')
      if(parts.length !== 3) throw new Error('Failed parsing isActive')
      return !!parts[0] ? parts[1] : parts[2]
    }
  }
  app.locals._prettyBytes = require('pretty-bytes')
  app.locals._appName = config.name
  app.locals._appTitle = config.interface[interfaceName].title
  app.locals._version = config.version
  app.locals._currentYear = app.locals._moment().format('YYYY')
  app.locals._nav = app.nav
  //load middleware
  app.use(compress())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  //set the active nav
  app.use(function(req,res,next){
    res.locals.currentUri = req.originalUrl
    next()
  })
  that.setupLang = function(cb){
    //setup language support
    K.lang.scan() //this happens sync no way around it
    app.use(locale(K.lang.getSupportedSC(),K.lang.defaultSC))
    app.use(function(req,res,next){
      if(req.query.lang){
        if(req.session) req.session.lang = req.query.lang
      }
      if(req.session && req.session.lang) req.locale = req.session.lang
      //actually finally load the pack
      res.locals._l = K.lang.getPack(req.locale)
      next()
    })
    if('function' === typeof(cb)) return cb(app)
  }
  // setup local js servers
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
  //flash handler
  that.flashHandler = function(req){
    return function(){
      return function(text){
        let parts = text.split(',')
        if(parts.length > 2) throw new Error('Failure to parse alert template')
        let level = parts[0],tpl = parts[1],out = ''
        let messages = req.flash(level)
        if(messages && messages.length){
          messages.forEach(function(message){
            if(message && message.message && message.href){
              message = message.message +
                '&nbsp; [<a href="' + message.href + '">' +
                (message.name || message.id || 'Click') + '</a>]'
            }
            else if(message && message.message){
              message = message.message
            }
            let msg = '      ' + tpl
            msg = msg.replace('{{level}}',level)
            msg = msg.replace('{{alert}}',message)
            out = out + msg
          })
        }
        return out
      }
    }
  }
  that.enableHtml = function(callback){
    if(!callback) callback = function(){}
    //npm installed scripts
    //DEFINE external public script packages here, then access them by using
    // /script/<name> such as /script/bootstrap/dist/bootstrap.min.js
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
          let modFile = mod.root + '/kado.js'
          let module = require(modFile)
          if('function' === typeof module[interfaceName]){
            module[interfaceName](K,app)
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
      .then(function(){
        done()
      })
      .catch(function(err){
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
