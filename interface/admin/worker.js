'use strict';
const K = require('../../index')
const interfaceRoot = __dirname
const interfaceName = 'admin'
K.iface.worker(K,interfaceName,interfaceRoot).then((worker) => {
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
  worker.setupPermission(() => {
    //activate lang pack
    K.log.debug(interfaceName + ' permissions system activated')
  })
  worker.enableHtml((app) => {
    const mustacheExpress = require('mustache-express')
    const serveStatic = require('serve-static')
    const path = require('path')
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
    //enable proxy senders
    app.set('trust proxy',true)
    //setup view engine
    app.locals.basedir = path.resolve(interfaceRoot + '/view')
    app.set('view engine','html')
    app.set('views',app.locals.basedir)
    app.set('partials',path.resolve(app.locals.basedir + '/partials'))
    //app.enable('view cache')
    app.engine('html',mustacheExpress())
    //static files
    app.use(serveStatic(interfaceRoot + '/public'))
    //setup default views
    app.view.add('alert',__dirname + '/view/alert.html')
    app.view.add('breadcrumb',__dirname + '/view/breadcrumb.html')
    app.view.add('error',__dirname + '/view/error.html')
    app.view.add('footer',__dirname + '/view/footer.html')
    app.view.add('header',__dirname + '/view/header.html')
    app.view.add('home',__dirname + '/view/home.html')
    app.view.add('login',__dirname + '/view/login.html')
    app.view.add('navbar',__dirname + '/view/navbar.html')
    app.view.add('sidebar',__dirname + '/view/sidebar.html')
  })
  worker.setup((app) => {
    //login
    app.post('/login',(req,res) => {
      let promises = []
      let authTried = 0
      let invalidLoginError = new Error('Invalid login')
      Object.keys(K.modules).forEach((modName) => {
        if(K.modules.hasOwnProperty(modName)){
          let modConf = K.modules[modName]
          if(modConf.admin && true === modConf.admin.providesAuthentication){
            promises.push(new K.bluebird((resolve,reject) => {
              let mod = require(modConf.root + '/kado.js')
              if('function' === typeof mod.authenticate){
                authTried++
                mod.authenticate(
                  K,
                  req.body.email,
                  req.body.password,
                  (err,authValid,sessionValues) => {
                    if(err){
                      return reject(err)
                    }
                    if(true !== authValid){
                      return reject(invalidLoginError)
                    }
                    let session = new K.ObjectManage(req.session._staff || {})
                    session.$load(sessionValues)
                    req.session._staff = session.$strip()
                    resolve()
                  }
                )
              } else {
                reject(invalidLoginError)
              }
            }))
          }
        }
      })
      K.bluebird.all(promises)
        .then(() => {
          if(0 === authTried){
            K.log.warn('No authentication provider modules enabled')
            throw invalidLoginError
          }
          req.flash('success','Login success')
          res.redirect('/')
        })
        .catch((err) => {
          req.flash('error',err.message || 'Invalid login')
          res.redirect('/login')
        })
    })
    app.get('/login',(req,res) => {
      res.render('login')
    })
    app.get('/logout',(req,res) => {
      req.session.destroy()
      delete res.locals._staff
      res.redirect(301,'/login')
    })
    //auth protection
    app.use((req,res,next) => {
      //private
      if(
        (!req.session || !req.session._staff) &&
        req.url.indexOf('/login') < 0
      ){
        res.redirect('/login')
      } else if(req.session._staff){
        res.locals._staff = req.session._staff
        if(res.locals && res.locals._staff) delete res.locals._staff.password
        if(app.locals && app.locals._staff) delete app.locals._staff.password
        next()
      } else {
        next()
      }
    })
    //home page
    app.get('/',(req,res) => {
      res.render('home')
    })
    //add default navbar entries
    app.nav.addGroup('/','Dashboard','home')
  })

  if(require.main === module){
    K.infant.worker(
      worker.server,
      K.config.name + ':' + interfaceName + ':worker',
      (done) => {
        worker.start(done)
      },
      (done) => {
        worker.stop(done)
      }
    )
  }
})
