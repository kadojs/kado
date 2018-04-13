'use strict';
const K = require('../../helpers/kado')
const interfaceRoot = __dirname
const interfaceName = 'main'
let worker = K.iface.worker(K,interfaceName,interfaceRoot)
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
