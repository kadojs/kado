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
var moment = require('moment')
require('moment-duration-format')
var morgan = require('morgan')
var RedisStore = require('connect-redis')(expressSession)
var S = require('string')
var titleCase = require('titlecase')
var URI = require('URIjs')

var extend = require('util')._extend
var prism = require('../helpers/prism')
var sequelize = require('../helpers/sequelize')()

var app = express()
var config = require('../config')
var defaultRoutes = require('./routes')
var routes = {}
var server = http.createServer(app)

//assemble routes
try {
  routes = extend(
    defaultRoutes,
    require(__dirname + '/themes/' + config.main.theme + '/routes')
  )
} catch(e){
  routes = defaultRoutes
}

//make some promises
P.promisifyAll(server)

var createAlphabet = function(){
  //create alphabet
  var letterList = [{uri: '0-9', label: '#'}]
  for(var i = 65; i <= 90; i++){
    var letter = String.fromCharCode(i)
    letterList.push({
      uri: letter.toLowerCase(),
      label: letter
    })
  }
  return letterList
}


/**
 * Global template vars
 * @type {object}
 */
app.locals = {
  S: function(val){
    val = '' + val
    return S(val)
  },
  toTitleCase: function(val){
    val = '' + val
    return titleCase(val)
  },
  URI: URI,
  moment: moment,
  app: {
    title: config.title
  },
  letterList: createAlphabet(),
  zlpad: function paddy(n, p, c) {
    var padChar = typeof c !== 'undefined' ? c : '0'
    var pad = new Array(1 + p).join(padChar)
    return (pad + n).slice(-pad.length)
  }
}

// middleware stack
//app.disable('etag')
app.use(compress())
app.set('trust proxy',true)
app.set('views',__dirname + '/themes/' + config.main.theme + '/views')
app.set('view engine','jade')
app.use(express.static(__dirname + '/themes/' + config.main.theme + '/public',{maxAge: 3600000}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser(config.main.cookie.secret))
app.use(flash())
app.use(function(req,res,next){
  res.locals.flash = req.flash.bind(req)
  next()
})
app.use(expressSession({
  cookie: {
    maxAge: config.main.cookie.maxAge || 360000
  },
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(),
  secret: config.main.cookie.secret
}))
app.use(function(req,res,next){
  app.locals.buyer = req.session.buyer || false
  next()
})

//try to find a page matching the uri, if not continue
app.use(function(req,res,next){
  var Page = sequelize.models.Page
  Page.find({where: {uri: req.path}})
    .then(function(result){
      if(!result) return next()
      //found a page render it
      res.render('page',{
        page: result
      })
    })
    .catch(function(err){
      next(err)
    })
})

// development only
if('development' === app.get('env')){
  /**
   * Setup pretty code in dev
   * @type {boolean}
   */
  app.locals.pretty = true
  app.use(morgan('dev'))
}


//home page
app.get('/',routes.index)


//alphabetical list
app.get('/alphabetical/:letter',function(req,res){
  res.redirect(301,'/item/' + req.params.letter)
})

//user functions
app.post('/user/save',routes.user.save)
app.post('/login',routes.user.loginAction)
app.get('/login',routes.user.login)
app.get('/logout',routes.user.logout)
app.get('/createUser',routes.user.create)
app.get('/buyer/profile',routes.buyer.edit)
//app.post('/profile/save',routes.profile.save)

//blog
app.get('/blog',routes.blog.index)


//contact us
app.post('/contact/save',routes.contact.save)
app.get('/contact',routes.contact.index)


//items
app.get('/item/list',routes.item.index)
app.get('/item/detail',routes.item.detail)
app.get('/item/detail',function(req,res){
  res.redirect(301,'/item/detail/' + req.params.id)
})
//categories
app.get('/category/:category',routes.item.category)


//surprise me
app.get('/random',routes.random)

//search
app.get('/search',routes.search.index)
//genres
//app.get('/genre/:tag',routes.show.genre)


//sitemap
app.get('/sitemap_index.xml.gz',routes.sitemap.index)
app.get('/sitemap_static.xml.gz',routes.sitemap.staticPages)
app.get('/sitemap_shows_:offset.xml.gz',routes.sitemap.shows)
app.get('/sitemap_episodes_:offset.xml.gz',routes.sitemap.episodes)

//rss feed
app.get('/rss',routes.rss.index)


/**
 * Start main
 * @param {function} done
 */
exports.start = function(done){
  sequelize.doConnect()
    .then(function(){
      return prism.doConnect()
    })
    .then(function(){
      return server.listenAsync(+config.main.port,config.main.host)
    })
    .then(function(){
      done()
    })
    .catch(done)
}


/**
 * Stop main
 * @param {function} done
 */
exports.stop = function(done){
  sequelize.close()
  server.close()
  done()
}

if(require.main === module){
  worker(
    server,
    config.name + ':main:worker',
    function(done){
      exports.start(done)
    },
    function(done){
      exports.stop(done)
    }
  )
}
