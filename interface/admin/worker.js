'use strict';
var K = require('../../index')
var P = require('bluebird')
var bodyParser = require('body-parser')
var compress = require('compression')
var cookieParser = require('cookie-parser')
var flash = require('connect-flash')
var compileFile = require('pug').compileFile
var express = require('express')
var expressSession = require('express-session')
var glob = require('glob')
var http = require('http')
var worker = require('infant').worker
var morgan = require('morgan')
var path = require('path')
var serveStatic = require('serve-static')
var SessionStore = require('express-sql-session')(expressSession)

var Nav = require('../../helpers/Nav')

var app = express()
var config = K.config
var server = http.createServer(app)

var routes = require('./routes')

//make some promises
P.promisifyAll(server)


/**
 * Navigation helper
 * @type {Nav|exports|module.exports}
 */
app.nav = new Nav()


//setup view engine
app.set('trust proxy',true)
app.set('views',__dirname + '/' + 'view')
app.set('view engine','pug')


/**
 * Moment standard format
 *  extend moment().format() so that this one place changes everywhere
 *  truthiness is checked and a placeholder can be provided in emptyString
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
  appTitle: config.interface.admin.title,
  version: config.version,
  nav: app.nav
}

//load middleware
app.use(compress())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser(config.interface.admin.cookie.secret))
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
    maxAge: config.interface.admin.cookie.maxAge
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
  secret: config.interface.admin.cookie.secret || 'kado'
}))
app.use(flash())
var viewFn = {}
app.use(function(req,res,next){
  res.locals.flash = req.flash.bind(req)
  req.flashPug = function(type,view,vars){
    if(type && view){
      if(-1 === Object.keys(viewFn).indexOf(view)){
        viewFn[view] =
          compileFile(app.get('views') + '/_alerts/' + view + '.pug',{})
      }
      return req.flash(type,viewFn[view](('object'===typeof vars)?vars:{}))
    } else if(type){
      return req.flash(type)
    } else {
      return req.flash()
    }
  }
  next()
})
//static files
app.use(serveStatic(__dirname + '/public'))
//npm installed scripts
var setupScriptServer = function(name,scriptPath){
  if(!scriptPath) scriptPath = name
  scriptPath = path.resolve(path.join(__dirname,'..','node_modules',scriptPath))
  app.use('/node_modules/' + name,serveStatic(scriptPath))
}
//DEFINE external public script packages here, then access them by using
// /script/<name> such as /script/bootstrap/dist/bootstrap.min.js
setupScriptServer('bootstrap')
setupScriptServer('bootstrap-select')
setupScriptServer('html5-boilerplate')
setupScriptServer('ladda')
//auth protection
app.use(function(req,res,next){
  if((!req.session || !req.session.user) && req.url.indexOf('/login') < 0){
    res.redirect('/login')
  } else {
    if(req.session && req.session.user) app.locals.user = req.session.user
    next()
  }
})

//set the active nav
app.use(function(req,res,next){
  app.locals.currentUri = req.originalUrl
  next()
})

// development only
if('development' === app.get('env'))
  app.use(morgan('dev'))

//login
app.post('/login',routes.loginAction)
app.get('/login',routes.login)
app.get('/logout',routes.logout)

//home page
app.get('/',routes.home)

//add default navbar entries
app.nav.addGroup('/','Dashboard','home')

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


/**
 * Start admin
 * @param {function} done
 */
exports.start = function(done){
  server.listenAsync(+config.interface.admin.port,config.interface.admin.host)
    .then(done).catch(function(err){
      done(err)
    })
}


/**
 * Stop admin
 * @param {function} done
 */
exports.stop = function(done){
  server.close()
  done()
}

if(require.main === module){
  worker(
    server,
    config.name + ':admin:worker',
    function(done){
      exports.start(done)
    },
    function(done){
      exports.stop(done)
    }
  )
}
