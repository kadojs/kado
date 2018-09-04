'use strict';
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
let worker = K.iface.worker(K,interfaceName,interfaceRoot)
worker.enableSession((app) => {
  let flash = require('connect-flash')
  let compileFile = require('pug').compileFile
  app.use(flash())
  let viewFn = {}
  app.use((req,res,next) => {
    res.locals.flash = req.flash.bind(req)
    req.flashPug = (type,view,vars) => {
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
worker.enableHtml((app) => {
  const serveStatic = require('serve-static')
  const mustacheExpress = require('mustache-express')
  //setup view engine
  app.engine('mustache',mustacheExpress())
  app.set('trust proxy',true)
  app.locals.basedir = interfaceRoot + '/view'
  app.set('views',interfaceRoot + '/' + 'view')
  app.set('view engine','mustache')
  //static files
  app.use(serveStatic(interfaceRoot + '/public'))
})
worker.setup((app) => {
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
    K.config.name + ':main',
    (done) => {
      worker.start(done)
    },
    (done) => {
      worker.stop(done)
    }
  )
}
