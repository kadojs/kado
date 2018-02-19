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

var sequelize = require('../helpers/sequelize')()

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
  //allow public routes
  if(req.url.match(/\/api\//)) return next()
  //private
  if(!req.session.staff && req.url.indexOf('/login') < 0){
    res.redirect('/login')
  } else {
    app.locals.user = req.session.staff
    next()
  }
})

// development only
if('development' === app.get('env'))
  app.use(morgan('dev'))

//----------------
//private routes
//----------------

//auth
app.post('/login',routes.staff.loginAction)
app.get('/login',routes.staff.login)
app.get('/logout',routes.staff.logout)

//staff
app.post('/staff/list',routes.staff.listAction)
app.post('/staff/save',routes.staff.save)
app.get('/staff/list',routes.staff.list)
app.get('/staff/create',routes.staff.create)
app.get('/staff/edit',routes.staff.edit)
app.get('/staff',function(req,res){ res.redirect('/staff/list') })

//buyer
app.post('/buyer/list',routes.buyer.listAction)
app.get('/buyer/list',routes.buyer.list)
app.get('/buyer/detail',routes.buyer.detail)
app.get('/buyer',function(req,res){ res.redirect('/buyer/list') })

//seller
app.post('/seller/list',routes.seller.listAction)
app.post('/seller/save',routes.seller.save)
app.get('/seller/create',routes.seller.create)
app.get('/seller/edit',routes.seller.edit)
app.get('/seller/list',routes.seller.list)
app.get('/seller/detail',routes.seller.detail)
app.get('/seller',function(req,res){ res.redirect('/seller/list') })

//item
app.post('/item/list',routes.item.listAction)
app.post('/item/save',routes.item.save)
app.get('/item/create',routes.item.create)
app.get('/item/edit',routes.item.edit)
app.get('/item/list',routes.item.list)
app.get('/item',function(req,res){ res.redirect('/item/list') })

//order
app.post('/order/list',routes.order.listAction)
app.post('/order/save',routes.order.save)
app.get('/order/shipped',routes.order.shipped)
app.get('/order/pending',routes.order.pending)
app.get('/order/feedback',routes.order.awaitingFeedback)
app.get('/order/detail',routes.order.detail)
app.get('/order/list',routes.order.list)
app.get('/order',function(req,res){ res.redirect('/order/list') })

//dispute
app.post('/dispute/save',routes.dispute.save)
app.post('/dispute/list',routes.dispute.listAction)
app.post('/dispute/resolved',routes.dispute.listActionResolved)
app.post('/dispute/rejected',routes.dispute.listActionRejected)
app.get('/dispute/list',routes.dispute.list)
app.get('/dispute/resolved',routes.dispute.resolved)
app.get('/dispute/rejected',routes.dispute.rejected)
app.get('/dispute/detail',routes.dispute.detail)
app.get('/dispute',function(req,res){ res.redirect('/dispute/list') })

//pages
app.post('/page/list',routes.page.listAction)
app.post('/page/save',routes.page.save)
app.get('/page/list',routes.page.list)
app.get('/page/create',routes.page.create)
app.get('/page/edit',routes.page.edit)
app.get('/page',function(req,res){ res.redirect('/page/list') })

//blog entries
app.post('/blog/list',routes.blog.listAction)
app.post('/blog/save',routes.blog.save)
app.get('/blog/list',routes.blog.list)
app.get('/blog/create',routes.blog.create)
app.get('/blog/edit',routes.blog.edit)
app.get('/blog',function(req,res){ res.redirect('/blog/list') })

//home page
app.get('/',routes.index)


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
