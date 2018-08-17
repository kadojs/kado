'use strict';
const K = require('../../index')
const interfaceRoot = __dirname
const interfaceName = 'admin'
let worker = K.iface.worker(K,interfaceName,interfaceRoot)
worker.enableSession(function(app){
  let flash = require('connect-flash')
  app.use(flash())
  app.use(function(req,res,next){
    res.locals.flash = worker.flashHandler(req)
    next()
  })
})
worker.setupLang(function(){
  //activate lang pack
  K.log.debug(Object.keys(K.lang.pack).length +
    ' ' + interfaceName + ' language packs activated')
})
worker.enableHtml(function(app){
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
})
worker.setup(function(app){
  //login
  app.post('/login',function(req,res){
    let promises = []
    let authTried = 0
    let invalidLoginError = new Error('Invalid login')
    Object.keys(K.modules).forEach(function(modName){
      if(K.modules.hasOwnProperty(modName)){
        let modConf = K.modules[modName]
        if(modConf.admin && true === modConf.admin.providesAuthentication){
          promises.push(new K.bluebird(function(resolve,reject){
            let mod = require(modConf.root + '/kado.js')
            if('function' === typeof mod.authenticate){
              authTried++
              mod.authenticate(
                K,
                req.body.email,
                req.body.password,
                function(err,authValid,sessionValues){
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
      .then(function(){
        if(0 === authTried){
          K.log.warn('No authentication provider modules enabled')
          throw invalidLoginError
        }
        req.flash('success','Login success')
        res.redirect('/')
      })
      .catch(function(err){
        req.flash('error',err.message || 'Invalid login')
        res.redirect('/login')
      })
  })
  app.get('/login',function(req,res){
    res.render('login')
  })
  app.get('/logout',function(req,res){
    req.session.destroy()
    delete res.locals._staff
    res.redirect(301,'/login')
  })
  //auth protection
  app.use(function(req,res,next){
    //private
    if(!req.session._staff && req.url.indexOf('/login') < 0){
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
  app.get('/',function(req,res){
    res.render('home')
  })
  //add default navbar entries
  app.nav.addGroup('/','Dashboard','home')
})

if(require.main === module){
  K.infant.worker(
    worker.server,
    K.config.name + ':' + interfaceName + ':worker',
    function(done){
      worker.start(done)
    },
    function(done){
      worker.stop(done)
    }
  )
}
