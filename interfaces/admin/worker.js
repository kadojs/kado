'use strict';
var P = require('bluebird')
var bodyParser = require('body-parser')
var compress = require('compression')
var cookieParser = require('cookie-parser')
var flash = require('connect-flash')
var express = require('express')
var expressSession = require('express-session')
var http = require('http')
var worker = require('infant').worker
var morgan = require('morgan')
var RedisStore = require('connect-redis')(expressSession)

var Nav = require('../../helpers/Nav')
var sequelize = require('../../helpers/sequelize')()

var app = express()
var config = require('../../config')
var server = http.createServer(app)

var routes = require('./routes')

//make some promises
P.promisifyAll(server)


/**
 * Navigation helper
 * @type {Nav|exports|module.exports}
 */
app.nav = new Nav()


/**
 * Global template vars
 * @type {*}
 */
app.locals = {
  pretty: true,
  S: require('string'),
  moment: require('moment'),
  prettyBytes: require('pretty-bytes'),
  appName: config.name,
  appTitle: config.title,
  version: config.version,
  nav: app.nav,
  viewFolder: __dirname + '/view'
}


//setup view enging
app.set('trust proxy',true)
app.set('views',__dirname + '/' + 'view')
app.set('view engine','jade')

//load middleware
app.use(compress())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser(config.admin.cookie.secret))
app.use(function(req,res,next){
  res.set('Cache-control','no-cache, no-store, must-revalidate')
  res.set('Pragma','no-cache')
  res.set('Expires','0')
  next()
})
app.use(expressSession({
  cookie: {
    maxAge: config.admin.cookie.maxAge
  },
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(),
  secret: config.admin.cookie.secret
}))
app.use(flash())
app.use(function(req,res,next){
  res.locals.flash = req.flash.bind(req)
  next()
})
app.use(express.static(__dirname + '/public'))
app.use(function(req,res,next){
  if(!req.session.user && req.url.indexOf('/login') < 0){
    res.redirect('/login')
  } else {
    app.locals.user = req.session.user
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

//okay do decided on the manual approach, whew life just got easier
var modules = require('../../modules.json').modules

//so now loop here and load modules that want to be loaded
//NOTICE this whole procedure should probably be abstracted
modules.forEach(function(modInfo){
  if(modInfo.enabled){
    var module = require('../../' + modInfo.path)
    if(module.admin) module.admin(app)
  }
})


/**
 * Start admin
 * @param {function} done
 */
exports.start = function(done){
  sequelize.doConnect()
    .then(function(){
      return server.listenAsync(+config.admin.port,config.admin.host)
    }).then(done).catch(function(err){
      done(err)
    })
}


/**
 * Stop admin
 * @param {function} done
 */
exports.stop = function(done){
  //dont wait for this since it will take to long and we are stopping now
  server.close()
  //close our db connection
  sequelize.close()
  //just return now
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
