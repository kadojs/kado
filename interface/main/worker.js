'use strict';
/**
 * Kado - Web Application System
 * Copyright © 2015-2019 Bryan Tong, NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado and bound to the MIT license distributed within.
 */
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
K.iface.worker(K,interfaceName,interfaceRoot).then((worker) =>{
  worker.enableHtml((app) =>{
    const mustacheExpress = require('mustache-express')
    const serveStatic = require('serve-static')
    const path = require('path')
    //jquery
    worker.setupScriptServer('jquery')
    //bootstrap
    worker.setupScriptServer('bootstrap')
    worker.setupScriptServer('bootstrap-select')
    //datatables
    worker.setupScriptServer('jszip')
    worker.setupScriptServer('pdfmake')
    worker.setupScriptServer('datatables.net')
    worker.setupScriptServer('datatables.net-bs4')
    worker.setupScriptServer('datatables.net-buttons')
    worker.setupScriptServer('datatables.net-buttons-bs4')
    worker.setupScriptServer('datatables.net-buttons-dt')
    worker.setupScriptServer('datatables.net-colreorder-bs4')
    worker.setupScriptServer('datatables.net-fixedcolumns-bs4')
    worker.setupScriptServer('datatables.net-fixedheader-bs4')
    worker.setupScriptServer('datatables.net-keytable-bs4')
    worker.setupScriptServer('datatables.net-responsive-bs4')
    worker.setupScriptServer('datatables.net-select')
    worker.setupScriptServer('datatables.net-select-bs4')
    //tui-editor
    worker.setupScriptServer('markdown-it')
    worker.setupScriptServer('to-mark')
    worker.setupScriptServer('codemirror')
    worker.setupScriptServer('highlight.js')
    worker.setupScriptServer('squire-rte')
    worker.setupScriptServer('tui-code-snippet')
    worker.setupScriptServer('tui-editor')
    worker.setupScriptServer('to-mark')
    //country flags
    worker.setupScriptServer('flag-icon-css')
    //kado itself for lookups by apps
    worker.setupScriptServer('kado')
    //user defined script server entries
    if(K.config.interface[interfaceName] &&
      K.config.interface[interfaceName].scriptServer
    ){
      K.config.interface[interfaceName].scriptServer.forEach((s) =>{
        worker.setupScriptServer(s)
      })
    }
    //setup view engine
    app.set('trust proxy',true)
    app.locals.basedir = path.resolve(interfaceRoot + '/view')
    app.set('views',app.locals.basedir)
    app.set('viewHelper',(partial,extension) => {
      //see if we have a registered view
      let fp = app.view.get(partial)
      //otherwise use the system path
      if(!fp) fp = path.join(app.locals.basedir,partial + extension)
      return fp
    })
    app.set('view engine','html')
    if('kado' === process.env.DEV){
      app.set('view cache',false)
    } else if(
      K.config.interface[interfaceName].viewCache === true ||
      'production' === process.env.NODE_ENV
    ){
      app.enable('view cache')
    }
    app.engine('html',mustacheExpress())
    //override static servers
    let staticRoot = K.config.interface[interfaceName].staticRoot
    if(staticRoot){
      staticRoot.forEach((r)=>{
        if(K.fs.existsSync(r)){
          app.use(serveStatic(r,app.staticOptions))
        }
      })
    }
    //module static servers
    Object.keys(K.modules).forEach((key)=>{
      let modConf = K.modules[key]
      let staticPath = path.resolve(path.join(
        modConf.root,interfaceName,'public'))
      if(modConf.staticRoot) staticPath = path.resolve(modConf.staticRoot)
      if(!K.fs.existsSync(staticPath)) return
      app.use(serveStatic(staticPath,app.staticOptions))
    })
    //static files
    app.use(serveStatic(interfaceRoot + '/public',app.staticOptions))
  })
  worker.enableSession((app) => {
    let flash = require('connect-flash')
    app.use(flash())
    app.use((req,res,next) => {
      res.locals.flash = worker.flashHandler(req)
      next()
    })
  })
  worker.setupLang(() => {
    //activate lang pack
    K.log.debug(Object.keys(K.lang.pack).length +
      ' ' + interfaceName + ' language packs activated')
  })
  worker.setupUri(() => {
    //activate uri system
    K.log.debug(interfaceName + ' URI system activated')
  })
  worker.setupAsset((app,cb) => {
    let baseUrl = K.config.interface[interfaceName].baseUrl
    const LOAD_SYNC = false
    app.asset.addScript(baseUrl + '/dist/required.js',LOAD_SYNC)
    app.asset.addScript(baseUrl + '/dist/module.js',LOAD_SYNC)
    app.asset.addScript(baseUrl + '/dist/local.js',LOAD_SYNC)
    app.asset.addScript(baseUrl + '/dist/extra.js')
    app.asset.addScript(baseUrl + '/dist/moduleExtra.js')
    app.asset.addScript(baseUrl + '/dist/localExtra.js')
    app.asset.addCss(baseUrl + '/main.css')
    cb()
  })
  worker.setupContent(() => {
    //activate the content system
    K.log.debug(interfaceName + ' Content system activated')
  })
  worker.setup((app) =>{
    let errorView = __dirname + '/view/error.html'
    //if there is an error view override load it early
    if(K.config.interface[interfaceName].override.view.error){
      errorView = K.config.interface[interfaceName].override.view.error
    }
    //setup default views
    app.view.add('alert',__dirname + '/view/alert.html')
    app.view.add('error',errorView)
    app.view.add('footer',__dirname + '/view/footer.html')
    app.view.add('header',__dirname + '/view/header.html')
    app.view.add('home',__dirname + '/view/home.html')
    app.view.add('navbar',__dirname + '/view/navbar.html')
    app.view.add('search',__dirname + '/view/search.html')
    app.view.add('sidebar',__dirname + '/view/sidebar.html')
    //view overrides
    worker.beforeStart(() => {
      let views = K.config.interface[interfaceName].override.view
      if(views){
        for(let v in views){
          if(views.hasOwnProperty(v)) app.view.update(v,views[v])
        }
      }
    })
    //home page
    app.get('/',(req,res) =>{
      if(K.config.module.blog.enabled){
       K.db.sequelize.models.Blog.findAll({
         where: {active: true}, order: [['datePosted','DESC']], limit: 3
       })
         .then((result) => {
           res.render(app.view.get('home'),{blogList: result})
         })
      } else {
        res.render(app.view.get('home'))
      }
    })
    //enable searching
    app.get(app.uri.add('/search'),worker.enableSearch(app))
    //add default navbar entries
    //app.nav.addGroup('/','Dashboard','home')
  })

  if(require.main === module){
    K.infant.worker(
      worker.server,
      K.config.name + ':main',
      (done) =>{
        worker.start(done)
      },
      (done) =>{
        worker.stop(done)
      }
    )
  }
})
