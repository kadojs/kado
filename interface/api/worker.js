'use strict';
var K = require('../../helpers/kado')
var infant = require('infant')
var iface = require('../../helpers/interface')
var interfaceRoot = __dirname
var interfaceName = 'api'
var worker = iface.worker(interfceName,interfaceRoot)
worker.enableSession(function(app){
  var flash = require('connect-flash')
  var compileFile = require('pug').compileFile
  app.use(flash())
  var viewFn = {}
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
worker.setup(function(app){
  //login
  app.post('/login',function(req,res){
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
  infant.worker(
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
