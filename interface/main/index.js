'use strict';
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'main'
var master = iface.master()
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
  worker(
    server,
    config.name + ':main',
    function(done){
      master.start()
      worker.start(done)
    },
    function(done){
      worker.stop()
      master.stop(done)
    }
  )
}
