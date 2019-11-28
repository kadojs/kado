'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const P = require('bluebird')
const debug = require('debug')('kado:core')
const express = require('express')
const fs = require('fs')
const http = require('http')
const mustache = require('mustache')
const ObjectManage = require('object-manage')
const path = require('path')
const serveStatic = require('serve-static')

//load our subprocesses
const Asset = require('./Asset')
const Connector = require('./Connector')
const Cron = require('./Cron')
const Database = require('./Database')
const Email = require('./Email')
const Event = require('./Event')
const Language = require('./Language')
const Logger = require('./Logger')
const Message = require('./Message')
const Nav = require('./Nav')
const Permission = require('./Permission')
const Profiler = require('./Profiler')
const Router = require('./Router')
const Search = require('./Search')
const View = require('./View')

//single storage
let instance = null

class Kado {
  constructor(config,configLocal){
    this.express = express()
    this.config = new ObjectManage()
    this.envConfigLoaded = false
    this.logger = new Logger()
    this.logger.setup('Kado','MM:HH:SS mm-dd-YYYY')
    this.log = this.logger.getLogger()
    this.determinePaths()
    this.loadDefaultConfig()
    this.setDevMode()
    this.saveOriginalConfig()
    this.asset = new Asset()
    this.connector = new Connector()
    this.cron = new Cron()
    this.database = new Database()
    this.db = {}
    this.email = new Email()
    this.event = new Event()
    this.lang = new Language()
    this.message = new Message()
    this.modules = {}
    this.nav = new Nav()
    this.permission = new Permission()
    this.router = new Router()
    this.search = new Search()
    this.view = new View()
    this.loadEnvConfig()
    this.config.$load(config)
    if(configLocal) this.config.$load(configLocal)
    this.logger.setup(
      process.pid + '-' + this.config.name,this.config.log.dateFormate)
    this.log = this.logger.getLogger()
    this.loadConnector()
    this.loadDatabase()
    this.loadEmail()
    this.registerMethodHandlers()
    this.extendExpress()
    this.mapExpress()
    if(this.config.autoSaveInstance) this.setInstance(this)
    this.loadModules()
    this.loadLanguagePacks()
    this.setupSession()
    this.requireLogin()
    this.setupSearch()
    this.setupMustache()
    if(this.config.cli.enabled) this.routeCli(process.argv)
  }
  setInstance(inst){
    instance = inst
    return instance
  }
  addModule(moduleRoot){
    let name = this.config.instanceName
    let mod = require(moduleRoot)
    mod._kado.root = path.dirname(moduleRoot)
    if('function' === typeof mod.config) mod.config(this)
    if('function' === typeof mod.db) mod.db(this)
    if(name && 'function' === typeof mod[name]) mod[name](this)
    this.modules[mod._kado.name] = mod
  }
  getModule(name){
    return this.modules[name]
  }
  removeModule(name){
    delete this.modules[name]
    return name
  }
  loadModules(){
    let that = this
    //load modules defined in the config
    Object.keys(this.config.module).forEach((modName)=>{
      let modDef = that.config.module[modName]
      if(modDef.enabled === true && modDef.root) that.addModule(modDef.root)
    })
  }
  loadConnector(){
    let that = this
    Object.keys(this.config.connector).forEach((connectorName)=>{
      let connectorConfig = this.config.connector[connectorName]
      if(connectorConfig.load === true){
        let ThisConnector = require(connectorConfig.root)
        that.connector.addConnector(
          connectorName,
          new ThisConnector(connectorConfig)
        )
      }
    })
  }
  loadDatabase(){
    let that = this
    Object.keys(this.config.db).forEach((databaseName)=>{
      let databaseConfig = this.config.db[databaseName]
      if(databaseConfig.load === true && databaseConfig.enabled === true){
        let ThisDatabase = require(databaseConfig.root)
        let thisDb = new ThisDatabase(databaseConfig)
        that.db[databaseName] = thisDb.get()
        that.database.addDatabase(databaseName,thisDb)
      }
    })
  }
  loadEmail(){
    let that = this
    Object.keys(this.config.email).forEach((emailName)=>{
      let emailConfig = this.config.email[emailName]
      if(emailConfig.load === true){
        let ThisEmail = require(emailConfig.root)
        that.email.addHandler(
          emailName,
          new ThisEmail(emailConfig)
        )
      }
    })
  }
  determinePaths(){
    this.KADO_ROOT = path.dirname(__dirname)
    this.KADO_USER_ROOT = path.dirname(path.dirname(this.KADO_ROOT))
    if(!fs.existsSync(this.KADO_USER_ROOT + '/node_modules/kado')){
      this.KADO_USER_ROOT = 0
    }
  }
  loadDefaultConfig(){
    this.config = new ObjectManage()
    this.config.$load(require('./config/default.js'))
  }
  setDevMode(){
    //set dev mode if debug is turned on and the dev option is null
    if(null === this.config.dev &&
      (process.env.NODE_DEBUG === 'kado' || process.env.DEV === 'kado')
    ){
      process.env.NODE_DEBUG = 'kado'
      this.config.dev = true
    }
  }
  saveOriginalConfig(){
    this.originalConfig = ObjectManage.$clone(this.config)
  }
  isClientJSON(req){
    let accept = req.get('accept') || ''
    return (req.query.json || accept.match('application/json'))
  }
  configure(conf){
    this.config.$load(conf)
    return this.config
  }
  helper(name){
    if(!name) throw new Error('Helper required without a name')
    let userHelper = path.resolve(this.KADO_USER_HELPERS +
      '/' + name + '.js')
    let kadoHelper = path.resolve(this.KADO_HELPERS +
      '/' + name + '.js')
    if(!fs.existsSync(userHelper) && fs.existsSync(kadoHelper)) return kadoHelper
    return userHelper
  }
  loadEnvConfig(){
    //load any config left in the env for us
    if(!this.envConfigLoaded && process.env.KADO_CONFIG_STRING){
      try {
        let configDelta = JSON.parse(process.env.KADO_CONFIG_STRING)
        debug('Adding found environment config')
        this.configure(configDelta)
        this.envConfigLoaded = true
      } catch(e){
        exports.log.warn('Failed to load env config: ' + e.message)
      }
    }
  }
  loadLanguagePacks(){
    let that = this
    if(!this.config.languagePacks) this.config.languagePacks = []
    this.config.languagePacks.forEach((packFile)=>{
      if(!fs.existsSync(packFile)) return
      let pack = require(packFile)
      that.lang.addPack(pack._pack_code,pack)
    })
    Object.keys(this.modules).forEach((key)=>{
      let mod = that.modules[key]
      if(!mod || !mod._kado || !(mod._kado.languagePacks instanceof Array))
        return
      mod._kado.languagePacks.forEach((packFile)=>{
        if(!fs.existsSync(packFile)) return
        let pack = require(packFile)
        that.lang.addPack(pack._pack_code,pack)
      })
    })
    this.config.override.languagePacks.forEach((packFile)=>{
      if(!fs.existsSync(packFile)) return
      let pack = require(packFile)
      that.lang.addPack(pack._pack_code,pack)
    })
  }
  /**
   * Define our own render function to handle view lookups
   *  as well as profiling
   * @param {string} tpl Such as blog/list when absolute ignores lookup
   * @param {object} options Same object passed to normal render
   * @param {function} cb Optional callback which will be called instead
   *  of sending the data automatically
   */
  render(tpl,options,cb){
    let that = this
    //apply system resources
    if(this.locals._asset){
      this.locals._css = this.locals._asset.all('text/css')
      this.locals._script = this.locals._asset.all('text/javascript')
    }
    //start the rendering timer
    if(this.locals && this.locals._profiler){
      this.locals._profiler.startRender()
    }
    //check if we should try and lookup the view
    if(!(tpl[0] === '/' || tpl[2] === '\\')){
      tpl = this.locals._view.get(tpl)
    }
    if(!options) options = {}
    this._r(tpl,options,(err,output)=>{
      if(!err && output){
        output = mustache.render(output,{
          _pageProfile: that.locals._profiler.build()
        },null,['<%','%>'])
      }
      if(cb){
        return cb(err,output)
      } else {
        if(err){
          that.status(500)
          that.send({error: err.message})
        } else {
          that.send(output)
        }
      }
    })
  }
  getCurrentNodeMethods(){
    return http.METHODS && http.METHODS.map(function lowerCaseMethod(method) {
      return method.toLowerCase();
    });
  }
  registerMethodHandlers(){
    let that = this
    this.getCurrentNodeMethods().forEach((method)=>{
      that[method] = function(){
        let args = Array.prototype.slice.call(arguments,0)
        that.router.p(args[0]) //register route with kado
        that.express[method].apply(that.express,args)
      }
    })
  }
  extendExpress(){
    const bodyParser = require('body-parser')
    const compress = require('compression')
    const locale = require('locale')
    const mustache = require('mustache')
    let that = this
    //enable proxy senders
    this.express.set('trust proxy',true)
    //configure static server
    this.express.staticOptions = {
      cacheControl: true,
      immutable: true,
      index: false,
      maxAge: 14400
    }
    this.express.locals._basedir = this.express.get('views')
    this.express.locals._moment = require('moment')
    this.express.locals._escapeAndTruncate = () => {
      return (text,render) => {
        let parts = text.split(',')
        if(!parts || 2 !== parts.length){
          throw new Error('Cannot parse escapeAndTruncate')
        }
        let len = +parts[0]
        let tpl = render(parts[1])
        tpl = tpl.replace(/<(?:.|\n)*?>/gm,'') //remove html
        return tpl.substring(0,len) //shorten
      }
    }
    this.express.locals._is = () => {
      return (text,render) => {
        let parts = render(text).split(',')
        if(parts.length !== 3) throw new Error('Failed parsing _is')
        let cond = true
        if('' === parts[0] || 'false' === parts[0] || false === parts[0]){
          cond = false
        }
        return cond ? parts[1] : parts[2]
      }
    }
    this.express.locals._compare = () => {
      return (text,render) => {
        let parts = render(text).split(',')
        if(parts.length !== 4) throw new Error('Failed parsing _compare')
        let cond = true
        if(parts[0] !== parts[1]){
          cond = false
        }
        return cond ? parts[2] : parts[3]
      }
    }
    this.express.locals._capitalize = (string) => {
      return string.replace(/\b\w/g, l => l.toUpperCase())
    }
    this.express.locals._prettyBytes = require('pretty-bytes')
    this.express.locals._appName = this.config.name
    this.express.locals._appTitle = this.config.title
    this.express.locals._version = this.config.version
    this.express.locals._currentYear =
      this.express.locals._moment().format('YYYY')
    //expose translation systems
    this.express.locals._asset = this.asset
    this.express.locals._breadcrumb = this.breadcrumb
    this.express.locals._dev = this.config.dev
    this.express.locals._nav = this.nav
    this.express.locals._uri = this.router
    this.express.locals._view = this.view
    //load profiler and templating override
    this.express.use((req,res,next)=>{
      //start the profiler and track the page conception time
      res.locals._profiler = new Profiler()
      if(this.config.dev === true){
        res.Q = {
          benchmark: true,
          logging: (sql,time) => {
            res.locals._profiler.addQuery(sql,time)
          }
        }
      } else {
        res.Q = {
          benchmark: false,
          logging: false
        }
      }
      res._r = res.render
      res.render = that.render.bind(res)
      next()
    })
    //log request in devs
    if(this.config.dev){
      this.express.use(require('morgan')('dev'))
    }
    //load middleware
    this.express.use(compress())
    this.express.use(bodyParser.urlencoded({extended: true}))
    this.express.use(bodyParser.json())
    //system middleware
    this.express.use((req,res,next) => {
      //expose system vars
      res.locals._asset = that.asset
      res.locals._permission = that.permission
      res.locals._uri = that.router
      res.locals._view = that.view
      res.locals._currentUri = req.originalUrl
      //search query
      res.locals._searchPhrase = req.query.searchPhrase || ''
      //set a default _pageTitle
      if(that.config.pageTitle){
        res.locals._pageTitle = mustache.render(
          that.config.pageTitle,res.locals)
      }
      //permission system
      this.express.use((req,res,next) => {
        let set
        //setup permissions object
        res.locals._p = {allowed: {}, available: []}
        //add a helper function for looking up permissions from views
        res.locals._p.show = () => {return (text,render) => {
          let parts = render(text).split(',')
          if(parts.length !== 2){
            throw new Error('Invalid argument for permission show function')
          }
          if(false === that.permission.allowed(parts[0],set)){
            return ''
          } else {
            return parts[1]
          }
        }}
        //when a permission set is available populate the proper allowed object
        //otherwise populate the entire permission set
        that.permission.all().map((s) => {
          res.locals._p.available.push({
            name: s.name, description: s.description
          })
        })
        if(req.session && req.session._staff && req.session._staff.permission){
          set = req.session._staff.permission
          set.map((s) => {res.locals._p.allowed[s] = s})
        } else {
          that.permission.digest().map((s) => {res.locals._p.allowed[s] = s})
        }
        //load overrides
        let permission = that.config.override.permission
        if(permission){
          permission.available.map((a) => {
            res.locals._p.available.push({
              name: a.name, description: a.description
            })
          })
          for(let a in permission.allowed){
            if(permission.allowed.hasOwnProperty(a)){
              res.locals._p.allowed[a] = a
            }
          }
        }
        //decide whether or not to finish loading the current page
        if(false === that.permission.allowed(req.url,set)){
          res.render(res.locals._view.get('error'),{error: that._l.permdenied})
        } else {
          next()
        }
      })
      next()
    })
    //setup language support
    this.express.use(locale(this.lang.getSupportedSC(),this.lang.defaultSC))
    this.express.use((req,res,next) => {
      if(req.query.lang){
        if(req.session) req.session.lang = req.query.lang
        return res.redirect(301,req.headers.referer || '/')
      }
      if(req.session && req.session.lang) req.locale = req.session.lang
      //actually finally load the pack
      res.locals._l = that._l = that.lang.getPack(
        req.locale,that.config.override.lang)
      res.locals._l._packs = that.lang.all()
      next()
    })
    //uri translation
    this.express.use((req,res,next) => {
      //actually finally load the uri
      res.locals._u = that.router.all()
      next()
    })
    //load uri overrides
    if(this.config.override.uri){
      let uri = this.config.override.uri || {}
      for(let u in uri){
        if(uri.hasOwnProperty(u)){
          this.uri.update(u,uri[u])
        }
      }
    }
    //ensure the addCss and addScript parameters are arrays
    if(!(this.config.addCss instanceof Array)){
      this.config.addCss = [this.config.addCss]
    }
    if(!(this.config.addScript instanceof Array)){
      this.config.addScript = [this.config.addScript]
    }
    //ensure the removeCss and removeScript parameters are arrays
    if(!(this.config.removeCss instanceof Array)){
      this.config.removeCss = [this.config.removeCss]
    }
    if(!(this.config.removeScript instanceof Array)){
      this.config.removeScript = [this.config.removeScript]
    }
    //filter through useless entries and add the rest
    this.config.addCss.filter((r)=> { return r && r.uri })
      .map((r)=>{ that.asset.add(r.uri,'text/css') })
    this.config.removeCss.filter((r)=> { return r && r.uri })
      .map((r)=>{ that.asset.remove(r.uri) })
    this.config.addScript.filter((r)=> { return r && r.uri })
      .map((r)=>{
        let defer = false; if(true === r.defer) defer = true
        that.asset.add(r.uri,'text/javascript',defer)
      })
    this.config.removeScript.filter((r)=> { return r && r.uri })
      .map((r)=>{ that.asset.remove(r.uri) })
  }
  setupMustache(){
    if(!this.config.mustache.enabled) return
    //setup view engine
    const mustacheExpress = require('mustache-express')
    let that = this
    let interfaceRoot = path.resolve(
      path.join(this.KADO_USER_ROOT,this.config.instanceName))
    this.express.locals.basedir = path.resolve(path.join(interfaceRoot,'/view'))
    this.express.set('views',this.express.locals.basedir)
    this.express.set('viewHelper',(partial,extension) => {
      //see if we have a registered view
      let fp = that.view.get(partial)
      //otherwise use the system path
      if(!fp) fp = path.join(that.express.locals.basedir,partial + extension)
      return fp
    })
    this.express.set('view engine','html')
    if('kado' === process.env.DEV || true === this.config.dev){
      this.express.set('view cache',false)
    } else if(
      this.config.mustache.viewCache === true ||
      'production' === process.env.NODE_ENV
    ){
      this.express.enable('view cache')
    }
    this.express.engine('html',mustacheExpress())
    //override static servers
    let staticRoot = this.config.staticRoot
    if(staticRoot && (staticRoot instanceof Array)){
      staticRoot.forEach((r)=>{
        if(fs.existsSync(r)){
          that.express.use(serveStatic(r,that.express.staticOptions))
        }
      })
    }
    //module static servers
    Object.keys(this.modules).forEach((key)=>{
      let mod = that.modules[key]
      if(!mod || !mod.root || !mod.enabled) return
      let staticPath = path.resolve(path.join(
        path.dirname(mod._kado.root),this.config.instanceName,'public'))
      if(mod._kado.staticRoot) staticPath = path.resolve(mod._kado.staticRoot)
      if(!fs.existsSync(staticPath)) return
      that.express.use(serveStatic(staticPath,that.express.staticOptions))
    })
    //static files
    this.use(serveStatic(
      path.resolve(path.join(interfaceRoot,'/public')),
      this.express.staticOptions)
    )
  }
  mapExpress(){
    this.use = this.express.use.bind(this.express)
    this.route = this.express.route.bind(this.express)
    this.engine = this.express.engine.bind(this.express)
    this.param = this.express.param.bind(this.express)
    this.set = this.express.set.bind(this.express)
    this.enabled = this.express.enabled.bind(this.express)
    this.disabled = this.express.disabled.bind(this.express)
    this.enable = this.express.enable.bind(this.express)
    this.disable = this.express.disable.bind(this.express)
    this.all = this.express.all.bind(this.express)
    this.listen = this.express.listen.bind(this.express)
  }
  setupScriptServer(name,scriptPath){
    if(!scriptPath) scriptPath = name
    //try for a local path first and then a system path as a backup
    let ourScriptPath = path.resolve(
      path.join(this.KADO_ROOT,'..','..','node_modules',scriptPath))
    //fall back to a local path if we must
    if(!fs.existsSync(ourScriptPath)){
      ourScriptPath = path.resolve(
        path.join(this.KADO_ROOT,'node_modules',scriptPath))
    }
    if(!fs.existsSync(ourScriptPath) && 'kado' !== name){
      console.log('falling back2',ourScriptPath)
    }
    this.express.use('/node_modules/' + name,serveStatic(
      ourScriptPath,this.express.staticOptions))
  }
  setupSession(){
    if(!this.config.session.enabled) return
    const cookieParser = require('cookie-parser')
    const expressSession = require('express-session')
    const nocache = require('nocache')
    const SequelizeStore = require('connect-session-sequelize')(
      expressSession.Store)
    this.express.use(nocache())
    this.express.use(cookieParser(this.config.session.cookie.secret))
    //session setup
    this.express.use(expressSession({
      cookie: {
        maxAge: this.config.session.cookie.maxAge
      },
      resave: true,
      saveUninitialized: true,
      store: new SequelizeStore({
        db: this.db.sequelize,
        table: this.config.session.tableName || 'Session'
      }),
      secret: this.config.session.cookie.secret
    }))
  }
  requireLogin(){
    if(!this.config.session.enableLogin) return
    //login
    let that = this
    this.express.post('/login',(req,res) => {
      let json = this.isClientJSON(req)
      let promises = []
      let authTried = 0
      let invalidLoginError = new Error('Invalid login')
      Object.keys(that.modules).forEach((modName) => {
        let mod = that.modules[modName]
        promises.push(new P((resolve,reject) => {
          if('function' === typeof mod.authenticate){
            authTried++
            mod.authenticate(
              this,
              req.body.email,
              req.body.password,
              (err,authValid,sessionValues) => {
                if(err) return reject(err)
                if(true !== authValid) return reject(invalidLoginError)
                let session = new ObjectManage(req.session._staff || {})
                session.$load(sessionValues)
                req.session._staff = session.$strip()
                resolve()
              }
            )
          } else { reject(invalidLoginError) }
        }))
      })
      P.all(promises)
        .then(() => {
          if(0 === authTried){
            that.log.warn('No authentication provider modules enabled')
            throw invalidLoginError
          }
          if(json){ res.json({success: 'Login success'}) }
          else {
            req.flash('success','Login success')
            let referrer = req.session._loginReferrer || '/'
            if(referrer.match(/\.(js|jpg|ico|png|html|css)/i)) referrer = '/'
            res.redirect(302,referrer)
          }
        })
        .catch((err) => {
          if(json){ res.json({error: err.message}) }
          else {
            req.flash('error',err.message || 'Invalid login')
            res.redirect(302,'/login')
          }
        })
    })
    this.express.get('/login',(req,res) => {
      res.render('login')
    })
    this.express.get('/logout',(req,res) => {
      req.session.destroy()
      delete res.locals._staff
      res.redirect(302,'/')
    })
    //auth protection
    this.express.use((req,res,next) => {
      //private
      if(
        (!req.session || !req.session._staff) &&
        req.url.indexOf('/login') < 0
      ){
        req.session._loginReferrer = req.url
        res.redirect(302,'/login?c=' + (+new Date()))
      } else if(req.session._staff){
        res.locals._staff = req.session._staff
        if(res.locals && res.locals._staff) delete res.locals._staff.password
        if(this.express.locals && this.express.locals._staff)
          delete this.express.locals._staff.password
        next()
      } else {
        next()
      }
    })
  }
  setupSearch(){
    if(!this.config.search.enabled) return
    this.express.use((req,res,next) => {
      res.locals._searchPhrase = req.query.searchPhrase || ''
      next()
    })
    return (req,res) => {
      this.search.byPhrase(req.query.searchPhrase)
        .then((result) => {
          res.render('search',result)
        })
        .catch((err) => {
          res.render('error',{error: err.message})
        })
    }
  }
  routeCli(args){
    if(args.length < 3) return
    let moduleName = args[2]
    let module = false
    args.splice(2,1)
    process.argv = args
    Object.keys(this.modules).map((m) => {
      if(!module && this.modules[m]._kado.name === moduleName){
        module = this.modules[m]
      }
    })
    if(!module){
      throw new Error('Invalid CLI call, no module found: ' + moduleName)
    }
    require(module._kado.root + '/kado.js').cli(this,args)
  }
  start(){
    let that = this
    return P.try(()=>{
      return that.database.connect()
    })
  }
  stop(){
    this.database.close()
  }
}

//singleton factory
Kado.getInstance = ()=>{
  return instance
}

module.exports = Kado
