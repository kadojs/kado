'use strict';
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
let worker = K.iface.worker(K,interfaceName,interfaceRoot)
worker.enableSession(function(app){
  let flash = require('connect-flash')
  let compileFile = require('pug').compileFile
  app.use(flash())
  let viewFn = {}
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
})
worker.enableHtml(function(app){
  let serveStatic = require('serve-static')
  //setup view engine
  app.set('trust proxy',true)
  app.locals.basedir = interfaceRoot + '/view'
  app.set('views',interfaceRoot + '/' + 'view')
  app.set('view engine','pug')
  //static files
  app.use(serveStatic(interfaceRoot + '/public'))
})
worker.setup(function(app){
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
    K.config.name + ':main',
    function(done){
      worker.start(done)
    },
    function(done){
      worker.stop(done)
    }
  )
}
