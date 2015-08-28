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

var prism = require('../helpers/prism')
var sequelize = require('../helpers/sequelize')()
var shredder = require('../helpers/shredder')

var app = express()
var config = require('../config')
var server = http.createServer(app)
var routes = require('./routes')

//make some promises
P.promisifyAll(server)


/**
 * Global template vars
 * @type {*}
 */
app.locals = {
  pretty: true,
  S: require('string'),
  moment: require('moment'),
  prettyBytes: require('pretty-bytes'),
  version: config.version
}


//setup view enging
app.set('trust proxy',true)
app.set('views',__dirname + '/' + 'views')
app.set('view engine','jade')

//load middleware
app.use(compress())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser(config.seller.cookie.secret))
app.use(function(req,res,next){
  res.set('Cache-control','no-cache, no-store, must-revalidate')
  res.set('Pragma','no-cache')
  res.set('Expires','0')
  next()
})
app.use(expressSession({
  cookie: {
    maxAge: config.seller.cookie.maxAge
  },
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(),
  secret: config.seller.cookie.secret
}))
app.use(flash())
app.use(function(req,res,next){
  res.locals.flash = req.flash.bind(req)
  next()
})
app.use(express.static(__dirname + '/public'))
app.use(function(req,res,next){
  //allow public routes
  if(req.url.match(/\/api\//)) return next()
  //private
  if(!req.session.seller && req.url.indexOf('/login') < 0){
    res.redirect('/login')
  } else {
    app.locals.user = req.session.seller
    next()
  }
})

// development only
if('development' === app.get('env'))
  app.use(morgan('dev'))

//----------------
//public routes
//----------------

//----------------
//private routes
//----------------

//auth
app.post('/login',routes.seller.loginAction)
app.get('/login',routes.seller.login)
app.get('/logout',routes.seller.logout)


//items
app.post('/items/list',routes.item.listAction)
app.post('/items/save',routes.item.save)
app.post('/items/importThumbnail',routes.item.importThumbnailAction)
app.get('/items/list',routes.item.list)
app.get('/items/create',routes.item.create)
app.get('/items/edit',routes.item.edit)
app.get('/items/importThumbnail',routes.item.importThumbnail)
app.get('/items',function(req,res){ res.redirect('/') })

//ledger
app.get('/seller/ledger', routes.ledger.list)

//order
//app.post('/order/list',routes.order.listAction)
app.post('/order/save',routes.order.save)
app.get('/order/shipped',routes.order.shipped)
app.get('/order/pending',routes.order.pending)
app.get('/order/feedback',routes.order.feedback)
app.get('/order/detail',routes.order.detail)
app.get('/order/list',routes.order.list)
app.get('/order',function(req,res){ res.redirect('/order/list') })

//dispute
app.post('/dispute/save',routes.dispute.save)
//app.post('/dispute/list',routes.dispute.listAction)
//app.post('/dispute/resolved',routes.dispute.listActionResolved)
//app.post('/dispute/rejected',routes.dispute.listActionRejected)
app.get('/dispute/list',routes.dispute.list)
app.get('/dispute/resolved',routes.dispute.resolved)
app.get('/dispute/rejected',routes.dispute.rejected)
app.get('/dispute/detail',routes.dispute.detail)
app.get('/dispute',function(req,res){ res.redirect('/dispute/list') })

//home page
app.get('/',routes.index)


/**
 * Start seller
 * @param {function} done
 */
exports.start = function(done){
  sequelize.doConnect()
    .then(function(){
      return prism.doConnect()
    })
    .then(function(){
      return shredder.doConnect()
    })
    .then(function(){
      return server.listenAsync(+config.seller.port,config.seller.host)
    }).then(done).catch(function(err){
      done(err)
    })
}


/**
 * Stop seller
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
    config.name + ':seller:worker',
    function(done){
      exports.start(done)
    },
    function(done){
      exports.stop(done)
    }
  )
}
