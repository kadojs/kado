'use strict';
var K = require('../../helpers/kado')
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'api'
var worker = iface.worker(interfaceName,interfaceRoot)
worker.enableSession()
worker.setup(function(app){
  //login
  app.post('/login',function(req,res){
    res.json({status: 'error', message: 'Not implemented'})
    /*
    User.login(req.body.email,req.body.password)
      .then(function(user){
        req.session.user = user.dataValues
        res.redirect(301,'/')
      })
      .catch(function(e){
        console.log(e)
        req.flash('error','Invalid login')
        res.redirect(301,'/login')
      })
     */
  })
  app.get('/login',function(req,res){
    res.render('login')
  })
  app.get('/logout',function(req,res){
    delete req.session.user
    res.redirect(301,'/login')
  })
  //auth protection
  app.use(function(req,res,next){
    if((!req.session || !req.session.user) && req.url.indexOf('/login') < 0){
      res.redirect('/login')
    } else {
      if(req.session && req.session.user) app.locals.user = req.session.user
      next()
    }
  })
  //home page
  app.get('/',function(req,res){
    res.render('home')
  })
})

if(require.main === module){
  K.infant.worker(
    worker.server,
    K.config.name + ':' + interfaceName,
    function(done){
      worker.start(done)
    },
    function(done){
      worker.stop(done)
    }
  )
}
