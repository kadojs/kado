'use strict';
var infant = require('infant')
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'main'
var worker = iface.worker(interfaceName,interfaceRoot)
worker.enableHtml(function(app){
  //setup view engine
  app.set('trust proxy',true)
  app.set('views',interfaceRoot + '/' + 'view') //VARIABLE
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
  infant.worker(
    worker.server,
    config.name + ':main',
    function(done){
      worker.start(done)
    },
    function(done){
      worker.stop(done)
    }
  )
}
